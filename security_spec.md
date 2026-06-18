# Security Specification - Protagonistas del Cambio

## Data Invariants
1. A **Project** must have a title, category, authorId, and createdAt.
2. A **StudentWork** must have a title, content, studentName, workType, and year.
3. A **Material** must have a title, subject, and teacherName. Only admins/teachers should create materials.
4. **Public Read**: All contents are public for viewing to promote democratization of knowledge.
5. **Ownership**: Users can only edit/delete their own submissions.
6. **Admin**: `crwom01@gmail.com` has full access to manage content.

## The Dirty Dozen (Potential Attacks)
1. **Identity Spoofing**: Trying to create a project with someone else's `authorId`.
2. **Resource Poisoning**: Injecting massive strings (> 1MB) into simple fields like `title`.
3. **Ghost Fields**: Adding arbitrary fields like `isAdmin: true` to a user profile or document.
4. **State Shortcutting**: Updating `createdAt` to a backdated time.
5. **Privilege Escalation**: Non-admin attempting to delete a resource they don't own.
6. **PII Leak**: Accessing internal config that shouldn't be public (though this app doesn't have much PII).
7. **Malformed IDs**: Using junk characters in document IDs.
8. **Broken Relationships**: Referencing a non-existent parent project in a sub-document.
9. **Unverified Writes**: Creating content without a verified email (for protected categories).
10. **Bulk Scraping**: Aggressively listing all documents (mitigated by read limits).
11. **Negative Sizes**: Using negative numbers if any numeric fields existed.
12. **Type Confusion**: Sending a list where a string is expected.

## Security Rules Strategy
1. **isValidId**: Ensure document IDs match expected pattern.
2. **isValid[Entity]**: Validate presence and type of required fields.
3. **isOwner**: Compare `request.auth.uid` with `resource.data.authorId`.
4. **isAdmin**: Check email for `crwom01@gmail.com`.
5. **Strict Timestamps**: Use `request.time`.
