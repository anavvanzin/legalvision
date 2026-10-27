/**
 * Verification suite for the 12 "Dirty Dozen" adversarial payloads against firestore.rules.
 */
export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: 'adjudications' | 'savedWorks' | 'iconocraciaCatalog';
  operation: 'create' | 'update' | 'list' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  { id: 1, name: 'Unauthenticated Write', collection: 'adjudications', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unverified Email Spoof', collection: 'adjudications', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 3, name: 'Identity Spoofing on Create', collection: 'iconocraciaCatalog', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 4, name: 'Shadow Field Injection', collection: 'iconocraciaCatalog', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 5, name: 'ID Poisoning Attack', collection: 'adjudications', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 6, name: 'Oversized String (>1500 chars)', collection: 'adjudications', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 7, name: 'Client Timestamp Forgery', collection: 'iconocraciaCatalog', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 8, name: 'Cross-Tenant List Scraping', collection: 'iconocraciaCatalog', operation: 'list', expectedResult: 'PERMISSION_DENIED' },
  { id: 9, name: 'Immutable Field Mutation', collection: 'adjudications', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 10, name: 'Terminal State Reversal (human_verified)', collection: 'adjudications', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 11, name: 'Bounded Array Violation (>12 items in visualAttributes)', collection: 'iconocraciaCatalog', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 12, name: 'Unauthorized Cross-User Delete', collection: 'savedWorks', operation: 'delete', expectedResult: 'PERMISSION_DENIED' },
];
