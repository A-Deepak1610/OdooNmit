import { NavigationItem } from '../types';

/**
 * Centralized Navigation Registry
 *
 * NOTE FOR HACKATHON PARTICIPANTS:
 * Initially, no business-specific pages or modules are registered here.
 * As your team creates feature pages in `modules/<feature-name>/pages/`:
 * 1. Register your route item in this array with appropriate `allowedRoles` and optional `group`.
 * 2. The single shared AppSidebar will automatically render and filter the items
 *    based on the logged-in user's role from the Zustand auth store.
 * 3. If this list is empty or the user lacks permissions, AppSidebar displays a clean empty state.
 */
export const navigationConfig: NavigationItem[] = [
  // Business navigation items will be added here after the problem statement is decided.
  // Example format:
  // {
  //   id: 'example-feature',
  //   label: 'Feature Name',
  //   path: '/feature',
  //   icon: SomeLucideIcon,
  //   allowedRoles: ['ROLE_NAME'],
  //   group: 'Core Features',
  // },
];

/**
 * Filters the centralized navigation items based on the given user role.
 * If userRole is null or undefined, only items with no role restriction are accessible.
 */
export function getPermittedNavigationItems(userRole?: string | null): NavigationItem[] {
  if (!userRole) {
    return navigationConfig.filter(
      (item) => !item.allowedRoles || item.allowedRoles.length === 0
    );
  }

  return navigationConfig.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    return item.allowedRoles.includes(userRole);
  });
}
