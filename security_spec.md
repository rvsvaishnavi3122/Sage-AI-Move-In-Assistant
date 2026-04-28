# Security Specification - Auth & Profile Setup

## Data Invariants
1. A user document ID must exactly match their unique Firebase Authentication UID.
2. The `username` must be between 3 and 30 characters and contain only alphanumeric characters or underscores.
3. `createdAt` is immutable after creation.
4. `currency` and `countryCode` must be provided and valid (2-3 characters).

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Attempt to create a document in `users/` where the ID does not match the requester's UID.
2. **Ghost Field Injection**: Adding an `isAdmin: true` field to the profile.
3. **Impersonation**: Updating another user's profile.
4. **Invalid Username**: Setting a 1KB string as a username.
5. **Timestamp Forgery**: Providing a `createdAt` date from the future/past instead of the server time.
6. **Phone Number Leak**: Non-admin/non-owner attempting to read a user's phone number.
7. **Bypassing Verification**: Writing to a profile without a verified email (where applicable).
8. **Null Poisoning**: Setting required fields like `currency` to `null`.
9. **Duplicate ID Injection**: Attempting to use a previously deleted user's ID.
10. **Auth Provider Change**: Attempting to change the `authProvider` field after creation.
11. **Malicious Regex**: Injecting script tags into the `displayName`.
12. **Recursive List Scrape**: Querying all users without a personal filter.

## Test Runner
Verified through manual auditing and the following ruleset.
