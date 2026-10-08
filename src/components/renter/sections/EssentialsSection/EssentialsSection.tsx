import {
  View
} from 'react-native';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { SelectField } from '@/components/renter/SelectField/SelectField';
import { MoneyInput } from '@/components/renter/MoneyInput/MoneyInput';
import { DateField } from '@/components/renter/DateField/DateField';
import {
  OCCUPANT_OPTIONS,
  ROOM_TYPE_OPTIONS,
  type ChecklistErrors,
  type ChecklistForm,
  } from '@/services/checklist';

import { styles } from './EssentialsSection.styles';

type Props = {
  form: ChecklistForm;
  errors: ChecklistErrors;
  onPatch: (patch: Partial<ChecklistForm>) => void;
};

export function EssentialsSection({ form, errors, onPatch }: Props) {
  return (
    <View>
      <SectionHeader
        title="Budget & room"
        helper="What you can pay and how you want to live. These narrow every result."
        tag="Required"
      />

      <View style={styles.row}>
        <View style={styles.budgetSlot}>
          <MoneyInput
            label="Minimum budget"
            value={form.minRent}
            onChangeText={(minRent) => onPatch({ minRent })}
            error={errors.minRent}
          />
        </View>
        <View style={styles.budgetSlot}>
          <MoneyInput
            label="Maximum budget"
            value={form.maxRent}
            onChangeText={(maxRent) => onPatch({ maxRent })}
            error={errors.maxRent}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.roomSlot}>
          <SelectField
            label="Room type"
            value={form.roomType}
            options={ROOM_TYPE_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            placeholder="Choose a room type"
            onSelect={(value) => onPatch({ roomType: value as ChecklistForm['roomType'] })}
            error={errors.roomType}
          />
        </View>
        <View style={styles.occupantsSlot}>
          <SelectField
            label="Occupants"
            value={form.occupants}
            options={OCCUPANT_OPTIONS}
            placeholder="How many"
            onSelect={(occupants) => onPatch({ occupants })}
            error={errors.occupants}
          />
        </View>
      </View>

      <View style={styles.dateWrap}>
        <DateField
          label="Earliest move-in date"
          value={form.moveInDate}
          onChange={(moveInDate) => onPatch({ moveInDate })}
          error={errors.moveInDate}
        />
      </View>
    </View>
  );
}

