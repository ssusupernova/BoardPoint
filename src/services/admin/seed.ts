/**
 * Seed dataset for the admin panel.
 *
 * This stands in for the backend rows a Supabase deployment would return:
 * landlords, verification applications with documents, listings, reports,
 * audit entries, notifications and landlord-facing notices. Every figure the
 * dashboard shows is derived from these rows — nothing is hardcoded in the
 * screens.
 */
import * as Crypto from 'expo-crypto';
import { buildAdminProfiles } from './adminAccounts';
import { daysAgo } from './format';
import type {
  AdminDatabase,
  AdminNotification,
  AuditAction,
  AuditLogEntry,
  AuditTargetType,
  ContentReport,
  DocumentKind,
  DocumentStatus,
  LandlordAccount,
  LandlordNotice,
  ListingFlag,
  ModerationEvent,
  PropertyListing,
  ReportEvent,
  ReportStatus,
  ReviewEvent,
  VerificationApplication,
  VerificationDocument,
} from './types';

const AMARA = { id: 'adm-super-0001', name: 'Amara Boateng' };

function id(prefix: string): string {
  return `${prefix}-${Crypto.randomUUID().slice(0, 8)}`;
}

/* ------------------------------------------------------------ landlord ids */

const LL = {
  maria: 'll-maria',
  daniel: 'll-daniel',
  grace: 'll-grace',
  rafael: 'll-rafael',
  aisha: 'll-aisha',
  tomas: 'll-tomas',
  nia: 'll-nia',
  peter: 'll-peter',
  sofia: 'll-sofia',
  omar: 'll-omar',
  chidi: 'll-chidi',
  elena: 'll-elena',
  jonas: 'll-jonas',
  lila: 'll-lila',
  ken: 'll-ken',
} as const;

interface LandlordSeed {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  joinedDaysAgo: number;
  verification: LandlordAccount['verificationStatus'];
  accountStatus: LandlordAccount['accountStatus'];
  suspension?: { reason: string; daysAgo: number; by: string };
}

const LANDLORD_SEEDS: LandlordSeed[] = [
  {
    id: LL.maria,
    fullName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '+63 917 442 1188',
    city: 'Quezon City',
    address: '18 Maple Street, Barangay Teachers Village',
    joinedDaysAgo: 70,
    verification: 'verified',
    accountStatus: 'active',
  },
  {
    id: LL.daniel,
    fullName: 'Daniel Okafor',
    email: 'daniel.okafor@gmail.com',
    phone: '+63 928 110 5521',
    city: 'Cebu City',
    address: '4 Lapu-Lapu Avenue, Barangay Lahug',
    joinedDaysAgo: 4,
    verification: 'pending',
    accountStatus: 'active',
  },
  {
    id: LL.grace,
    fullName: 'Grace Lim',
    email: 'grace.lim@gmail.com',
    phone: '+63 917 903 7742',
    city: 'Davao City',
    address: '77 Roxas Boulevard, Barangay 19-B',
    joinedDaysAgo: 7,
    verification: 'resubmitted',
    accountStatus: 'active',
  },
  {
    id: LL.rafael,
    fullName: 'Rafael Cruz',
    email: 'rafael.cruz@gmail.com',
    phone: '+63 939 221 6604',
    city: 'Pasig City',
    address: '12 Cedar Lane, Barangay Kapitolyo',
    joinedDaysAgo: 11,
    verification: 'verified',
    accountStatus: 'active',
  },
  {
    id: LL.aisha,
    fullName: 'Aisha Rahman',
    email: 'aisha.rahman@gmail.com',
    phone: '+63 995 774 3320',
    city: 'Iloilo City',
    address: '9 Rizal Street, Barangay Molo',
    joinedDaysAgo: 12,
    verification: 'rejected',
    accountStatus: 'active',
  },
  {
    id: LL.tomas,
    fullName: 'Tomas Dela Peña',
    email: 'tomas.delapena@gmail.com',
    phone: '+63 917 220 8814',
    city: 'Manila',
    address: '220 Sunset Drive, Barangay Tondo',
    joinedDaysAgo: 52,
    verification: 'verified',
    accountStatus: 'suspended',
    suspension: {
      reason:
        'Three renters reported being asked for payment before a viewing. Suspension held while the open report is investigated.',
      daysAgo: 4,
      by: AMARA.name,
    },
  },
  {
    id: LL.nia,
    fullName: 'Nia Reyes',
    email: 'nia.reyes@gmail.com',
    phone: '+63 906 551 2093',
    city: 'Baguio City',
    address: '31 Session Road, Barangay Upper Market',
    joinedDaysAgo: 7,
    verification: 'info_requested',
    accountStatus: 'active',
  },
  {
    id: LL.peter,
    fullName: 'Peter Mwangi',
    email: 'peter.mwangi@gmail.com',
    phone: '+63 917 665 4471',
    city: 'Cebu City',
    address: '5 Riverside Road, Barangay Mabolo',
    joinedDaysAgo: 15,
    verification: 'verified',
    accountStatus: 'active',
  },
  {
    id: LL.sofia,
    fullName: 'Sofia Reyes',
    email: 'sofia.reyes@gmail.com',
    phone: '+63 977 812 3345',
    city: 'Quezon City',
    address: '64 Palm Avenue, Barangay Cubao',
    joinedDaysAgo: 2,
    verification: 'pending',
    accountStatus: 'active',
  },
  {
    id: LL.omar,
    fullName: 'Omar Haddad',
    email: 'omar.haddad@gmail.com',
    phone: '+63 918 447 9925',
    city: 'Mandaue City',
    address: '15 Hillview Street, Barangay Alang-Alang',
    joinedDaysAgo: 3,
    verification: 'pending',
    accountStatus: 'active',
  },
  {
    id: LL.chidi,
    fullName: 'Chidi Nwosu',
    email: 'chidi.nwosu@gmail.com',
    phone: '+63 917 338 2019',
    city: 'Taguig City',
    address: '2 Garden View Extension, Barangay BGC',
    joinedDaysAgo: 22,
    verification: 'verified',
    accountStatus: 'active',
  },
  {
    id: LL.elena,
    fullName: 'Elena Petrova',
    email: 'elena.petrova@gmail.com',
    phone: '+63 936 220 7781',
    city: 'Cagayan de Oro',
    address: '88 Closeup Street, Barangay Divisoria',
    joinedDaysAgo: 25,
    verification: 'rejected',
    accountStatus: 'active',
  },
  {
    id: LL.jonas,
    fullName: 'Jonas Mba',
    email: 'jonas.mba@gmail.com',
    phone: '+63 917 005 6612',
    city: 'Makati City',
    address: '10 Bamboo Road, Barangay Pembo',
    joinedDaysAgo: 13,
    verification: 'verified',
    accountStatus: 'active',
  },
  {
    id: LL.lila,
    fullName: 'Lila Gomez',
    email: 'lila.gomez@gmail.com',
    phone: '+63 999 118 4460',
    city: 'Lipa City',
    address: '7 Lagoon Street, Barangay Marawoy',
    joinedDaysAgo: 31,
    verification: 'verified',
    accountStatus: 'active',
  },
  {
    id: LL.ken,
    fullName: 'Ken Adeyemi',
    email: 'ken.adeyemi@gmail.com',
    phone: '+63 917 774 2231',
    city: 'Pasig City',
    address: '3 Hilltop Lane, Barangay Ugong',
    joinedDaysAgo: 49,
    verification: 'verified',
    accountStatus: 'suspended',
    suspension: {
      reason:
        'Listing photos were found on another platform under a different owner. Account suspended pending ownership re-check.',
      daysAgo: 6,
      by: AMARA.name,
    },
  },
];

