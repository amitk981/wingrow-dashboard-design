import {
  AppUser, Proposal, ScoutTrip, Finalization, Onboarding, Approval,
} from '../types';

// ── Users ─────────────────────────────────────────────────────────────────────

export const USERS: AppUser[] = [
  {
    id: 'u1',
    name: 'Mayur Pawar',
    initials: 'MP',
    organization: 'Wingrow',
    role: 'Admin',
    permissions: ['Proposal Initiation', 'Location Hunting', 'Location Finalization', 'Market Onboarding'],
    subordinates: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'],
  },
  {
    id: 'u2',
    name: 'Arjun Mehta',
    initials: 'AM',
    organization: 'Wingrow',
    role: 'Business Development Manager',
    permissions: ['Proposal Initiation', 'Location Hunting', 'Location Finalization'],
    subordinates: ['u4', 'u5', 'u6', 'u7'],
  },
  {
    id: 'u3',
    name: 'Sagar Pawar',
    initials: 'SP',
    organization: 'Wingrow',
    role: 'Market Onboarding Manager',
    permissions: ['Market Onboarding'],
    subordinates: ['u8', 'u9'],
  },
  {
    id: 'u4',
    name: 'Pradip Kakade',
    initials: 'PK',
    organization: 'Wingrow',
    role: 'Field Agent',
    permissions: ['Proposal Initiation', 'Location Hunting', 'Location Finalization'],
    subordinates: [],
  },
  {
    id: 'u5',
    name: 'Ganesh Khade',
    initials: 'GK',
    organization: 'Wingrow',
    role: 'Field Agent',
    permissions: ['Proposal Initiation', 'Location Hunting', 'Location Finalization'],
    subordinates: [],
  },
  {
    id: 'u6',
    name: 'Sanket Pawar',
    initials: 'SaP',
    organization: 'Wingrow',
    role: 'Field Agent',
    permissions: ['Proposal Initiation', 'Location Hunting', 'Location Finalization'],
    subordinates: [],
  },
  {
    id: 'u7',
    name: 'Sanket Shinde',
    initials: 'SS',
    organization: 'Wingrow',
    role: 'Field Agent',
    permissions: ['Proposal Initiation', 'Location Hunting'],
    subordinates: [],
  },
  {
    id: 'u8',
    name: 'Akash Jadhav',
    initials: 'AJ',
    organization: 'Wingrow',
    role: 'Onboarding Agent',
    permissions: ['Market Onboarding'],
    subordinates: [],
  },
  {
    id: 'u9',
    name: 'Pooja More',
    initials: 'PM',
    organization: 'Wingrow',
    role: 'Onboarding Agent',
    permissions: ['Market Onboarding'],
    subordinates: [],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-18');
const d = (days: number) => new Date(TODAY.getTime() - days * 86400000);

// ── Proposals ────────────────────────────────────────────────────────────────

export const PROPOSALS: Proposal[] = [
  {
    id: 'WIN-2026-068', marketType: 'Farmer Market', status: 'In Review',
    initiatorId: 'u5', marketAreaName: 'Ambegaon budharuk', pinCode: '411028', district: 'Pune',
    referenceName: 'Santosh Sir', referenceOrg: 'Corporator', referencePhone: '9284416003',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 40,
    description: 'Farmer market in Ambegaon area with good footfall.', createdAt: d(12), updatedAt: d(12),
    pendingApprovalId: 'a1',
  },
  {
    id: 'WIN-2026-067', marketType: 'Sakhi Market', status: 'In Review',
    initiatorId: 'u4', marketAreaName: 'Hadapsar', pinCode: '411028', district: 'Pune',
    referenceName: 'Bhushan Tupe', referenceOrg: 'Corporator', referencePhone: '9876543210',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 25,
    description: 'Sakhi market initiative in Hadapsar area.', createdAt: d(8), updatedAt: d(8),
    pendingApprovalId: 'a2',
  },
  {
    id: 'WIN-2026-066', marketType: 'Farmer Market', status: 'In Review',
    initiatorId: 'u6', marketAreaName: 'Rejancy Estet Titvala', pinCode: '421605', district: 'Thane',
    referenceName: 'Girish Bhoye', referenceOrg: 'Corporator', referencePhone: '9004400522',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 2, expectedStalls: 60,
    description: 'Combined market in Titvala residential complex.', createdAt: d(7), updatedAt: d(7),
    pendingApprovalId: 'a3',
  },
  {
    id: 'WIN-2026-065', marketType: 'Farmer Market', status: 'In Review',
    initiatorId: 'u4', marketAreaName: 'Maan Village', pinCode: '411067', district: 'Pune',
    referenceName: 'Vanmane', referenceOrg: 'Manager', referencePhone: '9765154010',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 30,
    description: 'Farmer market hub at Maan village.', createdAt: d(14), updatedAt: d(14),
    pendingApprovalId: 'a4',
  },
  {
    id: 'WIN-2026-064', marketType: 'Sakhi Market', status: 'In Review',
    initiatorId: 'u5', marketAreaName: 'Baner Yuthika Society', pinCode: '411045', district: 'Pune',
    referenceName: 'Pooja Desai', referenceOrg: 'Society Sec.', referencePhone: '9823456780',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 0, expectedStalls: 20,
    description: 'Sakhi market within Baner housing society.', createdAt: d(4), updatedAt: d(4),
    pendingApprovalId: 'a5',
  },
  {
    id: 'WIN-2026-063', marketType: 'Sakhi Market', status: 'In Review',
    initiatorId: 'u4', marketAreaName: 'Megapolis Mystic', pinCode: '410507', district: 'Pune',
    referenceName: 'Sagar', referenceOrg: 'Manager', referencePhone: '9712345678',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 45,
    description: 'Combined market for Megapolis township.', createdAt: d(3), updatedAt: d(3),
    pendingApprovalId: 'a6',
  },
  {
    id: 'WIN-2026-062', marketType: 'Farmer Market', status: 'In Review',
    initiatorId: 'u4', marketAreaName: 'Mega Polish Hiranmewali Phase 3', pinCode: '411041', district: 'Pune',
    referenceName: 'Sarpanch', referenceOrg: 'Corporator', referencePhone: '9600123456',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 35,
    description: 'Farmer market at Phase 3 of Hiranmewali project.', createdAt: d(4), updatedAt: d(4),
    pendingApprovalId: 'a7',
  },
  {
    id: 'WIN-2026-061', marketType: 'Sakhi Market', status: 'In Review',
    initiatorId: 'u4', marketAreaName: 'Hiraswadi', pinCode: '411026', district: 'Pune',
    referenceName: 'Ramesh Pawar', referenceOrg: 'Corporator', referencePhone: '9998877665',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 15,
    description: 'Sakhi market initiative in Hiraswadi locality.', createdAt: d(2), updatedAt: d(2),
    pendingApprovalId: 'a8',
  },
  {
    id: 'WIN-2026-055', marketType: 'Farmer Market', status: 'Approved',
    initiatorId: 'u5', marketAreaName: 'Nashik Farmers Central', pinCode: '422010', district: 'Nashik',
    referenceName: 'Suresh Patil', referenceOrg: 'Corporator', referencePhone: '9876501234',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 2, expectedStalls: 80,
    description: 'Main farmer market hub for Nashik region.', createdAt: d(30), updatedAt: d(18),
  },
  {
    id: 'WIN-2026-050', marketType: 'Sakhi Market', status: 'Approved',
    initiatorId: 'u6', marketAreaName: 'Pune Sakhi Center West', pinCode: '411038', district: 'Pune',
    referenceName: 'Meena Joshi', referenceOrg: 'NGO Partner', referencePhone: '9765432100',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 3, expectedStalls: 35,
    description: 'Sakhi empowerment center, West Pune.', createdAt: d(25), updatedAt: d(14),
  },
  {
    id: 'WIN-2026-048', marketType: 'Farmer Market', status: 'Approved',
    initiatorId: 'u4', marketAreaName: 'Nagpur Integrated Market', pinCode: '440010', district: 'Nagpur',
    referenceName: 'Vijay Nair', referenceOrg: 'Corporator', referencePhone: '9800112233',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 2, expectedStalls: 50,
    description: 'Integrated market covering both farmer and sakhi segments.', createdAt: d(35), updatedAt: d(22),
  },
  {
    id: 'WIN-2026-040', marketType: 'Farmer Market', status: 'Rejected',
    initiatorId: 'u7', marketAreaName: 'Solapur East Hub', pinCode: '413001', district: 'Solapur',
    referenceName: 'Deepak Koli', referenceOrg: 'Manager', referencePhone: '9765001122',
    assignedOfficerId: 'u2', priority: 'Normal', docsCount: 1, expectedStalls: 20,
    description: 'Farmer market in Solapur east zone — rejected due to site issues.', createdAt: d(45), updatedAt: d(38),
  },
];

// ── Scout Trips ───────────────────────────────────────────────────────────────

export const SCOUT_TRIPS: ScoutTrip[] = [
  {
    id: 'WIN-2026-010', proposalId: 'WIN-2026-055', initiatorId: 'u4',
    locationName: 'Keshan Nagar', pinCode: '422010', marketType: 'Farmer Market', district: 'Nashik',
    visitDate: d(9), parkingAvailable: true,
    address: 'Sancheti Belacstel Block C1, SANCHETI BELCASTEL, Keshan Nagar, Nashik',
    consumerCategory: 'Premium Class', competitors: 'Sakhi market 1.5 month\'s ago',
    ownership: 'Society', households: 800, expectedOutlets: 25, completeness: 62,
    status: 'Trip In Review', priority: 'Normal', docsCount: 1,
    createdAt: d(10), updatedAt: d(7), pendingApprovalId: 'a9',
  },
  {
    id: 'WIN-2026-009', proposalId: 'WIN-2026-055', initiatorId: 'u4',
    locationName: 'Keshan Nagar', pinCode: '422010', marketType: 'Farmer Market', district: 'Nashik',
    visitDate: d(13), parkingAvailable: true,
    address: 'DKCH+M4R, K wing, Venkatesh Graffic Gate 2, Keshan Nagar',
    consumerCategory: 'Premium Class', competitors: 'Sakhi market happened in March',
    ownership: 'Society', households: 800, expectedOutlets: 25, completeness: 45,
    status: 'Trip In Review', priority: 'Normal', docsCount: 0,
    createdAt: d(14), updatedAt: d(6), pendingApprovalId: 'a10',
  },
  {
    id: 'WIN-2026-007', proposalId: 'WIN-2026-050', initiatorId: 'u6',
    locationName: 'Wakad Sankruti Society', pinCode: '411057', marketType: 'Sakhi Market', district: 'Pune',
    visitDate: d(5), parkingAvailable: false,
    address: 'Wakad Sankruti Society, Wakad, Pune',
    consumerCategory: 'Middle Class', competitors: 'None known',
    ownership: 'Society', households: 450, expectedOutlets: 15, completeness: 80,
    status: 'Trip Approved', priority: 'Normal', docsCount: 1,
    createdAt: d(7), updatedAt: d(2),
  },
];

// ── Finalizations ─────────────────────────────────────────────────────────────

export const FINALIZATIONS: Finalization[] = [
  { id: 'WIN-037', proposalTitle: 'Vidya Vikas Market', pinCode: '422010', marketName: 'Vidya Vikas Market', marketAddress: '103, Market Nagar, Madhav Nagar, Tilke Colony, Nashik, Maharashtra 422010', marketType: 'Farmer Market', category: 'Premium Class', households: 100, ownershipType: 'Private', docType: 'Agreement', operatingDays: 'Sun', operatingTime: '12:00 – 02:00 PM', numberOfOutlets: 100, finalizedRent: '₹10000 / monthly', status: 'Sent to Onboarding', createdBy: 'u4', createdAt: d(20), updatedAt: d(5) },
  { id: 'WIN-038', proposalTitle: 'New Market Nashik', pinCode: '470052', marketName: 'New Market', marketAddress: 'G2K1+H8, Mumbai Hata, Madhav Nagar, Nashik', marketType: 'Sakhi Market', category: 'Middle Class', households: 0, ownershipType: 'Private', docType: 'Permission Letter', operatingDays: 'Sun, Mon, Tue, Thu, Fri, Sat, Wed', operatingTime: 'All Day', numberOfOutlets: 44, finalizedRent: '₹10000 / monthly', status: 'Sent to Onboarding', createdBy: 'u6', createdAt: d(18), updatedAt: d(4) },
  { id: 'WIN-033', proposalTitle: 'dd', pinCode: '422010', marketName: 'dd Market', marketAddress: 'G.B.H+49 Anjameri, Maharashtra, India', marketType: 'Sakhi Market', category: 'Middle Class', households: 33, ownershipType: 'Private', docType: 'Permission Letter', operatingDays: 'Wed', operatingTime: '09:00 – 01:00 PM', numberOfOutlets: 0, finalizedRent: '₹ 333 / monthly', status: 'Sent to Onboarding', createdBy: 'u4', createdAt: d(16), updatedAt: d(3) },
  { id: 'WIN-034', proposalTitle: 'APMC Market', pinCode: '413005', marketName: 'APMC Market', marketAddress: '5H, Shivalineshwar Market Yard, Old Rangun Nagar, Solapur', marketType: 'Farmer Market', category: 'Premium Class', households: 10, ownershipType: 'Private', docType: 'No Objection', operatingDays: 'Tue, Thu', operatingTime: '08:00 – 12:00 PM', numberOfOutlets: 15, finalizedRent: '₹ 4500 / monthly', status: 'Sent to Onboarding', createdBy: 'u5', createdAt: d(14), updatedAt: d(2) },
  { id: 'WIN-035', proposalTitle: 'Nasik Central', pinCode: '422010', marketName: 'Nasik', marketAddress: 'Madhav Nagar, Nasik, Maharashtra', marketType: 'Farmer Market', category: 'Upper Class', households: 800, ownershipType: 'Private', docType: 'Agreement', operatingDays: 'Fri', operatingTime: '07:00 – 11:00 AM', numberOfOutlets: 350, finalizedRent: '₹ 1200 / monthly', status: 'Sent to Onboarding', createdBy: 'u4', createdAt: d(12), updatedAt: d(1) },
  { id: 'WIN-036', proposalTitle: 'Flora Fountain Market', pinCode: '400001', marketName: 'Flora Fountain Market', marketAddress: 'Flora Fountain, Fort, Mumbai', marketType: 'Sakhi Market', category: 'Premium Class', households: 200, ownershipType: 'Government', docType: 'Permission Letter', operatingDays: 'Sat, Sun', operatingTime: '10:00 – 02:00 PM', numberOfOutlets: 50, finalizedRent: '₹ 8000 / monthly', status: 'Sent to Onboarding', createdBy: 'u6', createdAt: d(10), updatedAt: d(1) },
  { id: 'WIN-031', proposalTitle: 'Jaleb Market', pinCode: '422213', marketName: 'Jaleb Market', marketAddress: 'G5G3+5D4, Laxmi Nagar, Gandhi Nagar, Anjaeri Area, Gandhi Saint, Nashik', marketType: 'Sakhi Market', category: 'Middle Class', households: 25, ownershipType: 'Private', docType: 'Permission Letter', operatingDays: 'Fri', operatingTime: '08:00 – 12:00 PM', numberOfOutlets: 4, finalizedRent: '₹ 5488 / monthly', status: 'In Review', createdBy: 'u4', createdAt: d(8), updatedAt: d(0), pendingApprovalId: 'a11' },
  { id: 'WIN-039', proposalTitle: 'Nashik Agri Hub', pinCode: '422010', marketName: 'Nashik Agri Hub Market', marketAddress: 'Survey No. 12, Satpur MIDC, Nashik, Maharashtra 422010', marketType: 'Farmer Market', category: 'Premium Class', households: 450, ownershipType: 'Private', docType: 'Agreement', operatingDays: 'Sat, Sun', operatingTime: '07:00 – 01:00 PM', numberOfOutlets: 60, finalizedRent: '₹ 12000 / monthly', status: 'Approved', createdBy: 'u4', createdAt: d(6), updatedAt: d(1) },
  { id: 'WIN-040', proposalTitle: 'Pune Sakhi Bazaar', pinCode: '411038', marketName: 'Pune Sakhi Bazaar', marketAddress: 'Near Westend Mall, Aundh, Pune, Maharashtra 411038', marketType: 'Sakhi Market', category: 'Middle Class', households: 280, ownershipType: 'Society', docType: 'Permission Letter', operatingDays: 'Wed, Sun', operatingTime: '09:00 – 02:00 PM', numberOfOutlets: 35, finalizedRent: '₹ 8500 / monthly', status: 'Approved', createdBy: 'u5', createdAt: d(5), updatedAt: d(1) },
];

// ── Onboardings ───────────────────────────────────────────────────────────────

export const ONBOARDINGS: Onboarding[] = [
  { id: 'WIN-037', marketName: 'Vidya Vikas Market', marketAddress: '103, Market Nagar, Madhav Nagar, Tilke Colony, Nashik', pinCode: '422010', marketType: 'Farmer Market', category: 'Premium Class', households: 100, ownershipType: 'Private', docType: 'Agreement', operatingDays: 'Sun', operatingTime: '10:00 – 02:00 PM', numberOfOutlets: 100, managerId: 'u8', bondingMethod: 'Fixed Rent', rentPerOutletPerWeek: 100000, status: 'Approved', createdBy: 'u8', createdAt: d(15), updatedAt: d(3) },
  { id: 'WIN-038', marketName: 'New Market', marketAddress: 'G2K1+H8, Mumbai Hata, Madhav Nagar, Nashik', pinCode: '470052', marketType: 'Sakhi Market', category: 'Middle Class', households: 0, ownershipType: 'Private', docType: 'Permission Letter', operatingDays: 'Sun–Sat', operatingTime: 'All Day', numberOfOutlets: 44, managerId: 'u9', bondingMethod: 'Fixed Rent', rentPerOutletPerWeek: 30800, status: 'Approved', createdBy: 'u9', createdAt: d(14), updatedAt: d(2) },
  { id: 'WIN-033', marketName: 'dd Market', marketAddress: 'G.B.H+49 Anjameri, Maharashtra', pinCode: '422010', marketType: 'Sakhi Market', category: 'Middle Class', households: 33, ownershipType: 'Private', docType: 'Permission Letter', operatingDays: 'Wed', operatingTime: '09:00 – 01:00 PM', numberOfOutlets: 0, managerId: 'u9', bondingMethod: 'Fixed Rent', rentPerOutletPerWeek: 1088, status: 'Approved', createdBy: 'u9', createdAt: d(12), updatedAt: d(1) },
  { id: 'WIN-034', marketName: 'APMC Market', marketAddress: '5H, Shivalineshwar Market Yard, Solapur', pinCode: '413005', marketType: 'Farmer Market', category: 'Premium Class', households: 10, ownershipType: 'Private', docType: 'No Objection', operatingDays: 'Tue, Thu', operatingTime: '08:00 – 12:00 PM', numberOfOutlets: 15, managerId: 'u8', bondingMethod: 'Subscription', rentPerOutletPerWeek: 9560, status: 'Approved', createdBy: 'u8', createdAt: d(10), updatedAt: d(1) },
  { id: 'WIN-035', marketName: 'Nasik Central', marketAddress: 'Madhav Nagar, Nasik, Maharashtra', pinCode: '422010', marketType: 'Farmer Market', category: 'Upper Class', households: 800, ownershipType: 'Private', docType: 'Agreement', operatingDays: 'Fri', operatingTime: '07:00 – 11:00 AM', numberOfOutlets: 350, managerId: 'u8', bondingMethod: 'Fixed Rent', rentPerOutletPerWeek: 1097358, status: 'Approved', createdBy: 'u8', createdAt: d(9), updatedAt: d(1) },
  { id: 'WIN-036', marketName: 'Flora Fountain Market', marketAddress: 'Flora Fountain, Fort, Mumbai', pinCode: '400001', marketType: 'Sakhi Market', category: 'Premium Class', households: 200, ownershipType: 'Government', docType: 'Permission Letter', operatingDays: 'Sat, Sun', operatingTime: '10:00 – 02:00 PM', numberOfOutlets: 50, managerId: 'u9', bondingMethod: 'Fixed Rent', rentPerOutletPerWeek: 0, status: 'Approved', createdBy: 'u9', createdAt: d(8), updatedAt: d(1) },
  { id: 'WIN-031', marketName: 'Jaleb Market', marketAddress: 'G5G3+5D4, Laxmi Nagar, Nashik', pinCode: '422213', marketType: 'Sakhi Market', category: 'Middle Class', households: 25, ownershipType: 'Private', docType: 'Permission Letter', operatingDays: 'Fri', operatingTime: '08:00 – 12:00 PM', numberOfOutlets: 4, managerId: 'u8', bondingMethod: 'Subscription', rentPerOutletPerWeek: 5488, status: 'Pending', createdBy: 'u8', createdAt: d(3), updatedAt: d(0), pendingApprovalId: 'a12' },
];

// ── Approvals ─────────────────────────────────────────────────────────────────
// Overdue = status Pending AND requestedAt > 5 days ago (before 2026-05-13)

export const APPROVALS: Approval[] = [
  // Proposals → BD Manager (u2) — OVERDUE (>5 days)
  { id: 'a1', entityId: 'WIN-2026-068', entityTitle: 'Ambegaon budharuk', module: 'Proposal Initiation', requestedBy: 'u5', requestedAt: d(12), status: 'Pending', assignedTo: 'u2', marketType: 'Farmer Market', notes: 'Site survey complete, awaiting approval' },
  { id: 'a2', entityId: 'WIN-2026-067', entityTitle: 'Hadapsar', module: 'Proposal Initiation', requestedBy: 'u4', requestedAt: d(8), status: 'Pending', assignedTo: 'u2', marketType: 'Sakhi Market', notes: 'Corporator confirmed availability' },
  { id: 'a3', entityId: 'WIN-2026-066', entityTitle: 'Rejancy Estet Titvala', module: 'Proposal Initiation', requestedBy: 'u6', requestedAt: d(7), status: 'Pending', assignedTo: 'u2', marketType: 'Farmer Market', notes: 'High footfall area confirmed' },
  { id: 'a4', entityId: 'WIN-2026-065', entityTitle: 'Maan Village', module: 'Proposal Initiation', requestedBy: 'u4', requestedAt: d(14), status: 'Pending', assignedTo: 'u2', marketType: 'Farmer Market', notes: 'Village sarpanch agreement obtained' },
  // Proposals → BD Manager (u2) — NOT overdue (<5 days)
  { id: 'a5', entityId: 'WIN-2026-064', entityTitle: 'Baner Yuthika Society', module: 'Proposal Initiation', requestedBy: 'u5', requestedAt: d(4), status: 'Pending', assignedTo: 'u2', marketType: 'Sakhi Market' },
  { id: 'a6', entityId: 'WIN-2026-063', entityTitle: 'Megapolis Mystic', module: 'Proposal Initiation', requestedBy: 'u4', requestedAt: d(3), status: 'Pending', assignedTo: 'u2', marketType: 'Sakhi Market' },
  { id: 'a7', entityId: 'WIN-2026-062', entityTitle: 'Mega Polish Hiranmewali Phase 3', module: 'Proposal Initiation', requestedBy: 'u4', requestedAt: d(4), status: 'Pending', assignedTo: 'u2', marketType: 'Farmer Market' },
  { id: 'a8', entityId: 'WIN-2026-061', entityTitle: 'Hiraswadi', module: 'Proposal Initiation', requestedBy: 'u4', requestedAt: d(2), status: 'Pending', assignedTo: 'u2', marketType: 'Sakhi Market' },
  // Location Hunting → BD Manager (u2) — OVERDUE
  { id: 'a9', entityId: 'WIN-2026-010', entityTitle: 'Keshan Nagar (Trip 1)', module: 'Location Hunting', requestedBy: 'u4', requestedAt: d(7), status: 'Pending', assignedTo: 'u2', marketType: 'Farmer Market', notes: 'Site visit complete, report attached' },
  { id: 'a10', entityId: 'WIN-2026-009', entityTitle: 'Keshan Nagar (Trip 2)', module: 'Location Hunting', requestedBy: 'u4', requestedAt: d(6), status: 'Pending', assignedTo: 'u2', marketType: 'Farmer Market', notes: 'Second trip, better parking access confirmed' },
  // Location Finalization → BD Manager (u2) — NOT overdue
  { id: 'a11', entityId: 'WIN-031', entityTitle: 'Jaleb Market', module: 'Location Finalization', requestedBy: 'u4', requestedAt: d(1), status: 'Pending', assignedTo: 'u2', marketType: 'Sakhi Market' },
  // Market Onboarding → MO Manager (u3) — NOT overdue
  { id: 'a12', entityId: 'WIN-031', entityTitle: 'Jaleb Market Onboarding', module: 'Market Onboarding', requestedBy: 'u8', requestedAt: d(3), status: 'Pending', assignedTo: 'u3', marketType: 'Sakhi Market', notes: 'Ready for final approval' },
  // Historical
  { id: 'a20', entityId: 'WIN-2026-055', entityTitle: 'Nashik Farmers Central', module: 'Proposal Initiation', requestedBy: 'u5', requestedAt: d(28), status: 'Approved', assignedTo: 'u2', marketType: 'Farmer Market' },
  { id: 'a21', entityId: 'WIN-2026-050', entityTitle: 'Pune Sakhi Center West', module: 'Proposal Initiation', requestedBy: 'u6', requestedAt: d(24), status: 'Approved', assignedTo: 'u2', marketType: 'Sakhi Market' },
  { id: 'a22', entityId: 'WIN-2026-048', entityTitle: 'Nagpur Integrated Market', module: 'Proposal Initiation', requestedBy: 'u4', requestedAt: d(34), status: 'Approved', assignedTo: 'u2', marketType: 'Farmer Market' },
];
