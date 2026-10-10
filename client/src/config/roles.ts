/**
 * CampusMitra Unified Role System
 * Supported role types for students, club members, officers, and administrators.
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  MEMBER: 'MEMBER',
  VOLUNTEER: 'VOLUNTEER',
  EVENT_ORGANIZER: 'EVENT_ORGANIZER',
  TREASURER: 'TREASURER',
  PRESIDENT: 'PRESIDENT',
  ADMIN: 'ADMIN',
} as const;

export type PredefinedRole = (typeof ROLES)[keyof typeof ROLES];

export type UserRole = PredefinedRole | (string & {});

/**
 * Priority ranking for multi-role landing pages.
 * If a user possesses multiple roles, they default to the highest privilege workspace.
 */
export const ROLE_HIERARCHY: UserRole[] = [
  ROLES.ADMIN,
  ROLES.PRESIDENT,
  ROLES.TREASURER,
  ROLES.EVENT_ORGANIZER,
  ROLES.VOLUNTEER,
  ROLES.MEMBER,
  ROLES.STUDENT,
];

/**
 * Returns the highest priority role from a list of user roles.
 */
export function getDefaultRole(roles: string[]): UserRole {
  if (!roles || roles.length === 0) return ROLES.STUDENT;

  for (const prioritizedRole of ROLE_HIERARCHY) {
    if (roles.includes(prioritizedRole)) {
      return prioritizedRole;
    }
  }

  return (roles[0] as UserRole) || ROLES.STUDENT;
}

/**
 * User-friendly display names for roles.
 */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  STUDENT: 'Student',
  MEMBER: 'Club Member',
  VOLUNTEER: 'Volunteer',
  EVENT_ORGANIZER: 'Event Organizer',
  TREASURER: 'Treasurer',
  PRESIDENT: 'Club President',
  ADMIN: 'Administrator',
};

/**
 * Default route landing path per role.
 */
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  STUDENT: '/student/dashboard',
  MEMBER: '/member/dashboard',
  VOLUNTEER: '/volunteer/dashboard',
  EVENT_ORGANIZER: '/organizer/dashboard',
  TREASURER: '/treasurer/dashboard',
  PRESIDENT: '/president/dashboard',
  ADMIN: '/admin/dashboard',
};
