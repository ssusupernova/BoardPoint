/**
 * Web Mercator tile math shared by the fallback tile maps (react-native-maps
 * has no web support, so web renders OpenStreetMap raster tiles instead).
 *
 * Pure functions — no React — so both map renderers stay in sync.
 */

/** Pixel size of one map tile. */
export const MAP_TILE_SIZE = 256;

const MAX_LATITUDE = 85.05112878;

export function lonToTileX(longitude: number, zoom: number): number {
  return ((longitude + 180) / 360) * 2 ** zoom;
}

export function latToTileY(latitude: number, zoom: number): number {
  const clamped = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude));
  const rad = (clamped * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom;
}

export function tileXToLon(tileX: number, zoom: number): number {
  return (tileX / 2 ** zoom) * 360 - 180;
}

export function tileYToLat(tileY: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * tileY) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export interface ViewportTile {
  x: number;
  y: number;
  /** Left offset in pixels relative to the viewport. */
  left: number;
  /** Top offset in pixels relative to the viewport. */
  top: number;
}

export interface PixelSize {
  width: number;
  height: number;
}

/** Raster tiles covering a viewport centred on `center`, positioned in pixels. */
export function tilesInViewport(
  center: { latitude: number; longitude: number },
  zoom: number,
  size: PixelSize
): ViewportTile[] {
  const maxTiles = 2 ** zoom;
  const originX = lonToTileX(center.longitude, zoom) * MAP_TILE_SIZE - size.width / 2;
  const originY = latToTileY(center.latitude, zoom) * MAP_TILE_SIZE - size.height / 2;
  const firstX = Math.floor(originX / MAP_TILE_SIZE);
  const lastX = Math.floor((originX + size.width) / MAP_TILE_SIZE);
  const firstY = Math.floor(originY / MAP_TILE_SIZE);
  const lastY = Math.floor((originY + size.height) / MAP_TILE_SIZE);

  const tiles: ViewportTile[] = [];
  for (let x = firstX; x <= lastX; x += 1) {
    for (let y = firstY; y <= lastY; y += 1) {
      if (x < 0 || x >= maxTiles || y < 0 || y >= maxTiles) continue;
      tiles.push({ x, y, left: x * MAP_TILE_SIZE - originX, top: y * MAP_TILE_SIZE - originY });
    }
  }
  return tiles;
}
