export type MarketType = 'Farmer Market' | 'Sakhi Market';
export type ProposalStatus = 'Draft' | 'In Review' | 'Approved' | 'Rejected';
export type TripStatus = 'Trip In Review' | 'Trip Approved' | 'Push to Finalization';
export type FinalizationStatus = 'In Review' | 'Approved' | 'Sent to Onboarding';
export type OnboardingStatus = 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type AppModule = 'Proposal Initiation' | 'Location Hunting' | 'Location Finalization' | 'Market Onboarding';
export type Priority = 'Normal' | 'High' | 'Urgent';
export type DocType = 'Agreement' | 'Permission Letter' | 'No Objection' | 'None';
export type OwnershipType = 'Private' | 'Society' | 'Government';
export type MarketCategory = 'Premium Class' | 'Middle Class' | 'Upper Class';
export type BondingMethod = 'Fixed Rent' | 'Subscription';

export interface AppUser {
  id: string;
  name: string;
  initials: string;
  organization: string;
  role: string;
  permissions: AppModule[];
  subordinates: string[]; // user IDs of direct reports
}

export interface Proposal {
  id: string;              // WIN-2026-XXX
  marketType: MarketType;
  status: ProposalStatus;
  // Initiator info
  initiatorId: string;
  // Market area
  marketAreaName: string;
  pinCode: string;
  district: string;
  // Reference
  referenceName: string;
  referenceOrg: string;
  referencePhone: string;
  // Assignment
  assignedOfficerId: string;
  // Meta
  priority: Priority;
  docsCount: number;
  expectedStalls: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  pendingApprovalId?: string;
}

export interface ScoutTrip {
  id: string;
  proposalId: string;
  initiatorId: string;
  locationName: string;
  pinCode: string;
  marketType: MarketType;
  district: string;
  visitDate?: Date;
  parkingAvailable?: boolean;
  address: string;
  consumerCategory: MarketCategory;
  competitors: string;
  ownership: OwnershipType;
  households: number;
  expectedOutlets: number;
  completeness: number; // 0-100
  status: TripStatus;
  priority: Priority;
  docsCount: number;
  createdAt: Date;
  updatedAt: Date;
  pendingApprovalId?: string;
}

export interface Finalization {
  id: string;              // WIN-XXX
  tripId?: string;
  proposalTitle: string;
  pinCode: string;
  marketName: string;
  marketAddress: string;
  marketType: MarketType;
  category: MarketCategory;
  households: number;
  ownershipType: OwnershipType;
  docType: DocType;
  operatingDays: string;
  operatingTime: string;
  numberOfOutlets: number;
  finalizedRent: string;
  status: FinalizationStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  pendingApprovalId?: string;
}

export interface Onboarding {
  id: string;              // WIN-XXX
  finalizationId?: string;
  marketName: string;
  marketAddress: string;
  pinCode: string;
  marketType: MarketType;
  category: MarketCategory;
  households: number;
  ownershipType: OwnershipType;
  docType: DocType;
  operatingDays: string;
  operatingTime: string;
  numberOfOutlets: number;
  managerId: string;
  bondingMethod: BondingMethod;
  rentPerOutletPerWeek: number;
  status: OnboardingStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  pendingApprovalId?: string;
}

export interface Approval {
  id: string;
  entityId: string;
  entityTitle: string;
  module: AppModule;
  requestedBy: string;
  requestedAt: Date;
  status: ApprovalStatus;
  assignedTo: string;
  marketType: MarketType;
  notes?: string;
}

export type DatePreset = 'all' | 'today' | 'yesterday' | 'last5' | 'last30' | '3months';

export interface FilterState {
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
  marketType: MarketType | 'All';
  userId: string;
}
