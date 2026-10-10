import React from 'react';
import { RoleDashboardPage } from '../../dashboards/RoleDashboardPage';
import { ROLES } from '../../../config/roles';

export const PresidentDashboardPage: React.FC = () => {
  return <RoleDashboardPage role={ROLES.PRESIDENT} />;
};

export default PresidentDashboardPage;
