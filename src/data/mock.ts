/**
 * BoardPoint mock data.
 *
 * Stand-in for a real backend until the API is wired up. Screens that render
 * live data read from these arrays; replace them with fetched data later.
 */

export interface RenterRoom {
  id: string;
  title: string;
  area: string;
  roomType: 'Private room' | 'Shared room';
  /** Monthly rent in PHP. */
  price: number;
  distanceKm: number;
  /** 0-100 match against the renter's checklist. */
  matchPercent: number;
}

export interface LandlordListing {
  id: string;
  propertyName: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  /** Monthly rent per unit in PHP. */
  monthlyRent: number;
  status: 'Pending verification' | 'Listed' | 'Rented';
}

export const renterMockRooms: RenterRoom[] = [
  {
    id: 'room-1',
    title: 'Studio Unit near University',
    area: 'Tambak, Potol Street',
    roomType: 'Private room',
    price: 3500,
    distanceKm: 0.8,
    matchPercent: 96,
  },
  {
    id: 'room-2',
    title: 'Shared Room with Wi-Fi',
    area: 'Providencia, Dahlia St.',
    roomType: 'Shared room',
    price: 1800,
    distanceKm: 1.5,
    matchPercent: 88,
  },
  {
    id: 'room-3',
    title: 'Aircon Dormitory Bed',
    area: 'San Roque, Palm Street',
    roomType: 'Shared room',
    price: 2200,
    distanceKm: 2.1,
    matchPercent: 81,
  },
  {
    id: 'room-4',
    title: 'Private Room with Kitchen Access',
    area: 'Poblacion, La Torre St.',
    roomType: 'Private room',
    price: 4200,
    distanceKm: 3.2,
    matchPercent: 74,
  },
];

export const landlordMockListings: LandlordListing[] = [
  {
    id: 'listing-1',
    propertyName: 'Tambak Dormitory',
    address: 'Tambak, Potol Street',
    totalUnits: 12,
    occupiedUnits: 9,
    monthlyRent: 2500,
    status: 'Listed',
  },
  {
    id: 'listing-2',
    propertyName: 'Palm Street Boarding House',
    address: 'San Roque, Palm Street',
    totalUnits: 8,
    occupiedUnits: 8,
    monthlyRent: 2200,
    status: 'Rented',
  },
  {
    id: 'listing-3',
    propertyName: 'La Torre Apartelle',
    address: 'Poblacion, La Torre St.',
    totalUnits: 6,
    occupiedUnits: 2,
    monthlyRent: 4500,
    status: 'Listed',
  },
  {
    id: 'listing-4',
    propertyName: 'Dahlia Heights',
    address: 'Providencia, Dahlia St.',
    totalUnits: 10,
    occupiedUnits: 0,
    monthlyRent: 3000,
    status: 'Pending verification',
  },
];