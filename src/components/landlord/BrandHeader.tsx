import {
  BrandHeader as BaseBrandHeader,
  type BrandPalette,
} from '@/components/common/BrandHeader/BrandHeader';
import { landlordColors } from '@/theme';

const LANDLORD_PALETTE: BrandPalette = {
  logoBackground: landlordColors.primary,
  logoIcon: landlordColors.onPrimary,
  brand: landlordColors.textPrimary,
  subtitle: landlordColors.textSecondary,
};

/**
 * Landlord wordmark. Reuses the shared BrandHeader implementation with the
 * landlord palette (previously a full duplicate of the component + styles).
 */
export function BrandHeader() {
  return <BaseBrandHeader size="sm" palette={LANDLORD_PALETTE} />;
}
