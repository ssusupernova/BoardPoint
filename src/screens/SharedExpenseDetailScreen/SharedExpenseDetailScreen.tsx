import { AllocationBreakdown } from '@/components/landlord/billing/AllocationBreakdown';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { landlordExpenseForm } from '@/routes';
import {
  ALLOCATION_METHOD_LABELS,
  deleteSharedExpense,
  expenseAllocationRows,
  expenseViewOf,
  useLandlordData,
  useLandlordDataReady,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { expenseStyles as exp } from '../../styles/landlord/expenses.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

export default function SharedExpenseDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ expenseId?: string }>();
  const expenseId = Array.isArray(params.expenseId) ? params.expenseId[0] : params.expenseId;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const expense = expenseId ? expenseViewOf(data, expenseId) : null;
  const rows = useMemo(
    () => (expense ? expenseAllocationRows(data, expense) : []),
    [data, expense]
  );

  const confirmDelete = (): void => {
    if (!expense) return;
    Alert.alert(
      'Delete shared expense?',
      `Remove the ${expense.category} expense of ${formatPeso(expense.amount)}?\n\nBills already generated from it keep their frozen amounts.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteSharedExpense(expense.id);
                router.back();
              } catch (error) {
                Alert.alert('Could not delete', toErrorMessage(error));
              }
            })();
          },
        },
      ]
    );
  };

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={exp.loadingBox}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={exp.loadingText}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <View style={billStyles.headerRow}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  billStyles.headerBackBtn,
                  pressed && billStyles.headerBackBtnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
              </Pressable>
              <View style={billStyles.headerTextCol}>
                <Text style={styles.brandTitle}>Shared Expense</Text>
                <Text style={styles.brandSubtitle}>ALLOCATION &amp; DETAILS</Text>
              </View>
            </View>
            <Text style={exp.missing}>This shared expense no longer exists.</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={billStyles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                billStyles.headerBackBtn,
                pressed && billStyles.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>

            <View style={billStyles.headerTextCol}>
              <Text style={styles.brandTitle}>Shared Expense</Text>
              <Text style={styles.brandSubtitle}>ALLOCATION &amp; DETAILS</Text>
            </View>
          </View>

          {/* Summary card */}
          <View style={form.sectionCard}>
            <View style={exp.expenseTop}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={exp.categoryPill}>
                  <Text style={exp.categoryPillText}>{expense.category}</Text>
                </View>
                <Text style={exp.expenseTitle} numberOfLines={2}>
                  {expense.description || `${expense.category} bill`}
                </Text>
              </View>
              <Text style={exp.totalCardValue}>{formatPeso(expense.amount)}</Text>
            </View>

            <View style={[exp.lineRow]}>
              <Text style={exp.lineLabel}>Property</Text>
              <Text style={exp.lineAmount}>{expense.propertyName}</Text>
            </View>
            <View style={exp.lineRow}>
              <Text style={exp.lineLabel}>Billing period</Text>
              <Text style={exp.lineAmount}>{expense.periodLabel}</Text>
            </View>
            <View style={exp.lineRow}>
              <Text style={exp.lineLabel}>Bill date</Text>
              <Text style={exp.lineAmount}>{formatDisplayDate(expense.billDate)}</Text>
            </View>
            <View style={exp.lineRow}>
              <Text style={exp.lineLabel}>Due from tenants</Text>
              <Text style={exp.lineAmount}>{formatDisplayDate(expense.dueDate)}</Text>
            </View>
            <View style={exp.lineRow}>
              <Text style={exp.lineLabel}>Split method</Text>
              <Text style={exp.lineAmount}>
                {ALLOCATION_METHOD_LABELS[expense.allocationMethod]}
              </Text>
            </View>

            {expense.attachmentUri || expense.attachmentName ? (
              <View style={{ marginTop: 12 }}>
                <Text style={exp.summaryLabel}>ATTACHED BILL</Text>
                {expense.attachmentUri ? (
                  <Image
                    source={{ uri: expense.attachmentUri }}
                    style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 8 }}
                    contentFit="cover"
                    accessibilityLabel={expense.attachmentName ?? 'Attached bill photo'}
                  />
                ) : null}
                <Text style={exp.expenseMeta}>{expense.attachmentName}</Text>
              </View>
            ) : null}
          </View>

          {/* Allocation breakdown */}
          <AllocationBreakdown
            rows={rows}
            total={expense.amount}
            hint={`${ALLOCATION_METHOD_LABELS[expense.allocationMethod]} · frozen when recorded`}
          />

          <Text style={exp.disclaimer}>
            Editing this expense recomputes the split for future statements only. Bills that
            are already finalized are changed through visible corrections instead.
          </Text>

          {/* Actions */}
          <View style={exp.actionStack}>
            <Pressable
              onPress={() => router.push(landlordExpenseForm(expense.id))}
              style={({ pressed }) => [
                form.primaryButton,
                pressed && form.primaryButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={18} color={LANDLORD_THEME.onPrimary} />
              <Text style={form.primaryButtonText}>Edit expense</Text>
            </Pressable>
            <Pressable
              onPress={confirmDelete}
              style={({ pressed }) => [
                exp.dangerAction,
                pressed && form.dangerButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={exp.dangerActionText}>Delete expense</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
