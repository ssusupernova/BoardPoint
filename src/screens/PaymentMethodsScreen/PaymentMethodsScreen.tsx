import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { renterPaymentMethods } from '@/data/mock';
import { selectPaymentMethod, useSelectedPaymentMethodId } from '@/services/paymentMethods';
import { colors } from '@/theme';
import { styles } from './PaymentMethodsScreen.styles';

/** Selector for the renter's preferred payment method. */
export default function PaymentMethodsScreen() {
  const router = useRouter();
  const selectedId = useSelectedPaymentMethodId();

  return (
    <ScreenContainer>
      <PageHeader
        title="Payment methods"
        subtitle="Choose how you settle your bills"
        onBack={() => router.back()}
      />

      <View style={styles.list}>
        {renterPaymentMethods.map((method) => {
          const selected = method.id === selectedId;
          return (
            <Pressable
              key={method.id}
              onPress={() => void selectPaymentMethod(method.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${method.provider}, ${method.accountLabel}`}
              style={({ pressed }) => [
                styles.row,
                selected && styles.rowSelected,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={method.icon as ComponentProps<typeof Ionicons>['name']}
                  size={19}
                  color={colors.primary}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.provider}>{method.provider}</Text>
                <Text style={styles.account}>{method.accountLabel}</Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selected ? colors.primary : colors.textDisabled}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.note}>Your choice is saved on this device.</Text>
    </ScreenContainer>
  );
}