/* ---------------------------------------------------------------- documents */

const DOCUMENT_SPECS: { kind: DocumentKind; label: string; required: boolean }[] = [
  { kind: 'id_front', label: 'Government ID — front', required: true },
  { kind: 'id_back', label: 'Government ID — back', required: true },
  { kind: 'selfie', label: 'Selfie holding ID', required: true },
  { kind: 'proof_of_address', label: 'Proof of address', required: true },
  { kind: 'ownership_proof', label: 'Proof of property ownership', required: false },
];

type DocSeed = Partial<Record<DocumentKind, { status?: DocumentStatus; ageDays?: number | null; note?: string }>>;

function buildDocuments(applicationId: string, seed: DocSeed): VerificationDocument[] {
  return DOCUMENT_SPECS.map((spec) => {
    const entry = seed[spec.kind];
    const status: DocumentStatus = entry?.status ?? (entry ? 'uploaded' : 'missing');
    const ageDays = entry?.ageDays;
    const uploadedAt =
      status === 'missing' ? null : daysAgo(typeof ageDays === 'number' ? ageDays : 1, 10, 42);
    return {
      id: id('doc'),
      label: spec.label,
      kind: spec.kind,
      required: spec.required,
      status,
      uploadedAt,
      mimeType: 'image/jpeg',
      sizeBytes: 640_000 + Math.floor((applicationId.length * 7919) % 1_500_000),
      storageKey: `verifications/${applicationId}/${spec.kind}.jpg`,
      note: entry?.note ?? null,
    };
  });
}

/* ------------------------------------------------------------- applications */

interface ApplicationSeed {
  id: string;
  reference: string;
  landlordId: string;
  landlordName: string;
  status: VerificationApplication['status'];
  submittedDaysAgo: number;
  resubmittedDaysAgo?: number;
  decidedDaysAgo?: number;
  decidedBy?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  lastReason?: string;
  internalNote?: string;
  docs: DocSeed;
  history: { action: ReviewEvent['action']; daysAgo: number; actorName: string; actorId?: string | null; reason?: string }[];
}

