import {
  Modal,
  Text,
  View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { colors
} from '@/theme';
import { styles } from './SaveConfirmationModal.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SaveConfirmationModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={30} color={colors.onPrimary} />
          </View>
          <Text style={styles.title}>Checklist saved!</Text>
          <Text style={styles.body}>
            We&apos;ll use your checklist to find matching rooms, closest first.
          </Text>
          <View style={styles.buttonWrap}>
            <PrimaryButton label="Done" onPress={onClose} accessibilityLabel="Close confirmation" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

