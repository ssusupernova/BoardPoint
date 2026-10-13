/**
 * Web fallback for the landlord property map.
 *
 * react-native-maps has no web support, so this renders OpenStreetMap raster
 * tiles with one tappable marker per property. The viewport fits every
 * property (no panning); tapping a marker selects it so the preview card can
 * show the property's details.
 */

import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MapOverlay } from '@/components/common/MapOverlay/MapOverlay';
import { DEFAULT_MAP_POINT } from '@/services/geocode';
import { MAP_TILE_SIZE, latToTileY, lonToTileX, tilesInViewport } from '@/utils/webMercator';
import {
  MARKER_COLOR,
  MARKER_SELECTED_COLOR,
  type PropertyMarkerPoint,
  type PropertyMarkersMapProps,
} from './PropertyMarkersMap.types';
import { propertyMarkersMapStyles as styles } from './PropertyMarkersMap.styles';

const MIN_ZOOM = 9;
const MAX_ZOOM = 17;
const FALLBACK_SIZE = { width: 360, height: 340 };

type Fit = { center: { latitude: number; longitude: number }; zoom: number };

function fitFor(properties: PropertyMarkerPoint[], size: { width: number; height: number }): Fit {
  if (properties.length === 0) return { center: DEFAULT_MAP_POINT, zoom: 13 };

  const latitudes = properties.map((item) => item.latitude);
  const longitudes = properties.map((item) => item.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const center = {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
  };
  if (properties.length === 1) return { center, zoom: 16 };

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom -= 1) {
    const worldSize = MAP_TILE_SIZE * 2 ** zoom;
    const pixelSpanX = ((maxLongitude - minLongitude) / 360) * worldSize;
    const pixelSpanY =
      Math.abs(latToTileY(maxLatitude, zoom) - latToTileY(minLatitude, zoom)) * MAP_TILE_SIZE;
    if (pixelSpanX <= size.width * 0.75 && pixelSpanY <= size.height * 0.7) {
      return { center, zoom };
    }
  }
  return { center, zoom: MIN_ZOOM };
}

export function PropertyMarkersMap({
  properties,
  selectedId,
  onSelect,
  height = 340,
}: PropertyMarkersMapProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<string[]>([]);
  const [failedKeys, setFailedKeys] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  const fit = useMemo(
    () => fitFor(properties, size ?? FALLBACK_SIZE),
    [properties, size]
  );
  const tiles = useMemo(
    () =>
      size
        ? tilesInViewport(fit.center, fit.zoom, size).map((tile) => ({
            key: `${fit.zoom}-${tile.x}-${tile.y}-${attempt}`,
            ...tile,
          }))
        : [],
    [fit, size, attempt]
  );

  // Loading/failure are derived from the *current* tile set, so a zoom or
  // retry that swaps the tiles naturally restarts both states.
  const loaded = tiles.some((tile) => loadedKeys.includes(tile.key));
  const tilesFailed = tiles.length > 0 && tiles.every((tile) => failedKeys.includes(tile.key));

  const retry = () => {
    setLoadedKeys([]);
    setFailedKeys([]);
    setAttempt((value) => value + 1);
  };

  const centerPixel = {
    x: lonToTileX(fit.center.longitude, fit.zoom) * MAP_TILE_SIZE,
    y: latToTileY(fit.center.latitude, fit.zoom) * MAP_TILE_SIZE,
  };
  const viewport = size ?? FALLBACK_SIZE;
  const markerPosition = (property: PropertyMarkerPoint) => ({
    x: lonToTileX(property.longitude, fit.zoom) * MAP_TILE_SIZE - (centerPixel.x - viewport.width / 2),
    y: latToTileY(property.latitude, fit.zoom) * MAP_TILE_SIZE - (centerPixel.y - viewport.height / 2),
  });

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(event) => {
        const { width, height: layoutHeight } = event.nativeEvent.layout;
        setSize({ width, height: layoutHeight });
      }}
      accessibilityLabel="Map of your properties. Tap a marker to select a property."
    >
      {tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{
            uri: `https://tile.openstreetmap.org/${fit.zoom}/${tile.x}/${tile.y}.png?v=${attempt}`,
          }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
          resizeMode="cover"
          onLoad={() => setLoadedKeys((prev) => (prev.includes(tile.key) ? prev : [...prev, tile.key]))}
          onError={() =>
            setFailedKeys((prev) => (prev.includes(tile.key) ? prev : [...prev, tile.key]))
          }
        />
      ))}

      {properties.map((property) => {
        const position = markerPosition(property);
        const selected = property.id === selectedId;
        return (
          <Pressable
            key={property.id}
            onPress={() => onSelect(property.id)}
            style={[styles.markerButton, { left: position.x - 22, top: position.y - 44 }]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${property.name}, ${property.address}${
              selected ? ', selected' : ''
            }`}
          >
            {selected ? (
              <View style={styles.markerName}>
                <Text style={styles.markerNameText} numberOfLines={1}>
                  {property.name}
                </Text>
              </View>
            ) : null}
            <Ionicons
              name={property.confirmed ? 'location' : 'location-outline'}
              size={selected ? 34 : 26}
              color={selected ? MARKER_SELECTED_COLOR : MARKER_COLOR}
            />
          </Pressable>
        );
      })}

      <Text style={styles.attribution}>© OpenStreetMap</Text>

      {tilesFailed ? (
        <MapOverlay
          status="error"
          onRetry={retry}
          message="Map tiles couldn’t load. Check your connection, then try again."
        />
      ) : !loaded ? (
        <MapOverlay status="loading" onRetry={retry} />
      ) : null}
    </View>
  );
}
