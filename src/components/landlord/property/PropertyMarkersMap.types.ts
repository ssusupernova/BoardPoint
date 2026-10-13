/** Shared shape of one property pin on the landlord property map. */
export type PropertyMarkerPoint = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  /** False when the landlord has not confirmed the pin yet. */
  confirmed: boolean;
};

export type PropertyMarkersMapProps = {
  properties: PropertyMarkerPoint[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  /** Map height in dp. */
  height?: number;
};

export const MARKER_SELECTED_COLOR = '#BF7E4A';
export const MARKER_COLOR = '#93C5E2';
