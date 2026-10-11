import type { LandlordListing } from './types';

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
