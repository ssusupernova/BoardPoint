/**
 * Web fallback for the draggable search-point map.
 *
 * react-native-maps has no web support, so this renders OpenStreetMap raster
 * tiles under a pin the renter can drag with mouse or touch. Coordinates are
 * converted with the standard Web Mercator tile formulas.
 */

import { useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MapOverlay } from '@/components/common/MapOverlay/MapOverlay';
import { GeoPoint } from '@/services/geocode';
import { colors } from '@/theme';
import { latToTileY, lonToTileX, tileXToLon, tileYToLat, tilesInViewport } from '@/utils/webMercator';
import { styles, TILE_SIZE } from './DraggableMap.styles';

type Props = {
  point: GeoPoint;
  onChange: (point: GeoPoint) => void;
  /** Pin tint; defaults to the BoardPoint primary. */
  accentColor?: string;
  title?: string;
  description?: string;
};

const ZOOM = 15;

type Size = { width: number; height: number };

export function DraggableMap({
  point,
  onChange,
  accentColor = colors.primary,
  title = 'Search point',
  description = 'Drag to move your room search point',
}: Props) {
  const [size, setSize] = useState<Size | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failedKeys, setFailedKeys] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  const pointRef = useRef(point);
  const onChangeRef = useRef(onChange);
  const startPointRef = useRef(point);
  const startClientRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastDraggedRef = useRef<GeoPoint | null>(null);

  useEffect(() => {
    pointRef.current = point;
    onChangeRef.current = onChange;
  });

  const latitude = point.latitude;
  const longitude = point.longitude;
  const [center, setCenter] = useState<GeoPoint>(point);

  // Follow externally-moved points (GPS); never mid-drag.
  useEffect(() => {
    if (draggingRef.current) return;
    const dragged = lastDraggedRef.current;
    if (dragged && dragged.latitude === latitude && dragged.longitude === longitude) return;
    setCenter({ latitude, longitude });
  }, [latitude, longitude]);

  const beginDrag = (pageX: number, pageY: number) => {
    draggingRef.current = true;
    startPointRef.current = pointRef.current;
    startClientRef.current = { x: pageX, y: pageY };
  };

  const moveDrag = (pageX: number, pageY: number) => {
    if (!draggingRef.current) return;
    const dx = pageX - startClientRef.current.x;
    const dy = pageY - startClientRef.current.y;
    const start = startPointRef.current;
    const tileX = lonToTileX(start.longitude, ZOOM) + dx / TILE_SIZE;
    const tileY = latToTileY(start.latitude, ZOOM) + dy / TILE_SIZE;
    onChangeRef.current({
      longitude: tileXToLon(tileX, ZOOM),
      latitude: tileYToLat(tileY, ZOOM),
    });
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    lastDraggedRef.current = pointRef.current;
  };

  const centerPixel = {
    x: lonToTileX(center.longitude, ZOOM) * TILE_SIZE,
    y: latToTileY(center.latitude, ZOOM) * TILE_SIZE,
  };

  const pinPixel = {
    x: lonToTileX(longitude, ZOOM) * TILE_SIZE - (centerPixel.x - (size?.width ?? 0) / 2),
    y: latToTileY(latitude, ZOOM) * TILE_SIZE - (centerPixel.y - (size?.height ?? 0) / 2),
  };

  const tiles = size
    ? tilesInViewport(center, ZOOM, size).map((tile) => ({
        key: `${ZOOM}-${tile.x}-${tile.y}-${attempt}`,
        x: tile.x,
        y: tile.y,
        left: tile.left,
        top: tile.top,
      }))
    : [];

  const retry = () => {
    setFailedKeys([]);
    setLoaded(false);
    setAttempt((value) => value + 1);
  };

  const tilesFailed = tiles.length > 0 && tiles.every((tile) => failedKeys.includes(tile.key));

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
      accessibilityLabel={`Map: ${description}. Drag the pin to set your search point`}
    >
      {tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{
            uri: `https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png?v=${attempt}`,
          }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
          resizeMode="cover"
          onLoad={() => setLoaded(true)}
          onError={() =>
            setFailedKeys((prev) => (prev.includes(tile.key) ? prev : [...prev, tile.key]))
          }
        />
      ))}

      <View
        onPointerDown={(event) => {
          if (event.nativeEvent.button !== 0) return;
          beginDrag(event.nativeEvent.pageX, event.nativeEvent.pageY);
        }}
        onPointerMove={(event) => moveDrag(event.nativeEvent.pageX, event.nativeEvent.pageY)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={[styles.pin, { left: pinPixel.x - 18, top: pinPixel.y - 38 }]}
        accessibilityRole="image"
        accessibilityLabel={`${title} pin — drag to move`}
      >
        <Ionicons name="location" size={36} color={accentColor} />
      </View>

      <Text style={styles.attribution}>© OpenStreetMap</Text>

      {tilesFailed ? (
        <MapOverlay
          status="error"
          onRetry={retry}
          message="Map tiles are unavailable. Check your connection, or enter coordinates directly."
        />
      ) : !loaded ? (
        <MapOverlay status="loading" onRetry={retry} />
      ) : null}
    </View>
  );
}
