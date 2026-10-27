# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Global Default Deny**: Any path not explicitly matched under `/adjudications/{adjudicationId}`, `/savedWorks/{workId}`, or `/iconocraciaCatalog/{entryId}` is unconditionally denied (`allow read, write: if false`).
2. **Verified Identity Invariant**: Every read and write operation requires an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
3. **Ownership Isolation**:
   - An `Adjudication` document can only be created, read, listed, updated, or deleted if `reviewerUid == request.auth.uid`.
   - A `SavedWork` document can only be created, read, listed, or deleted if `ownerUid == request.auth.uid`.
   - An `IconocraciaCatalogEntry` document can only be created, read, listed, or deleted if `ownerUid == request.auth.uid`.
4. **Schema & Volumetric Bounds (Synchronicity with `firebase-blueprint.json`)**:
   - Every string field enforces strict `.size()` bounds and regex patterns (`^[a-zA-Z0-9_:\-]+$`, `^[a-zA-Z0-9_:\-.]+$`, `^[a-zA-Z0-9_\-]+$`).
   - Document IDs (`adjudicationId`, `workId`, `entryId`) are validated with `isValidId(id)` (`<= 128` chars, alphanumeric/hyphen/underscore).
   - Bounded Array Guarding on `IconocraciaCatalogEntry.visualAttributes`: Strictly constrained to `data.visualAttributes is list && data.visualAttributes.size() >= 1 && data.visualAttributes.size() <= 12 && data.visualAttributes[0] is string && data.visualAttributes[0].size() <= 100`.
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation, and `updatedAt == request.time` with `createdAt == existing().createdAt` on update.
6. **Terminal State Locking**: Once an `Adjudication` reaches `decision == 'human_verified'`, subsequent updates are blocked (preventing silent tampering of finalized human adjudications).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Create `/adjudications/adj_1` with `auth = null`.
2. **Unverified Email Spoof**: Create `/adjudications/adj_1` with `email_verified = false`.
3. **Identity Spoofing on Create**: Create `/iconocraciaCatalog/entry_1` where `ownerUid` is `"victim_uid"` while `auth.uid` is `"attacker_uid"`.
4. **Shadow / Ghost Field Injection**: Create `/iconocraciaCatalog/entry_1` including an undeclared field `"kappaScore": 0.91`.
5. **ID Poisoning Attack**: Create `/adjudications/bad$id!with/slashes` or >128 char ID.
6. **Denial-of-Wallet Oversized String**: Create `/adjudications/adj_1` with `notes` of 10,000 characters (`> 1500` limit).
7. **Client Timestamp Forgery**: Create `/iconocraciaCatalog/entry_1` with a backdated `createdAt` != `request.time`.
8. **Cross-Tenant List Scraping**: Query `collection(db, 'iconocraciaCatalog')` without `where('ownerUid', '==', auth.uid)`.
9. **Immutable Field Mutation on Update**: Update `/adjudications/adj_1` changing `caseId` or `reviewerUid`.
10. **Terminal State Reversal**: Update `/adjudications/adj_1` after `decision` is already `'human_verified'`.
11. **Array Overflow / Unbounded List Attack**: Create `/iconocraciaCatalog/entry_1` with `visualAttributes` containing 25 elements (`> 12` max) or non-string first element.
12. **Unauthorized Cross-User Delete**: Delete `/savedWorks/work_1` or `/iconocraciaCatalog/entry_1` owned by another user (`ownerUid != request.auth.uid`).