const APPLICATION_SEEDS: ApplicationSeed[] = [
  {
    id: 'app-daniel-01',
    reference: 'BPV-1051',
    landlordId: LL.daniel,
    landlordName: 'Daniel Okafor',
    status: 'pending',
    submittedDaysAgo: 1,
    assignedTo: AMARA,
    docs: {
      id_front: { ageDays: 1 },
      id_back: { ageDays: 1 },
      selfie: { ageDays: 1 },
      proof_of_address: { status: 'missing' },
    },
    history: [
      { action: 'submitted', daysAgo: 1, actorName: 'Daniel Okafor', actorId: null },
      { action: 'assigned', daysAgo: 1, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-sofia-01',
    reference: 'BPV-1054',
    landlordId: LL.sofia,
    landlordName: 'Sofia Reyes',
    status: 'pending',
    submittedDaysAgo: 0.2,
    docs: {
      id_front: { ageDays: 0.2 },
      id_back: { ageDays: 0.2 },
      selfie: { ageDays: 0.2 },
      proof_of_address: { ageDays: 0.2 },
      ownership_proof: { ageDays: 0.2 },
    },
    history: [{ action: 'submitted', daysAgo: 0.2, actorName: 'Sofia Reyes', actorId: null }],
  },
  {
    id: 'app-omar-01',
    reference: 'BPV-1049',
    landlordId: LL.omar,
    landlordName: 'Omar Haddad',
    status: 'pending',
    submittedDaysAgo: 2,
    docs: {
      id_front: { ageDays: 2 },
      selfie: { ageDays: 2 },
      proof_of_address: { status: 'missing' },
      id_back: { status: 'missing' },
    },
    history: [{ action: 'submitted', daysAgo: 2, actorName: 'Omar Haddad', actorId: null }],
  },
  {
    id: 'app-grace-01',
    reference: 'BPV-1046',
    landlordId: LL.grace,
    landlordName: 'Grace Lim',
    status: 'resubmitted',
    submittedDaysAgo: 5,
    resubmittedDaysAgo: 0.25,
    docs: {
      id_front: { ageDays: 0.25 },
      id_back: { ageDays: 5 },
      selfie: { ageDays: 0.25, note: 'Re-uploaded after the first photo was rejected as blurry.' },
      proof_of_address: { ageDays: 4 },
    },
    history: [
      { action: 'submitted', daysAgo: 5, actorName: 'Grace Lim', actorId: null },
      {
        action: 'info_requested',
        daysAgo: 3,
        actorName: AMARA.name,
        actorId: AMARA.id,
        reason: 'The selfie and ID front photo are unreadable. Please re-upload both in good light.',
      },
      { action: 'resubmitted', daysAgo: 0.25, actorName: 'Grace Lim', actorId: null },
    ],
  },
  {
    id: 'app-nia-01',
    reference: 'BPV-1044',
    landlordId: LL.nia,
    landlordName: 'Nia Reyes',
    status: 'info_requested',
    submittedDaysAgo: 6,
    lastReason:
      'Please upload a proof of address dated within the last three months (utility bill or barangay clearance).',
    assignedTo: AMARA,
    docs: {
      id_front: { ageDays: 6 },
      id_back: { ageDays: 6 },
      selfie: { ageDays: 6 },
      proof_of_address: { status: 'missing' },
    },
    history: [
      { action: 'submitted', daysAgo: 6, actorName: 'Nia Reyes', actorId: null },
      {
        action: 'info_requested',
        daysAgo: 5,
        actorName: AMARA.name,
        actorId: AMARA.id,
        reason:
          'Please upload a proof of address dated within the last three months (utility bill or barangay clearance).',
      },
    ],
  },
  {
    id: 'app-rafael-01',
    reference: 'BPV-1042',
    landlordId: LL.rafael,
    landlordName: 'Rafael Cruz',
    status: 'approved',
    submittedDaysAgo: 8,
    decidedDaysAgo: 6,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 8 },
      id_back: { ageDays: 8 },
      selfie: { ageDays: 8 },
      proof_of_address: { ageDays: 8 },
      ownership_proof: { ageDays: 8 },
    },
    history: [
      { action: 'submitted', daysAgo: 8, actorName: 'Rafael Cruz', actorId: null },
      { action: 'assigned', daysAgo: 8, actorName: AMARA.name, actorId: AMARA.id },
      { action: 'approved', daysAgo: 6, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-jonas-01',
    reference: 'BPV-1040',
    landlordId: LL.jonas,
    landlordName: 'Jonas Mba',
    status: 'approved',
    submittedDaysAgo: 12,
    decidedDaysAgo: 9,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 12 },
      id_back: { ageDays: 12 },
      selfie: { ageDays: 12 },
      proof_of_address: { ageDays: 12 },
    },
    history: [
      { action: 'submitted', daysAgo: 12, actorName: 'Jonas Mba', actorId: null },
      { action: 'approved', daysAgo: 9, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-aisha-01',
    reference: 'BPV-1039',
    landlordId: LL.aisha,
    landlordName: 'Aisha Rahman',
    status: 'rejected',
    submittedDaysAgo: 10,
    decidedDaysAgo: 8,
    decidedBy: AMARA,
    lastReason:
      'Your proof of address is more than a year old. Upload a recent utility bill or bank statement and apply again.',
    docs: {
      id_front: { ageDays: 10 },
      id_back: { ageDays: 10 },
      selfie: { ageDays: 10 },
      proof_of_address: {
        status: 'expired',
        ageDays: 400,
        note: 'Dated more than 12 months ago — outside the accepted window.',
      },
    },
    history: [
      { action: 'submitted', daysAgo: 10, actorName: 'Aisha Rahman', actorId: null },
      { action: 'assigned', daysAgo: 10, actorName: AMARA.name, actorId: AMARA.id },
      {
        action: 'rejected',
        daysAgo: 8,
        actorName: AMARA.name,
        actorId: AMARA.id,
        reason:
          'Your proof of address is more than a year old. Upload a recent utility bill or bank statement and apply again.',
      },
    ],
  },
  {
    id: 'app-peter-01',
    reference: 'BPV-1036',
    landlordId: LL.peter,
    landlordName: 'Peter Mwangi',
    status: 'approved',
    submittedDaysAgo: 14,
    decidedDaysAgo: 12,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 14 },
      id_back: { ageDays: 14 },
      selfie: { ageDays: 14 },
      proof_of_address: { ageDays: 14 },
      ownership_proof: { ageDays: 14 },
    },
    history: [
      { action: 'submitted', daysAgo: 14, actorName: 'Peter Mwangi', actorId: null },
      { action: 'assigned', daysAgo: 14, actorName: AMARA.name, actorId: AMARA.id },
      { action: 'approved', daysAgo: 12, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-chidi-01',
    reference: 'BPV-1032',
    landlordId: LL.chidi,
    landlordName: 'Chidi Nwosu',
    status: 'approved',
    submittedDaysAgo: 21,
    decidedDaysAgo: 18,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 21 },
      id_back: { ageDays: 21 },
      selfie: { ageDays: 21 },
      proof_of_address: { ageDays: 21 },
    },
    history: [
      { action: 'submitted', daysAgo: 21, actorName: 'Chidi Nwosu', actorId: null },
      { action: 'approved', daysAgo: 18, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-elena-01',
    reference: 'BPV-1029',
    landlordId: LL.elena,
    landlordName: 'Elena Petrova',
    status: 'rejected',
    submittedDaysAgo: 24,
    decidedDaysAgo: 21,
    decidedBy: AMARA,
    lastReason: 'The uploaded ID photos are blurred and the document number cannot be read.',
    docs: {
      id_front: { status: 'rejected', ageDays: 24, note: 'Blurry — document number unreadable.' },
      id_back: { status: 'rejected', ageDays: 24, note: 'Blurry — document number unreadable.' },
      selfie: { ageDays: 24 },
      proof_of_address: { ageDays: 24 },
    },
    history: [
      { action: 'submitted', daysAgo: 24, actorName: 'Elena Petrova', actorId: null },
      { action: 'assigned', daysAgo: 24, actorName: AMARA.name, actorId: AMARA.id },
      {
        action: 'rejected',
        daysAgo: 21,
        actorName: AMARA.name,
        actorId: AMARA.id,
        reason: 'The uploaded ID photos are blurred and the document number cannot be read.',
      },
    ],
  },
  {
    id: 'app-lila-01',
    reference: 'BPV-1024',
    landlordId: LL.lila,
    landlordName: 'Lila Gomez',
    status: 'approved',
    submittedDaysAgo: 30,
    decidedDaysAgo: 26,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 30 },
      id_back: { ageDays: 30 },
      selfie: { ageDays: 30 },
      proof_of_address: { ageDays: 30 },
      ownership_proof: { ageDays: 30 },
    },
    history: [
      { action: 'submitted', daysAgo: 30, actorName: 'Lila Gomez', actorId: null },
      { action: 'approved', daysAgo: 26, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-ken-01',
    reference: 'BPV-1016',
    landlordId: LL.ken,
    landlordName: 'Ken Adeyemi',
    status: 'approved',
    submittedDaysAgo: 48,
    decidedDaysAgo: 45,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 48 },
      id_back: { ageDays: 48 },
      selfie: { ageDays: 48 },
      proof_of_address: { ageDays: 48 },
    },
    history: [
      { action: 'submitted', daysAgo: 48, actorName: 'Ken Adeyemi', actorId: null },
      { action: 'approved', daysAgo: 45, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-tomas-01',
    reference: 'BPV-1013',
    landlordId: LL.tomas,
    landlordName: 'Tomas Dela Peña',
    status: 'approved',
    submittedDaysAgo: 45,
    decidedDaysAgo: 42,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 45 },
      id_back: { ageDays: 45 },
      selfie: { ageDays: 45 },
      proof_of_address: { ageDays: 45 },
      ownership_proof: { ageDays: 45 },
    },
    history: [
      { action: 'submitted', daysAgo: 45, actorName: 'Tomas Dela Peña', actorId: null },
      { action: 'approved', daysAgo: 42, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
  {
    id: 'app-maria-01',
    reference: 'BPV-1008',
    landlordId: LL.maria,
    landlordName: 'Maria Santos',
    status: 'approved',
    submittedDaysAgo: 65,
    decidedDaysAgo: 62,
    decidedBy: AMARA,
    docs: {
      id_front: { ageDays: 65 },
      id_back: { ageDays: 65 },
      selfie: { ageDays: 65 },
      proof_of_address: { ageDays: 65 },
      ownership_proof: { ageDays: 65 },
    },
    history: [
      { action: 'submitted', daysAgo: 65, actorName: 'Maria Santos', actorId: null },
      { action: 'approved', daysAgo: 62, actorName: AMARA.name, actorId: AMARA.id },
    ],
  },
];

function buildApplications(): VerificationApplication[] {
  return APPLICATION_SEEDS.map((seed) => {
    const submittedAt = daysAgo(seed.submittedDaysAgo, 9, 5);
    const resubmittedAt = seed.resubmittedDaysAgo !== undefined ? daysAgo(seed.resubmittedDaysAgo, 8, 40) : null;
    const decidedAt = seed.decidedDaysAgo !== undefined ? daysAgo(seed.decidedDaysAgo, 15, 25) : null;
    const reviewHistory: ReviewEvent[] = [...seed.history]
      .sort((a, b) => b.daysAgo - a.daysAgo)
      .map((event) => ({
        id: id('rev'),
        at: daysAgo(event.daysAgo, event.action === 'submitted' ? 9 : 14, 20),
        actorId: event.actorId ?? null,
        actorName: event.actorName,
        action: event.action,
        reason: event.reason ?? null,
        note: null,
      }));

    return {
      id: seed.id,
      reference: seed.reference,
      landlordId: seed.landlordId,
      status: seed.status,
      submittedAt,
      updatedAt: decidedAt ?? resubmittedAt ?? submittedAt,
      resubmittedAt,
      decidedAt,
      decidedBy: seed.decidedBy?.id ?? null,
      decidedByName: seed.decidedBy?.name ?? null,
      assignedTo: seed.assignedTo?.id ?? null,
      assignedToName: seed.assignedTo?.name ?? null,
      documents: buildDocuments(seed.id, seed.docs),
      reviewHistory,
      lastReason: seed.lastReason ?? null,
      internalNote: seed.internalNote ?? null,
    };
  });
}

/* ----------------------------------------------------------------- listings */

interface ListingSeed {
  id: string;
  landlordId: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  description: string;
  status: PropertyListing['status'];
  createdDaysAgo: number;
  updatedDaysAgo: number;
  imageCount: number;
  flags?: ListingFlag[];
  moderationReason?: string;
}

const LISTING_SEEDS: ListingSeed[] = [
  {
    id: 'lst-maple-01',
    landlordId: LL.maria,
    title: 'Maple Court Room 2',
    address: '18 Maple Street, Barangay Teachers Village',
    city: 'Quezon City',
    price: 8500,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 180,
    description: 'Furnished room with study desk, fan and shared kitchen access. Two-minute walk to the campus gate.',
    status: 'active',
    createdDaysAgo: 60,
    updatedDaysAgo: 10,
    imageCount: 8,
  },
  {
    id: 'lst-palm-01',
    landlordId: LL.maria,
    title: 'Palm Street Studio Unit',
    address: '64 Palm Avenue, Barangay Cubao',
    city: 'Quezon City',
    price: 11000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 260,
    description: 'Standalone studio with private bathroom, electric stove and 24-hour water tank.',
    status: 'active',
    createdDaysAgo: 45,
    updatedDaysAgo: 12,
    imageCount: 5,
  },
  {
    id: 'lst-oak-01',
    landlordId: LL.maria,
    title: 'Oakwood Boarding Rooms',
    address: '21 Oakwood Extension, Barangay Kamuning',
    city: 'Quezon City',
    price: 7500,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 150,
    description: 'Budget room suitable for one tenant. Electricity billed separately.',
    status: 'correction_requested',
    createdDaysAgo: 30,
    updatedDaysAgo: 3,
    imageCount: 6,
    moderationReason:
      'The monthly price shown does not match the price in the property record submitted with the application.',
  },
  {
    id: 'lst-cedar-01',
    landlordId: LL.rafael,
    title: 'Cedar Lodge Annex',
    address: '12 Cedar Lane, Barangay Kapitolyo',
    city: 'Pasig City',
    price: 9000,
    bedrooms: 2,
    bathrooms: 1,
    areaSqft: 320,
    description: 'Two-sharing annex room with loft beds, air conditioning and laundry area.',
    status: 'active',
    createdDaysAgo: 35,
    updatedDaysAgo: 9,
    imageCount: 7,
  },
  {
    id: 'lst-riverside-01',
    landlordId: LL.peter,
    title: 'Riverside Boarding House',
    address: '5 Riverside Road, Barangay Mabolo',
    city: 'Cebu City',
    price: 13500,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 240,
    description: 'River-facing room with balcony, Wi-Fi and daily cleaning of shared areas.',
    status: 'active',
    createdDaysAgo: 20,
    updatedDaysAgo: 6,
    imageCount: 9,
  },
  {
    id: 'lst-hillview-01',
    landlordId: LL.peter,
    title: 'Hillview Dormitory Beds',
    address: '15 Hillview Street, Barangay Alang-Alang',
    city: 'Mandaue City',
    price: 3200,
    bedrooms: 1,
    bathrooms: 4,
    areaSqft: 60,
    description: 'Per-bed accommodation in a shared dormitory floor. Price shown is per week.',
    status: 'flagged',
    createdDaysAgo: 15,
    updatedDaysAgo: 2,
    imageCount: 4,
    flags: [
      {
        id: 'flg-hillview-01',
        kind: 'suspicious',
        reason:
          'Price is 70% below comparable listings and the photos match a dormitory in another city. Awaiting landlord confirmation.',
        duplicateOfId: null,
        at: daysAgo(2, 11, 5),
        byName: AMARA.name,
      },
    ],
  },
  {
    id: 'lst-sunrise-01',
    landlordId: LL.tomas,
    title: 'Sunrise Rooms (Downtown)',
    address: '220 Sunset Drive, Barangay Tondo',
    city: 'Manila',
    price: 6000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 140,
    description: 'Compact room near the market. Deposit terms listed in the description field.',
    status: 'hidden',
    createdDaysAgo: 50,
    updatedDaysAgo: 4,
    imageCount: 3,
    moderationReason:
      'Hidden after a fraud report: renters were asked for an advance payment before any viewing.',
  },
  {
    id: 'lst-garden-01',
    landlordId: LL.chidi,
    title: 'Garden View Units',
    address: '2 Garden View Extension, Barangay BGC',
    city: 'Taguig City',
    price: 10200,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 210,
    description: 'Corner unit with garden view, study nook and backup water supply.',
    status: 'active',
    createdDaysAgo: 25,
    updatedDaysAgo: 8,
    imageCount: 10,
  },
  {
    id: 'lst-bamboo-01',
    landlordId: LL.jonas,
    title: 'Bamboo House Dormitory',
    address: '10 Bamboo Road, Barangay Pembo',
    city: 'Makati City',
    price: 7200,
    bedrooms: 2,
    bathrooms: 1,
    areaSqft: 300,
    description: 'Two-sharing dormitory room with study lamps and a shared pantry.',
    status: 'active',
    createdDaysAgo: 12,
    updatedDaysAgo: 5,
    imageCount: 5,
  },
  {
    id: 'lst-lagoon-01',
    landlordId: LL.lila,
    title: 'Lagoon Side Rooms',
    address: '7 Lagoon Street, Barangay Marawoy',
    city: 'Lipa City',
    price: 9800,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 220,
    description: 'Quiet room beside the lagoon path with en-suite bathroom and cabinet.',
    status: 'active',
    createdDaysAgo: 70,
    updatedDaysAgo: 14,
    imageCount: 6,
  },
  {
    id: 'lst-hilltop-01',
    landlordId: LL.ken,
    title: 'Hilltop Economy Rooms',
    address: '3 Hilltop Lane, Barangay Ugong',
    city: 'Pasig City',
    price: 5500,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 130,
    description: 'Economy room with shared bathroom at the end of the corridor.',
    status: 'hidden',
    createdDaysAgo: 40,
    updatedDaysAgo: 6,
    imageCount: 4,
    moderationReason:
      'Hidden while ownership of the photos is checked — the same images appear on another platform.',
  },
];

function buildListings(): PropertyListing[] {
  const historyByStatus: Record<PropertyListing['status'], ModerationEvent['action']> = {
    active: 'published',
    flagged: 'flagged',
    correction_requested: 'correction_requested',
    hidden: 'hidden',
  };

  return LISTING_SEEDS.map((seed) => {
    const createdAt = daysAgo(seed.createdDaysAgo, 10, 30);
    const updatedAt = daysAgo(seed.updatedDaysAgo, 16, 10);
    const history: ModerationEvent[] = [{ id: id('mod'), at: createdAt, actorName: 'System', action: 'published', reason: null }];
    if (seed.status !== 'active') {
      const flags = seed.flags ?? [];
      const reason =
        seed.moderationReason ??
        flags[0]?.reason ??
        (seed.status === 'hidden'
          ? 'Listing violates platform rules after a report investigation.'
          : 'Metadata does not match the submitted property record.');
      history.push({ id: id('mod'), at: updatedAt, actorName: flags[0]?.byName ?? AMARA.name, action: historyByStatus[seed.status], reason });
    }
    return {
      id: seed.id,
      landlordId: seed.landlordId,
      title: seed.title,
      address: seed.address,
      city: seed.city,
      price: seed.price,
      bedrooms: seed.bedrooms,
      bathrooms: seed.bathrooms,
      areaSqft: seed.areaSqft,
      description: seed.description,
      status: seed.status,
      createdAt,
      updatedAt,
      imageCount: seed.imageCount,
      flags: seed.flags ?? [],
      moderationHistory: history,
    };
  });
}

/* ------------------------------------------------------------------ reports */

interface ReportSeed {
  id: string;
  reference: string;
  category: ContentReport['category'];
  targetType: ContentReport['targetType'];
  targetId: string;
  targetLabel: string;
  description: string;
  reportedBy: string;
  submittedDaysAgo: number;
  status: ReportStatus;
  assignedTo?: { id: string; name: string };
  findings?: string;
  resolutionNotes?: string;
  resolvedDaysAgo?: number;
  resolvedBy?: string;
  escalatedDaysAgo?: number;
  escalationReason?: string;
}

const REPORT_SEEDS: ReportSeed[] = [
  {
    id: 'rpt-riverside-01',
    reference: 'RPT-2041',
    category: 'fake_listing',
    targetType: 'listing',
    targetId: 'lst-riverside-01',
    targetLabel: 'Riverside Boarding House',
    description:
      'The photos are identical to a listing that was removed last month, and the renter was asked to send a deposit to a personal wallet before any viewing.',
    reportedBy: 'Anonymous renter',
    submittedDaysAgo: 3,
    status: 'open',
  },
  {
    id: 'rpt-tomas-01',
    reference: 'RPT-2044',
    category: 'scam_or_fraud',
    targetType: 'account',
    targetId: LL.tomas,
    targetLabel: 'Tomas Dela Peña (landlord account)',
    description: 'Three renters reported being asked for an advance payment before a viewing was scheduled.',
    reportedBy: 'Karim D.',
    submittedDaysAgo: 1.1,
    status: 'open',
  },
  {
    id: 'rpt-maple-01',
    reference: 'RPT-2046',
    category: 'wrong_information',
    targetType: 'listing',
    targetId: 'lst-maple-01',
    targetLabel: 'Maple Court Room 2',
    description: 'The listing says the room is fully furnished, but the photos show an empty room.',
    reportedBy: 'Joy M.',
    submittedDaysAgo: 0.4,
    status: 'open',
  },
  {
    id: 'rpt-hillview-01',
    reference: 'RPT-2038',
    category: 'duplicate_listing',
    targetType: 'listing',
    targetId: 'lst-hillview-01',
    targetLabel: 'Hillview Dormitory Beds',
    description: 'The same bed appears twice with a different price and a different set of photos.',
    reportedBy: 'Anonymous renter',
    submittedDaysAgo: 4,
    status: 'investigating',
    assignedTo: AMARA,
    findings: 'Both listings point to the same address. Contacting the landlord to confirm which one is current.',
  },
  {
    id: 'rpt-cedar-01',
    reference: 'RPT-2030',
    category: 'inappropriate_content',
    targetType: 'listing',
    targetId: 'lst-cedar-01',
    targetLabel: 'Cedar Lodge Annex',
    description: 'Listing description includes a personal phone number of a previous tenant.',
    reportedBy: 'Anonymous renter',
    submittedDaysAgo: 6,
    status: 'resolved',
    assignedTo: AMARA,
    resolvedDaysAgo: 5,
    resolvedBy: AMARA.id,
    findings: 'The tenant name and number were visible in the fourth photo caption.',
    resolutionNotes:
      'Landlord removed the caption and re-uploaded the photo set. No personal data remains on the listing.',
  },
  {
    id: 'rpt-lagoon-01',
    reference: 'RPT-2043',
    category: 'scam_or_fraud',
    targetType: 'listing',
    targetId: 'lst-lagoon-01',
    targetLabel: 'Lagoon Side Rooms',
    description: 'Two renters say the landlord requested a reservation fee by transfer without offering a viewing.',
    reportedBy: 'Anonymous renter',
    submittedDaysAgo: 2,
    status: 'escalated',
    assignedTo: AMARA,
    escalatedDaysAgo: 1,
    escalationReason:
      'A third renter reported the same pattern. Escalated to the safety review group for a coordinated payout check.',
    findings: 'Payment requests came from a number not listed on the account profile.',
  },
];

function buildReports(): ContentReport[] {
  return REPORT_SEEDS.map((seed) => {
    const submittedAt = daysAgo(seed.submittedDaysAgo, 13, 12);
    const history: ReportEvent[] = [
      { id: id('rptev'), at: submittedAt, actorName: seed.reportedBy, action: 'filed', note: null },
    ];
    if (seed.assignedTo) {
      history.push({
        id: id('rptev'),
        at: daysAgo(Math.max(0.1, seed.submittedDaysAgo - 0.5), 15, 40),
        actorName: seed.assignedTo.name,
        action: 'assigned',
        note: 'Reviewer assigned to the case.',
      });
    }
    if (seed.escalatedDaysAgo !== undefined) {
      history.push({
        id: id('rptev'),
        at: daysAgo(seed.escalatedDaysAgo, 10, 5),
        actorName: seed.assignedTo?.name ?? AMARA.name,
        action: 'escalated',
        note: seed.escalationReason ?? null,
      });
    }
    if (seed.resolvedDaysAgo !== undefined) {
      history.push({
        id: id('rptev'),
        at: daysAgo(seed.resolvedDaysAgo, 16, 30),
        actorName: seed.assignedTo?.name ?? AMARA.name,
        action: 'resolved',
        note: seed.resolutionNotes ?? null,
      });
    }

    return {
      id: seed.id,
      reference: seed.reference,
      category: seed.category,
      targetType: seed.targetType,
      targetId: seed.targetId,
      targetLabel: seed.targetLabel,
      description: seed.description,
      reportedBy: seed.reportedBy,
      submittedAt,
      status: seed.status,
      assignedTo: seed.assignedTo?.id ?? null,
      assignedToName: seed.assignedTo?.name ?? null,
      findings: seed.findings ?? null,
      resolutionNotes: seed.resolutionNotes ?? null,
      resolvedAt:
        seed.resolvedDaysAgo !== undefined ? daysAgo(seed.resolvedDaysAgo, 16, 30) : null,
      resolvedBy: seed.resolvedBy ?? null,
      escalatedAt:
        seed.escalatedDaysAgo !== undefined ? daysAgo(seed.escalatedDaysAgo, 10, 5) : null,
      escalationReason: seed.escalationReason ?? null,
      history,
    };
  });
}

/* ------------------------------------------------------------ audit + noise */

function buildAuditLogs(
  applications: VerificationApplication[],
  listings: PropertyListing[],
  reports: ContentReport[],
  landlords: LandlordAccount[]
): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];

  const push = (
    at: string,
    actorId: string,
    actorName: string,
    action: AuditAction,
    targetType: AuditTargetType,
    targetId: string,
    targetLabel: string,
    reason: string | null = null,
    metadata: Record<string, string | number | boolean> | null = null
  ) => {
    entries.push({
      id: id('aud'),
      at,
      actorId,
      actorName,
      actorRole: 'super_admin',
      action,
      targetType,
      targetId,
      targetLabel,
      reason,
      metadata,
    });
  };

  for (const application of applications) {
    const landlord = landlords.find((entry) => entry.id === application.landlordId);
    const label = `${application.reference} · ${landlord?.fullName ?? 'Landlord'}`;
    if (application.status === 'approved' && application.decidedAt && application.decidedBy) {
      push(
        application.decidedAt,
        application.decidedBy,
        application.decidedByName ?? 'Administrator',
        'verification.approved',
        'application',
        application.id,
        label,
        null,
        { documents: application.documents.length }
      );
    }
    if (application.status === 'rejected' && application.decidedAt && application.decidedBy) {
      push(
        application.decidedAt,
        application.decidedBy,
        application.decidedByName ?? 'Administrator',
        'verification.rejected',
        'application',
        application.id,
        label,
        application.lastReason
      );
    }
    if (application.status === 'info_requested') {
      const event = application.reviewHistory.find((entry) => entry.action === 'info_requested');
      push(
        event?.at ?? application.updatedAt,
        event?.actorId ?? AMARA.id,
        event?.actorName ?? AMARA.name,
        'verification.info_requested',
        'application',
        application.id,
        label,
        application.lastReason
      );
    }
    if (application.assignedTo && application.assignedToName) {
      const event = application.reviewHistory.find((entry) => entry.action === 'assigned');
      if (event) {
        push(
          event.at,
          application.assignedTo,
          application.assignedToName,
          'verification.assigned',
          'application',
          application.id,
          label
        );
      }
    }
  }

  for (const listing of listings) {
    const landlord = landlords.find((entry) => entry.id === listing.landlordId);
    const label = `${listing.title} · ${landlord?.fullName ?? 'Landlord'}`;
    for (const event of listing.moderationHistory) {
      if (event.action === 'published') continue;
      const action: AuditAction =
        event.action === 'flagged'
          ? 'listing.flagged'
          : event.action === 'correction_requested'
            ? 'listing.correction_requested'
            : event.action === 'hidden'
              ? 'listing.hidden'
              : 'listing.restored';
      push(
        event.at,
        AMARA.id,
        event.actorName,
        action,
        'listing',
        listing.id,
        label,
        event.reason
      );
    }
  }

  for (const report of reports) {
    const label = `${report.reference} · ${report.targetLabel}`;
    if (report.assignedTo && report.assignedToName) {
      const event = report.history.find((entry) => entry.action === 'assigned');
      push(
        event?.at ?? report.submittedAt,
        report.assignedTo,
        report.assignedToName,
        'report.assigned',
        'report',
        report.id,
        label
      );
    }
    if (report.status === 'resolved' && report.resolvedAt && report.resolvedBy) {
      push(
        report.resolvedAt,
        report.resolvedBy,
        report.assignedToName ?? AMARA.name,
        'report.resolved',
        'report',
        report.id,
        label,
        report.resolutionNotes
      );
    }
    if (report.status === 'escalated' && report.escalatedAt) {
      push(
        report.escalatedAt,
        report.assignedTo ?? AMARA.id,
        report.assignedToName ?? AMARA.name,
        'report.escalated',
        'report',
        report.id,
        label,
        report.escalationReason
      );
    }
  }

  for (const landlord of landlords) {
    if (landlord.suspendedAt && landlord.suspensionReason) {
      push(
        landlord.suspendedAt,
        AMARA.id,
        landlord.suspendedBy ?? AMARA.name,
        'account.suspended',
        'landlord',
        landlord.id,
        landlord.fullName,
        landlord.suspensionReason
      );
    }
  }

  push(
    daysAgo(7, 17, 12),
    AMARA.id,
    AMARA.name,
    'document.viewed',
    'document',
    'app-peter-01',
    'BPV-1036 · Government ID — front',
    'Cross-checked the document number during the approval review.',
    { durationSeconds: 42 }
  );
  push(
    daysAgo(2, 10, 48),
    AMARA.id,
    AMARA.name,
    'document.viewed',
    'document',
    'app-grace-01',
    'BPV-1046 · Selfie holding ID',
    'Checked readability before requesting a re-upload.',
    { durationSeconds: 27 }
  );

  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------------------------------------------------------- notifications */

function buildNotifications(): AdminNotification[] {
  const rows: Omit<AdminNotification, 'id'>[] = [
    {
      type: 'verification_submitted',
      title: 'New verification application from Sofia Reyes',
      body: 'BPV-1054 was submitted 24 minutes ago with all four required documents attached.',
      at: hoursAgoLocal(0.3),
      read: false,
      severity: 'info',
      route: '/admin/verification/app-sofia-01',
    },
    {
      type: 'verification_resubmitted',
      title: 'Grace Lim resubmitted her documents',
      body: 'BPV-1046 is waiting for a resubmission review before it can be decided.',
      at: hoursAgoLocal(6),
      read: false,
      severity: 'info',
      route: '/admin/verification/app-grace-01',
    },
    {
      type: 'report_filed',
      title: 'Report RPT-2041 filed against Riverside Boarding House',
      body: 'A renter reported a fake listing with photos copied from a removed posting.',
      at: hoursAgoLocal(72),
      read: false,
      severity: 'warning',
      route: '/admin/reports/rpt-riverside-01',
    },
    {
      type: 'unresolved_case',
      title: 'RPT-2041 has been open for 3 days',
      body: 'The report is still unassigned and has passed the 48-hour resolution target.',
      at: hoursAgoLocal(48),
      read: false,
      severity: 'critical',
      route: '/admin/reports/rpt-riverside-01',
    },
    {
      type: 'verification_submitted',
      title: 'New verification application from Daniel Okafor',
      body: 'BPV-1051 was submitted 1 day ago. Proof of address is still missing.',
      at: hoursAgoLocal(26),
      read: true,
      severity: 'info',
      route: '/admin/verification/app-daniel-01',
    },
    {
      type: 'account_suspended',
      title: 'Tomas Dela Peña was suspended',
      body: 'Account suspended after three renter complaints about advance payments.',
      at: hoursAgoLocal(96),
      read: true,
      severity: 'warning',
      route: '/admin/accounts/ll-tomas',
    },
    {
      type: 'report_filed',
      title: 'Report RPT-2038 filed as a duplicate listing',
      body: 'Hillview Dormitory Beds was reported twice with different prices.',
      at: hoursAgoLocal(100),
      read: true,
      severity: 'info',
      route: '/admin/reports/rpt-hillview-01',
    },
    {
      type: 'system',
      title: 'Weekly moderation summary is ready',
      body: 'Listing and report metrics for the last seven days are available in Analytics.',
      at: hoursAgoLocal(168),
      read: true,
      severity: 'info',
      route: '/admin/analytics',
    },
  ];
  return rows.map((row) => ({ ...row, id: id('ntf') }));
}

function hoursAgoLocal(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function buildLandlordNotices(applications: VerificationApplication[]): LandlordNotice[] {
  const notices: LandlordNotice[] = [];

  for (const application of applications) {
    if (application.status === 'approved' && application.decidedAt) {
      notices.push({
        id: id('ntc'),
        landlordId: application.landlordId,
        applicationId: application.id,
        kind: 'approved',
        title: 'Your landlord account is verified',
        body: `Your verification ${application.reference} was approved by ${application.decidedByName ?? 'the review team'}.`,
        nextSteps: 'You can now publish listings. Each listing is still moderated separately.',
        at: application.decidedAt,
        delivery: 'sent',
      });
    }
    if (application.status === 'rejected' && application.decidedAt) {
      notices.push({
        id: id('ntc'),
        landlordId: application.landlordId,
        applicationId: application.id,
        kind: 'rejected',
        title: 'Verification was not approved',
        body: application.lastReason ?? 'Your verification application was rejected.',
        nextSteps: 'Fix the issue described above and submit a new application.',
        at: application.decidedAt,
        delivery: 'sent',
      });
    }
    if (application.status === 'info_requested') {
      notices.push({
        id: id('ntc'),
        landlordId: application.landlordId,
        applicationId: application.id,
        kind: 'info_requested',
        title: 'More information is needed',
        body: application.lastReason ?? 'The review team asked for additional information.',
        nextSteps: 'Upload the requested document to continue the review.',
        at: application.updatedAt,
        delivery: 'sent',
      });
    }
  }

  notices.push({
    id: id('ntc'),
    landlordId: LL.tomas,
    applicationId: null,
    kind: 'suspended',
    title: 'Your account has been suspended',
    body:
      'Three renters reported being asked for payment before a viewing. Suspension held while the open report is investigated.',
    nextSteps: 'Reply to the support team with your side of the reports to request reinstatement.',
    at: daysAgo(4, 9, 30),
    delivery: 'sent',
  });
  notices.push({
    id: id('ntc'),
    landlordId: LL.maria,
    applicationId: null,
    kind: 'correction_requested',
    title: 'Corrections needed on Oakwood Boarding Rooms',
    body: 'The monthly price shown does not match the price in the property record you submitted.',
    nextSteps: 'Update the price and resubmit the listing for another review.',
    at: daysAgo(3, 16, 10),
    delivery: 'sent',
  });
  notices.push({
    id: id('ntc'),
    landlordId: LL.ken,
    applicationId: null,
    kind: 'listing_hidden',
    title: 'Hilltop Economy Rooms was hidden',
    body: 'The listing photos were found on another platform under a different owner.',
    nextSteps: 'Provide proof of ownership for the photos to request a restore.',
    at: daysAgo(6, 14, 20),
    delivery: 'sent',
  });

  return notices.sort((a, b) => b.at.localeCompare(a.at));
}

/* ------------------------------------------------------------------ assemble */

export function createSeedDatabase(): AdminDatabase {
  const seededAt = new Date().toISOString();

  const landlords: LandlordAccount[] = LANDLORD_SEEDS.map((seed) => ({
    id: seed.id,
    fullName: seed.fullName,
    email: seed.email,
    phone: seed.phone,
    city: seed.city,
    address: seed.address,
    idNumberMasked: `•••-••-${String(1000 + (seed.fullName.length * 137) % 8999).slice(0, 4)}`,
    joinedAt: daysAgo(seed.joinedDaysAgo, 8, 5),
    verificationStatus: seed.verification,
    accountStatus: seed.accountStatus,
    suspensionReason: seed.suspension?.reason ?? null,
    suspendedAt: seed.suspension ? daysAgo(seed.suspension.daysAgo, 9, 45) : null,
    suspendedBy: seed.suspension?.by ?? null,
    reactivatedAt: null,
  }));

  const applications = buildApplications();
  const listings = buildListings();
  const reports = buildReports();
  const auditLogs = buildAuditLogs(applications, listings, reports, landlords);

  return {
    version: 2,
    seededAt,
    admins: buildAdminProfiles(seededAt),
    landlords,
    applications,
    listings,
    reports,
    auditLogs,
    notifications: buildNotifications(),
    landlordNotices: buildLandlordNotices(applications),
    preferences: {
      notifyVerification: true,
      notifyReports: true,
      notifyUnresolved: true,
      dailyDigest: false,
      autoLockMinutes: 30,
      defaultDateRange: '30d',
    },
  };
}
