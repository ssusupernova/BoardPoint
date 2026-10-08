import {
  useEffect,
  useRef,
  useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/auth/BrandHeader/BrandHeader';
import { ErrorBanner } from '@/components/auth/ErrorBanner/ErrorBanner';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { SaveConfirmationModal } from '@/components/renter/SaveConfirmationModal/SaveConfirmationModal';
import { LocationSection } from '@/components/renter/sections/LocationSection/LocationSection';
import { EssentialsSection } from '@/components/renter/sections/EssentialsSection/EssentialsSection';
import { PreferencesSection } from '@/components/renter/sections/PreferencesSection/PreferencesSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { useAuthSession } from '@/services/auth';
import {
  AMENITY_OPTIONS,
  OCCUPANT_OPTIONS,
  ROOM_TYPE_OPTIONS,
  createDefaultForm,
  hasErrors,
  loadChecklist,
  optionLabel,
  saveChecklist,
  toChecklist,
  toForm,
  validateChecklist,
  type ChecklistErrors,
  type ChecklistForm,
  } from '@/services/checklist';
import { colors
} from '@/theme';
import { formatNumber } from '@/utils/date';
import { styles } from './PreferencesScreen.styles';

type SectionKey = 'location' | 'essentials';

const LOCATION_ERROR_KEYS = ['originLabel', 'radiusKm'];

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();

  const [form, setForm] = useState<ChecklistForm>(() => createDefaultForm());
  const [errors, setErrors] = useState<ChecklistErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const innerTopRef = useRef(0);
  const sectionTopRef = useRef<Record<SectionKey, number>>({ location: 0, essentials: 0 });

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void loadChecklist(userId).then((saved) => {
      if (!cancelled && saved) setForm(toForm(saved));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onPatch = (patch: Partial<ChecklistForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    if (submitAttempted) {
      setErrors((current) => {
        const next: ChecklistErrors = { ...current };
        for (const key of Object.keys(patch) as (keyof ChecklistErrors)[]) {
          delete next[key];
        }
        return next;
      });
    }
  };

  const scrollToSection = (section: SectionKey) => {
    const y = innerTopRef.current + sectionTopRef.current[section] - 24;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    });
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const nextErrors = validateChecklist(form);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      const firstIsLocation = Object.keys(nextErrors).some((key) =>
        LOCATION_ERROR_KEYS.includes(key)
      );
      scrollToSection(firstIsLocation ? 'location' : 'essentials');
      return;
    }

    if (!userId) return;
    setSaving(true);
    try {
      await saveChecklist(userId, toChecklist(form));
      setSavedVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const firstName = session ? session.user.fullName.split(' ')[0] || session.user.username : '';

  const roomLabel =
    ROOM_TYPE_OPTIONS.find((option) => option.value === form.roomType)?.label ?? 'Room';
  const occupantsLabel =
    OCCUPANT_OPTIONS.find((option) => option.value === form.occupants)?.label ?? form.occupants;
  const minDigits = form.minRent.replace(/[^0-9]/g, '');
  const maxDigits = form.maxRent.replace(/[^0-9]/g, '');
  const budget = minDigits && maxDigits ? ` · ₱${formatNumber(minDigits)}–₱${formatNumber(maxDigits)} / month` : '';
  const mustLabels = form.mustHave
    .map((id) => optionLabel(AMENITY_OPTIONS, id))
    .filter((label): label is string => !!label);
  const overflow = mustLabels.length > 4 ? ` +${mustLabels.length - 4} more` : '';
  const summaryLine1 = `${roomLabel} for ${occupantsLabel}${budget}`;
  const summaryLine2 = `Within ${form.radiusKm} km${
    mustLabels.length ? ` · ${mustLabels.slice(0, 4).join(' + ')}${overflow}` : ''
  }`;

  const showBanner = submitAttempted && hasErrors(errors);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.decorativeCircle} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View
            style={styles.inner}
            onLayout={(event) => {
              innerTopRef.current = event.nativeEvent.layout.y;
            }}
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>

            <View style={styles.badgeWrap}>
              <StatusBadge text="Account created · One last step" />
            </View>

            <View style={styles.brandWrap}>
              <BrandHeader />
            </View>

            <Text style={styles.heroTitle}>Set your room preferences</Text>
            <Text style={styles.heroSubtitle}>
              Tell us what matters most{firstName ? `, ${firstName}` : ''}. Every room is checked
              against this list — closest matches come first.
            </Text>

            {showBanner ? (
              <ErrorBanner message="Almost there — fix the highlighted fields below, then save again." />
            ) : null}

            <View
              style={styles.section}
              onLayout={(event) => {
                sectionTopRef.current.location = event.nativeEvent.layout.y;
              }}
            >
              <LocationSection form={form} errors={errors} onPatch={onPatch} />
            </View>

            <View
              style={styles.section}
              onLayout={(event) => {
                sectionTopRef.current.essentials = event.nativeEvent.layout.y;
              }}
            >
              <EssentialsSection form={form} errors={errors} onPatch={onPatch} />
            </View>

            <View style={styles.section}>
              <PreferencesSection form={form} onPatch={onPatch} />
            </View>

            <Text style={styles.previewLabel}>YOUR RESULTS WILL MATCH</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewPrimary}>{summaryLine1}</Text>
              <Text style={styles.previewSecondary}>{summaryLine2}</Text>
            </View>

            <View style={styles.submitWrap}>
              <PrimaryButton
                label="Save my checklist"
                onPress={() => void handleSubmit()}
                loading={saving}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SaveConfirmationModal visible={savedVisible} onClose={() => setSavedVisible(false)} />
    </View>
  );
}

