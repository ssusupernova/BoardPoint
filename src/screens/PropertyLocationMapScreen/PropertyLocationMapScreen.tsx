import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthSession } from '@/services/auth';
import { canViewProperty, toPropertyViews, useLandlordData } from '@/services/landlordData';
import { landlordPropertyDetails, routes } from '@/routes';
import { PropertyMarkersMap } from '@/components/landlord/property/PropertyMarkersMap';
import {
  MARKER_COLOR,
  MARKER_SELECTED_COLOR,
  type PropertyMarkerPoint,
} from '@/components/landlord/property/PropertyMarkersMap.types';
import { PropertyPreviewCard } from '@/components/landlord/property/PropertyPreviewCard';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { propertyLocationMapStyles as st } from './PropertyLocationMapScreen.styles';

/**
 * Portfolio map: every property the landlord owns, with a compact preview
 * card when a marker is selected. Only property pins are drawn — renters'
 * live locations and tenant addresses never appear here.
 */
export default function PropertyLocationMapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const data = useLandlordData();

  const properties = useMemo(
    () => toPropertyViews(data).filter((property) => canViewProperty(property, landlordId)),
    [data, landlordId]
  );

  const markers = useMemo<PropertyMarkerPoint[]>(
    () =>
      properties.map((property) => ({
        id: property.id,
        name: property.name,
        address: property.address,
        latitude: property.latitude,
        longitude: property.longitude,
        confirmed: property.mapLocationSet,
      })),
    [properties]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = properties.find((property) => property.id === selectedId) ?? null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={st.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [st.backButton, pressed && st.backButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={22} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <View style={st.headerCopy}>
              <Text style={styles.brandTitle}>Property Map</Text>
              <Text style={styles.brandSubtitle}>YOUR PROPERTIES AT A GLANCE</Text>
            </View>
          </View>

          {/* Privacy: property pins only */}
          <View style={st.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={15} color={LANDLORD_THEME.primaryDark} />
            <Text style={st.privacyNoteText}>
              This map shows only your own properties. Renters’ live locations and tenant home
              addresses are never displayed.
            </Text>
          </View>

          {properties.length === 0 ? (
            <View style={st.emptyCard}>
              <Ionicons name="business-outline" size={28} color={LANDLORD_THEME.primaryDark} />
              <Text style={st.emptyTitle}>No properties to map yet</Text>
              <Text style={st.emptyBody}>
                Add a property and confirm its location, and it will appear here on the map.
              </Text>
              <Pressable
                onPress={() => router.push(routes.landlordAddProperty)}
                style={({ pressed }) => [st.emptyButton, pressed && st.emptyButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel="Add your first property"
              >
                <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
                <Text style={st.emptyButtonText}>Add Property</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <PropertyMarkersMap
                properties={markers}
                selectedId={selectedId}
                onSelect={setSelectedId}
                height={320}
              />

              <View style={st.legend}>
                <View style={st.legendItem}>
                  <Ionicons name="location" size={14} color={MARKER_COLOR} />
                  <Text style={st.legendText}>Property</Text>
                </View>
                <View style={st.legendItem}>
                  <Ionicons name="location" size={14} color={MARKER_SELECTED_COLOR} />
                  <Text style={st.legendText}>Selected</Text>
                </View>
                <View style={st.legendItem}>
                  <Ionicons name="location-outline" size={14} color={MARKER_COLOR} />
                  <Text style={st.legendText}>Location not confirmed</Text>
                </View>
              </View>

              {selected ? (
                <View>
                  <PropertyPreviewCard
                    property={selected}
                    onView={() => router.push(landlordPropertyDetails(selected.id))}
                  />
                  <Text style={st.helperText}>
                    To correct this pin, open the property and update it from the Location tab.
                  </Text>
                </View>
              ) : (
                <View style={st.hintCard}>
                  <Ionicons name="hand-left-outline" size={18} color={LANDLORD_THEME.primaryDark} />
                  <Text style={st.hintTitle}>Tap a marker to preview a property</Text>
                  <Text style={st.hintBody}>
                    See its listing status, available rooms, and rent range, then jump straight to
                    the property.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
