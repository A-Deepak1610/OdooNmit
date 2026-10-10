/**
 * Extensible Role System
 *
 * NOTE FOR HACKATHON PARTICIPANTS:
 * The problem statement has not yet specified roles.
 * Once your project's user roles are finalized (e.g., organizer, participant, reviewer, etc.):
 * 1. Add the role identifier strings to the ROLES object below.
 * 2. The UserRole type will automatically infer the valid role strings across TypeScript.
 */

export const ROLES = {
  // Example placeholder roles can be declared here once problem statement is known:
  // USER: 'USER',
  // ADMIN: 'ADMIN',
} as const;

export type PredefinedRole = typeof ROLES[keyof typeof ROLES];

/**
 * Open union type allowing any custom string role during prototyping,
 * with autocomplete for any defined PredefinedRole values.
 */
export type UserRole = PredefinedRole | (string & {});
