import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Button text. Defaults to "Log In". */
  label?: string;
  accessibilityLabel?: string;
};

export function LoginButton({
  onPress,
  loading,
  disabled,
  label = 'Log In',
  accessibilityLabel = 'Log in to your BoardPoint account',
}: Props) {
  return (
    <PrimaryButton
      label={label}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  );
}