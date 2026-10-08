import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function LoginButton({ onPress, loading, disabled }: Props) {
  return (
    <PrimaryButton
      label="Log In"
      accessibilityLabel="Log in to your BoardPoint account"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  );
}