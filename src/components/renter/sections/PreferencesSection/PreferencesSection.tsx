import {
  Text,
  View
} from 'react-native';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { CheckboxCard } from '@/components/renter/CheckboxCard/CheckboxCard';
import {
  AMENITY_OPTIONS,
  HOUSE_RULE_OPTIONS,
  NICE_TO_HAVE_OPTIONS,
  type ChecklistForm,
  } from '@/services/checklist';

import { styles } from './PreferencesSection.styles';

type Props = {
  form: ChecklistForm;
  onPatch: (patch: Partial<ChecklistForm>) => void;
};

type ListKey = 'mustHave' | 'nice' | 'rules';

export function PreferencesSection({ form, onPatch }: Props) {
  const toggle = (key: ListKey, id: string) => {
    const current = form[key];
    onPatch({
      [key]: current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    } as Partial<ChecklistForm>);
  };

  return (
    <View>
      <SectionHeader
        title="Must-have amenities"
        helper="Selected items are required. Choose only essentials."
        tag="Non-negotiable"
      />
      <View style={styles.grid}>
        {AMENITY_OPTIONS.map((option) => (
          <CheckboxCard
            key={option.id}
            label={option.label}
            checked={form.mustHave.includes(option.id)}
            onToggle={() => toggle('mustHave', option.id)}
          />
        ))}
      </View>

      <Text style={styles.subheading}>Nice-to-haves</Text>
      <Text style={styles.subhelper}>Boosts a room&rsquo;s rank when it has these.</Text>
      <View style={styles.grid}>
        {NICE_TO_HAVE_OPTIONS.map((option) => (
          <CheckboxCard
            key={option.id}
            label={option.label}
            checked={form.nice.includes(option.id)}
            onToggle={() => toggle('nice', option.id)}
          />
        ))}
      </View>

      <Text style={styles.subheading}>House rules you prefer</Text>
      <View style={styles.grid}>
        {HOUSE_RULE_OPTIONS.map((option) => (
          <CheckboxCard
            key={option.id}
            label={option.label}
            checked={form.rules.includes(option.id)}
            onToggle={() => toggle('rules', option.id)}
          />
        ))}
      </View>
    </View>
  );
}

