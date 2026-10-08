import {
  Text,
  View
} from 'react-native';

import { InfoPill } from '@/components/renter/InfoPill/InfoPill';
import { styles } from './SectionHeader.styles';

type Props = {
  title: string;
  helper: string;
  /** Small info tag rendered next to the title (e.g. "Required"). */
  tag?: string;
};

export function SectionHeader({ title, helper, tag }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {tag ? <InfoPill text={tag} /> : null}
      </View>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

