import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { adminColors, adminRadii, adminType, toneStyles } from '@/theme/admin';
import { formatDateTime, formatFileSize } from '@/services/admin/format';
import type { VerificationDocument } from '@/services/admin/types';
import { AdminButton, FieldRow, StatusPill, type IconName } from './primitives';

/* ------------------------------------------------------- confirmation sheet */

export interface ModalField {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  minChars?: number;
  multiline?: boolean;
  initialValue?: string;
}

interface ConfirmActionModalProps {
  visible: boolean;
  title: string;
  description: string;
  /** Consequences rendered as a checklist before the administrator commits. */
  impact?: string[];
  fields?: ModalField[];
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  icon?: IconName;
  busy?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: (values: Record<string, string>) => void;
}

type ConfirmSheetProps = Omit<ConfirmActionModalProps, 'visible'>;

/**
 * Sheet body. It is only mounted while the modal is visible, so opening it
 * always starts from a clean set of field values — no state reset in an effect.
 */
function ConfirmSheet({
  title,
  description,
  impact,
  fields = [],
  confirmLabel,
  tone = 'primary',
  icon = 'checkmark-circle-outline',
  busy = false,
  errorMessage,
  onCancel,
  onConfirm,
}: ConfirmSheetProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) initial[field.key] = field.initialValue ?? '';
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const palette = toneStyles[tone === 'danger' ? 'danger' : 'primary'];

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      const value = (values[field.key] ?? '').trim();
      if (field.required && !value) {
        nextErrors[field.key] = 'This field is required.';
        continue;
      }
      if (field.minChars && value && value.length < field.minChars) {
        nextErrors[field.key] = `Please write at least ${field.minChars} characters.`;
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onConfirm(values);
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.sheetContent}
    >
      <View style={[styles.sheetIcon, { backgroundColor: palette.background }]}>
        <Ionicons name={icon} size={24} color={palette.foreground} />
      </View>

      <Text style={styles.sheetTitle}>{title}</Text>
      <Text style={styles.sheetDescription}>{description}</Text>

      {impact && impact.length > 0 ? (
        <View style={styles.impactList}>
          {impact.map((item) => (
            <View key={item} style={styles.impactRow}>
              <Ionicons name="arrow-forward" size={13} color={adminColors.primary} />
              <Text style={styles.impactText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {fields.map((field) => (
        <View key={field.key} style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required ? <Text style={styles.requiredMark}> *</Text> : null}
          </Text>
          <TextInput
            value={values[field.key] ?? ''}
            onChangeText={(text) => setValues((previous) => ({ ...previous, [field.key]: text }))}
            placeholder={field.placeholder}
            placeholderTextColor={adminColors.textMuted}
            multiline={field.multiline}
            style={[styles.input, field.multiline && styles.inputMultiline]}
            accessibilityLabel={field.label}
            textAlignVertical={field.multiline ? 'top' : 'center'}
          />
          {errors[field.key] ? (
            <Text style={styles.fieldError}>{errors[field.key]}</Text>
          ) : field.hint ? (
            <Text style={styles.fieldHint}>{field.hint}</Text>
          ) : null}
        </View>
      ))}

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={adminColors.danger} />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.auditNote}>
        <Ionicons name="shield-checkmark-outline" size={15} color={adminColors.infoText} />
        <Text style={styles.auditNoteText}>
          Confirming records your administrator name, the timestamp and your reason in the audit log,
          and notifies the landlord of the outcome.
        </Text>
      </View>

      <View style={styles.actions}>
        <AdminButton
          label="Cancel"
          variant="secondary"
          onPress={onCancel}
          disabled={busy}
          style={styles.actionButton}
        />
        <AdminButton
          label={confirmLabel}
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onPress={submit}
          loading={busy}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

/**
 * Confirmation sheet with a checklist of consequences and validated fields.
 * Mounted only while `visible` is true so every opening starts fresh.
 */
export function ConfirmActionModal({ visible, ...rest }: ConfirmActionModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={rest.busy ? undefined : rest.onCancel}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {visible ? <ConfirmSheet key="confirm-sheet" {...rest} /> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ---------------------------------------------------------- secure document */

interface SecureDocumentModalProps {
  visible: boolean;
  document: VerificationDocument | null;
  applicationReference?: string;
  landlordName?: string;
  busy?: boolean;
  errorMessage?: string | null;
  /** Set once the audited open request has completed. */
  viewedAt?: string | null;
  onClose: () => void;
  onOpen: () => void;
}

/**
 * Audited document viewer. Documents never travel as URLs — this sheet shows
 * the stored metadata and an access log entry after an administrator opens the
 * file through the permission-checked service call.
 */
export function SecureDocumentModal({
  visible,
  document,
  applicationReference,
  landlordName,
  busy = false,
  errorMessage,
  viewedAt,
  onClose,
  onOpen,
}: SecureDocumentModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={busy ? undefined : onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.docHeader}>
                <View style={[styles.sheetIcon, { backgroundColor: adminColors.lightBlueSoft }]}>
                  <Ionicons name="document-lock-outline" size={24} color={adminColors.infoText} />
                </View>
                <View style={styles.docHeaderText}>
                  <Text style={styles.sheetTitle}>Restricted document</Text>
                  {applicationReference ? (
                    <Text style={styles.sheetDescription}>
                      {applicationReference}
                      {landlordName ? ` · ${landlordName}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>

              {document ? (
                <View style={styles.docMeta}>
                  <FieldRow label="Document" value={document.label} icon="document-text-outline" />
                  <View style={styles.docDivider} />
                  <FieldRow label="File" value={`${document.mimeType} · ${formatFileSize(document.sizeBytes)}`} icon="attach-outline" />
                  <View style={styles.docDivider} />
                  <FieldRow label="Uploaded" value={formatDateTime(document.uploadedAt)} icon="time-outline" />
                  <View style={styles.docDivider} />
                  <View style={styles.docStatusRow}>
                    <Text style={styles.fieldLabelStatic}>Status</Text>
                    <StatusPill label={document.status.replace('_', ' ')} tone={document.status === 'uploaded' ? 'success' : document.status === 'missing' ? 'neutral' : 'warning'} />
                  </View>
                </View>
              ) : null}

              <View style={styles.preview}>
                <Ionicons name="eye-off-outline" size={30} color={adminColors.textMuted} />
                <Text style={styles.previewTitle}>
                  {viewedAt ? 'Secure preview opened' : 'Preview locked'}
                </Text>
                <Text style={styles.previewText}>
                  {viewedAt
                    ? 'The file is served from the private documents bucket for this review only. It is never published as a public link, and this view has been recorded in the audit log.'
                    : 'Identity documents live in a private bucket. Tap “Open document” to request access — the request is permission-checked and logged.'}
                </Text>
                {viewedAt ? <StatusPill label={`Access logged ${formatDateTime(viewedAt)}`} tone="info" icon="shield-checkmark-outline" /> : null}
              </View>

              {document?.note ? (
                <View style={styles.docNote}>
                  <Ionicons name="information-circle-outline" size={15} color={adminColors.infoText} />
                  <Text style={styles.docNoteText}>{document.note}</Text>
                </View>
              ) : null}

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={adminColors.danger} />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <AdminButton
                  label={viewedAt ? 'Close' : 'Cancel'}
                  variant="secondary"
                  onPress={onClose}
                  disabled={busy}
                  style={styles.actionButton}
                />
                {viewedAt ? null : (
                  <AdminButton
                    label="Open document"
                    icon="lock-open-outline"
                    variant="info"
                    onPress={onOpen}
                    loading={busy}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------- sheet */

interface InfoSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function InfoSheet({ visible, title, onClose, children }: InfoSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.sheetWrap}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.infoHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={10}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color={adminColors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              {children}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: adminColors.overlay,
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: adminColors.surface,
    borderTopLeftRadius: adminRadii.xl,
    borderTopRightRadius: adminRadii.xl,
    borderWidth: 1,
    borderColor: adminColors.border,
    maxHeight: '90%',
  },
  sheetContent: {
    padding: 20,
    gap: 14,
  },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: adminRadii.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  sheetTitle: {
    fontSize: adminType.title,
    fontWeight: '800',
    color: adminColors.textPrimary,
    letterSpacing: -0.3,
  },
  sheetDescription: {
    fontSize: adminType.body,
    color: adminColors.textSecondary,
    lineHeight: 20,
  },
  impactList: {
    gap: 8,
    backgroundColor: adminColors.cream,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: '#EBCBA8',
    padding: 14,
  },
  impactRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  impactText: {
    flex: 1,
    fontSize: adminType.small,
    color: adminColors.darkBrown,
    lineHeight: 18,
    fontWeight: '600',
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: adminType.small,
    fontWeight: '700',
    color: adminColors.textPrimary,
  },
  requiredMark: {
    color: adminColors.danger,
  },
  fieldLabelStatic: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: adminColors.borderStrong,
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: adminType.body,
    color: adminColors.textPrimary,
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: 12,
  },
  fieldError: {
    fontSize: adminType.small,
    color: adminColors.danger,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: adminColors.dangerBg,
    borderWidth: 1,
    borderColor: '#EFCFC9',
    borderRadius: adminRadii.sm,
    padding: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: adminType.small,
    color: adminColors.danger,
    fontWeight: '600',
    lineHeight: 18,
  },
  auditNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: adminColors.lightBlueSoft,
    borderWidth: 1,
    borderColor: '#C4E0EF',
    borderRadius: adminRadii.sm,
    padding: 12,
  },
  auditNoteText: {
    flex: 1,
    fontSize: adminType.tiny,
    color: adminColors.infoText,
    lineHeight: 17,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  docHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  docHeaderText: {
    flex: 1,
    gap: 2,
  },
  docMeta: {
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  docDivider: {
    height: 1,
    backgroundColor: adminColors.border,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  preview: {
    alignItems: 'center',
    gap: 8,
    padding: 20,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: adminColors.borderStrong,
    backgroundColor: adminColors.neutralBg,
  },
  previewTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  previewText: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  docNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: adminColors.lightBlueSoft,
    borderRadius: adminRadii.sm,
    padding: 12,
  },
  docNoteText: {
    flex: 1,
    fontSize: adminType.small,
    color: adminColors.infoText,
    lineHeight: 18,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
});
