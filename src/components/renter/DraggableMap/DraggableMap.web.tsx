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
import { GeoPoint } from '@/services/geocode';
import { colors } from '@/theme';
import { styles, TILE_SIZE } from './DraggableMap.styles';

type Props = {
  point: GeoPoint;
  onChange: (point: GeoPoint) => void;
};

const ZOOM = 15;
const MAX_TILES = 2 ** ZOOM;
const MAX_LATITUDE = 85.05112878;

function lonToTileX(longitude: number): number {
  return ((longitude + 180) / 360) * MAX_TILES;
}

function latToTileY(latitude: number): number {
  const clamped = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude));
  const rad = (clamped * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * MAX_TILES;
}

function tileXToLon(tileX: number): number {
  return (tileX / MAX_TILES) * 360 - 180;
}

function tileYToLat(tileY: number): number {
  const n = Math.PI - (2 * Math.PI * tileY) / MAX_TILES;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

type Size = { width: number; height: number };

export function DraggableMap({ point, onChange }: Props) {
  const [size, setSize] = useState<Size | null>(null);

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
    const tileX = lonToTileX(start.longitude) + dx / TILE_SIZE;
    const tileY = latToTileY(start.latitude) + dy / TILE_SIZE;
    onChangeRef.current({
      longitude: tileXToLon(tileX),
      latitude: tileYToLat(tileY),
    });
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    lastDraggedRef.current = pointRef.current;
  };

  const centerPixel = {
    x: lonToTileX(center.longitude) * TILE_SIZE,
    y: latToTileY(center.latitude) * TILE_SIZE,
  };

  const pinPixel = {
    x: lonToTileX(longitude) * TILE_SIZE - (centerPixel.x - (size?.width ?? 0) / 2),
    y: latToTileY(latitude) * TILE_SIZE - (centerPixel.y - (size?.height ?? 0) / 2),
  };

  const tiles: { key: string; x: number; y: number; left: number; top: number }[] = [];
  if (size) {
    const originX = centerPixel.x - size.width / 2;
    const originY = centerPixel.y - size.height / 2;
    const firstX = Math.floor(originX / TILE_SIZE);
    const lastX = Math.floor((originX + size.width) / TILE_SIZE);
    const firstY = Math.floor(originY / TILE_SIZE);
    const lastY = Math.floor((originY + size.height) / TILE_SIZE);

    for (let tileX = firstX; tileX <= lastX; tileX += 1) {
      for (let tileY = firstY; tileY <= lastY; tileY += 1) {
        if (tileX < 0 || tileX >= MAX_TILES || tileY < 0 || tileY >= MAX_TILES) continue;
        tiles.push({
          key: `${ZOOM}-${tileX}-${tileY}`,
          x: tileX,
          y: tileY,
          left: tileX * TILE_SIZE - originX,
          top: tileY * TILE_SIZE - originY,
        });
      }
    }
  }

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
      accessibilityLabel="Map: drag the pin to set your search point"
    >
      {tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{ uri: `https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png` }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
          resizeMode="cover"
        />
      ))}

      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          beginDrag(event.nativeEvent.pageX, event.nativeEvent.pageY);
        }}
        onResponderMove={(event) => {
          moveDrag(event.nativeEvent.pageX, event.nativeEvent.pageY);
        }}
        onResponderRelease={endDrag}
        onResponderTerminate={endDrag}
        style={[styles.pin, { left: pinPixel.x - 18, top: pinPixel.y - 38 }]}
        accessibilityRole="image"
        accessibilityLabel="Draggable search point pin"
      >
        <Ionicons name="location" size={36} color={colors.primary} />
      </View>

      <Text style={styles.attribution} pointerEvents="none">
        © OpenStreetMap
      </Text>
    </View>
  );
}
