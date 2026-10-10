import React from 'react';
import { RoleDashboardPage } from '../../dashboards/RoleDashboardPage';
import { ROLES } from '../../../config/roles';

export const OrganizerDashboardPage: React.FC = () => {
  return <RoleDashboardPage role={ROLES.EVENT_ORGANIZER} />;
};

export default OrganizerDashboardPage;
