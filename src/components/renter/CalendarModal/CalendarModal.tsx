import {
  useState } from 'react';
import { Modal,
  Pressable,
  Text,
  View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  buildMonthGrid,
  parseISODate,
  toISODate,
} from '@/utils/date';
import { styles } from './CalendarModal.styles';

type Props = {
  visible: boolean;
  /** Selected ISO date (yyyy-mm-dd), or null. */
  value: string | null;
  onSelect: (iso: string) => void;
  onClose: () => void;
};

export function CalendarModal({ visible, value, onSelect, onClose }: Props) {
  const selected = parseISODate(value);
  const today = new Date();

  // Month the renter browsed to manually; until then follow the selection.
  const [navigated, setNavigated] = useState<{ year: number; month: number } | null>(null);
  const anchor = selected ?? today;
  const view = navigated ?? { year: anchor.getFullYear(), month: anchor.getMonth() };

  const shiftMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setNavigated({ year: next.getFullYear(), month: next.getMonth() });
  };

  const weeks = buildMonthGrid(view.year, view.month);

  const isSelectedDay = (day: number) =>
    !!selected &&
    selected.getFullYear() === view.year &&
    selected.getMonth() === view.month &&
    selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === view.year &&
    today.getMonth() === view.month &&
    today.getDate() === day;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close calendar">
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>
              {MONTH_NAMES[view.month]} {view.year}
            </Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((label, index) => (
              <View key={`${label}-${index}`} style={styles.cell}>
                <Text style={styles.weekday}>{label}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <View key={`empty-${dayIndex}`} style={styles.cell} />;
                }
                const selectedDay = isSelectedDay(day);
                return (
                  <Pressable
                    key={`day-${day}`}
                    onPress={() => {
                      onSelect(toISODate(new Date(view.year, view.month, day)));
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedDay }}
                    accessibilityLabel={`${day} ${MONTH_NAMES[view.month]} ${view.year}`}
                    style={({ pressed }) => [
                      styles.dayCell,
                      selectedDay && styles.daySelected,
                      !selectedDay && isToday(day) && styles.dayToday,
                      pressed && !selectedDay && styles.dayPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selectedDay && styles.dayTextSelected,
                        !selectedDay && isToday(day) && styles.dayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

