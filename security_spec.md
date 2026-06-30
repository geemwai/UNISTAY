# Security Specifications for UNISTAY

This document outlines the zero-trust data security specifications, invariants, and threat analysis for the UNISTAY application database schema on Cloud Firestore.

## 1. Data Invariants

1. **Role Separation**: A user cannot modify their own role (e.g. elevate themselves to `admin`). Roles are system-assigned or managed by existing administrators.
2. **Authenticated Access**: Document listings are only visible to logged-in students or administrators. An unauthenticated guest cannot query room listings.
3. **Listing Integrity**: Only authenticated administrators can create, edit, or delete room listings. Students have read-only access.
4. **Valid Rent bounds**: Any listing must enforce a monthly rent of at least KSh 5,000.
5. **Review Approval**: Students can create reviews, but they are created with `approved = false`. Only administrators can update `approved` to `true` or delete reviews.
6. **Path Protection**: Document IDs must conform to secure formats (`isValidId()`) and never exceed safe string bounds to mitigate Denial of Wallet attacks.

---

## 2. The "Dirty Dozen" Threat Payloads

Below are the 12 malicious payloads designed to challenge our Firestore security rules, which must all be rejected with `PERMISSION_DENIED`.

### Pillar 1: Identity & Privilege Escalation
1. **Self-Escalation Attack**: A student attempts to write `role: "admin"` to their `/users/{userId}` profile during registration.
2. **Profile Theft Attack**: User `student_A` attempts to modify the profile document of `student_B` at `/users/student_B`.
3. **Admin Claim Mocking**: A user attempts to bypass auth checks by supplying custom token parameters (e.g. mock token claims) to Firestore client.

### Pillar 2: Write Integrity & Content Injection
4. **Malicious Listing Insertion**: A non-admin student attempts to create a listing document under `/listings/{listingId}`.
5. **Unauthorized Listing Mutation**: A non-admin student attempts to modify an existing listing's rent or availability status.
6. **Negative Rent Exploit**: An admin (or compromised account) attempts to save a listing with `monthlyRent: 2000` (violating the KSh 5,000 minimum).
7. **Size-Bomb Attack**: A user attempts to upload a review with a comment of 2MB to exhaust Firestore storage space.
8. **Invalid ID Injection**: A malicious client attempts to create a listing with a 10KB string as the `{listingId}` document ID path variable.

### Pillar 3: Status & Review Manipulation
9. **Self-Approval Review**: A student attempts to submit a review with `approved: true` to bypass administrative moderation.
10. **Review Deletion Hijack**: A student attempts to delete another student's review or a review they created after it has been moderator-approved.
11. **Settings Tampering**: An unauthenticated user attempts to update contact info or the administrator's WhatsApp number in `/settings/contact`.
12. **FAQ Override**: A student attempts to change the FAQ answers or inject phishing links into the `/faqs/{faqId}` collection.

---

## 3. Test Runner Specification

We will implement the validation rules inside `/firestore.rules` and verify them via security rule deployment.
Below is the outline for testing these rules.

```typescript
// firestore.rules.test.ts (Conceptual Security Test Suite)
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('UNISTAY Security Rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'nairobi-rental-finder-d2e2f',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  it('blocks student from elevating their own role', async () => {
    const studentDb = testEnv.authenticatedContext('student_123').firestore();
    await assertFails(studentDb.collection('users').doc('student_123').set({
      uid: 'student_123',
      email: 'student@example.com',
      name: 'Student One',
      role: 'admin',
      createdAt: new Date().toISOString()
    }));
  });

  it('blocks student from creating listings', async () => {
    const studentDb = testEnv.authenticatedContext('student_123').firestore();
    await assertFails(studentDb.collection('listings').doc('listing_abc').set({
      title: 'Luxury shared room',
      monthlyRent: 8000,
      location: 'Main Gate'
    }));
  });
});
```
