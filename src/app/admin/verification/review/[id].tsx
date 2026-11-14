import { getLiveVerificationApplication, openLiveVerificationDocument, decideLiveVerificationApplication, type LiveVerificationApplication } from '@/services/admin/verificationBackend';
import { useAdminActor } from '@/services/admin/actor';
import { adminColors, adminType } from '@/theme/admin';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REQUIRED_DOCUMENTS = ['id_front', 'id_back', 'selfie', 'proof_of_address'];

function documentLabel(kind: string): string {
  return kind.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function LiveVerificationReviewScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const actor = useAdminActor();
  const [application, setApplication] = useState<LiveVerificationApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [documentBusy, setDocumentBusy] = useState<string | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const missingDocuments = useMemo(() => {
    const uploaded = new Set(application?.documents.map((document) => document.document_kind) ?? []);
    return REQUIRED_DOCUMENTS.filter((kind) => !uploaded.has(kind));
  }, [application]);

  const refresh = useCallback(async () => {
    if (!id) {
      setError('The application ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setApplication(await getLiveVerificationApplication(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the application.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const openDocument = async (documentId: string, storagePath: string) => {
    if (!id) return;
    setDocumentBusy(documentId);
    setError(null);
    try {
      const signedUrl = await openLiveVerificationDocument({
        applicationId: id,
        documentId,
        storagePath,
      });
      setDocumentUrls((previous) => ({ ...previous, [documentId]: signedUrl }));
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Could not open this document.');
    } finally {
      setDocumentBusy(null);
    }
  };

  const decide = async (decision: 'approved' | 'rejected' | 'more_information_requested') => {
    if (!id) return;
    if (!actor) {
      setError('Sign in with an administrator account to review this application.');
      return;
    }
    const trimmedReason = reason.trim();
    if (decision === 'approved' && missingDocuments.length > 0) {
      setError(`The application is missing required documents: ${missingDocuments.map(documentLabel).join(', ')}.`);
      return;
    }
    if (decision !== 'approved' && trimmedReason.length < 8) {
      setError('Enter a reason of at least 8 characters.');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await decideLiveVerificationApplication({
        applicationId: id,
        decision,
        reason: trimmedReason || undefined,
      });
      setNotice(
        decision === 'approved'
          ? 'Application approved. The landlord can now manage properties.'
          : decision === 'rejected'
            ? 'Application rejected.'
            : 'More information requested.'
      );
      await refresh();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not save this decision.');
    } finally {
      setBusy(false);
    }
  };

  const isPending = application?.status === 'pending'
    || application?.status === 'under_review'
    || application?.status === 'more_information_requested';

  return (
    <View style={{ flex: 1, backgroundColor: adminColors.background }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 18,
          gap: 14,
        }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ paddingVertical: 8 }}>
          <Text style={{ color: adminColors.primary, fontWeight: '700' }}>‹ Back to verification queue</Text>
        </Pressable>

        {loading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator color={adminColors.primary} />
            <Text style={{ color: adminColors.textSecondary, marginTop: 10 }}>Loading application…</Text>
          </View>
        ) : error && !application ? (
          <View style={cardStyle}>
            <Text style={titleStyle}>Application unavailable</Text>
            <Text style={bodyStyle}>{error}</Text>
            <ActionButton label="Retry" onPress={() => void refresh()} />
          </View>
        ) : application ? (
          <>
            <View style={cardStyle}>
              <Text style={titleStyle}>Landlord verification</Text>
              <Text style={bodyStyle}>Status: {documentLabel(application.status)}</Text>
              <Text style={bodyStyle}>Submitted: {new Date(application.submitted_at).toLocaleString()}</Text>
              <Text style={bodyStyle}>Name: {application.full_name}</Text>
              <Text style={bodyStyle}>Email: {application.email}</Text>
              <Text style={bodyStyle}>Phone: {application.phone}</Text>
              <Text style={bodyStyle}>City: {application.city}</Text>
              <Text style={bodyStyle}>Address: {application.address || 'Not provided'}</Text>
              {application.reviewer_notes ? (
                <Text style={[bodyStyle, { color: adminColors.danger }]}>
                  Previous review note: {application.reviewer_notes}
                </Text>
              ) : null}
            </View>

            <View style={cardStyle}>
              <Text style={titleStyle}>Identity documents</Text>
              <Text style={bodyStyle}>
                Files are held in a private bucket. Opening a document is recorded in the admin audit log.
              </Text>
              {application.documents.map((document) => {
                const signedUrl = documentUrls[document.id];
                return (
                  <View key={document.id} style={{ gap: 8, paddingTop: 12 }}>
                    <Text style={bodyStyle}>
                      {documentLabel(document.document_kind)} · {document.status}
                    </Text>
                    {signedUrl ? (
                      <Image
                        source={{ uri: signedUrl }}
                        contentFit="contain"
                        style={{ width: '100%', height: 240, backgroundColor: '#F3F4F6', borderRadius: 10 }}
                      />
                    ) : (
                      <ActionButton
                        label={documentBusy === document.id ? 'Opening…' : 'Open securely'}
                        disabled={Boolean(documentBusy)}
                        onPress={() => void openDocument(document.id, document.storage_path)}
                      />
                    )}
                  </View>
                );
              })}
              {missingDocuments.length > 0 ? (
                <Text style={[bodyStyle, { color: adminColors.danger, marginTop: 10 }]}>
                  Missing: {missingDocuments.map(documentLabel).join(', ')}
                </Text>
              ) : null}
            </View>

            {isPending && actor ? (
              <View style={cardStyle}>
                <Text style={titleStyle}>Admin decision</Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Reason or review note (required to reject/request information)"
                  placeholderTextColor={adminColors.textMuted}
                  multiline
                  accessibilityLabel="Admin review note"
                  style={{
                    minHeight: 88,
                    borderWidth: 1,
                    borderColor: adminColors.border,
                    borderRadius: 10,
                    padding: 12,
                    color: adminColors.textPrimary,
                    textAlignVertical: 'top',
                  }}
                />
                <ActionButton label="Approve" disabled={busy || missingDocuments.length > 0} onPress={() => void decide('approved')} />
                <ActionButton label="Request more information" variant="secondary" disabled={busy} onPress={() => void decide('more_information_requested')} />
                <ActionButton label="Reject" variant="danger" disabled={busy} onPress={() => void decide('rejected')} />
              </View>
            ) : null}

            {notice ? <Text style={[bodyStyle, { color: adminColors.success }]}>{notice}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={[bodyStyle, { color: adminColors.danger }]}>{error}</Text> : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const backgroundColor = variant === 'danger'
    ? adminColors.danger
    : variant === 'secondary'
      ? adminColors.cream
      : adminColors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor,
        borderRadius: 10,
        alignItems: 'center',
        padding: 13,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
      })}
    >
      <Text style={{ color: variant === 'secondary' ? adminColors.primary : '#FFFFFF', fontSize: adminType.small, fontWeight: '700' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const cardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: adminColors.border,
  padding: 16,
  gap: 10,
};

const titleStyle = {
  color: adminColors.textPrimary,
  fontSize: adminType.title,
  fontWeight: '800' as const,
};

const bodyStyle = {
  color: adminColors.textSecondary,
  fontSize: adminType.small,
  lineHeight: 20,
};
