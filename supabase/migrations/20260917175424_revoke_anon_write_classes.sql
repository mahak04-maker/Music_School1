/*
# Revoke write privileges from anon role on classes table

The RLS policies already restrict INSERT/UPDATE/DELETE to authenticated
users only. This goes one step further and revokes the table-level
privileges from the anon role entirely, so unauthenticated users
physically cannot attempt write operations — defense in depth.

1. Security Changes
- REVOKE INSERT, UPDATE, DELETE on `classes` from the `anon` role.
- anon retains SELECT (public read access for the schedule).
- authenticated retains all privileges.
*/

REVOKE INSERT, UPDATE, DELETE ON classes FROM anon;
