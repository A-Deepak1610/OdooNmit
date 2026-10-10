import React from 'react';
import { RoleDashboardPage } from '../../dashboards/RoleDashboardPage';
import { ROLES } from '../../../config/roles';

export const TreasurerDashboardPage: React.FC = () => {
  return <RoleDashboardPage role={ROLES.TREASURER} />;
};

export default TreasurerDashboardPage;
