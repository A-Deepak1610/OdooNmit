import React from 'react';
import { RoleDashboardPage } from '../../dashboards/RoleDashboardPage';
import { ROLES } from '../../../config/roles';

export const MemberDashboardPage: React.FC = () => {
  return <RoleDashboardPage role={ROLES.MEMBER} />;
};

export default MemberDashboardPage;
