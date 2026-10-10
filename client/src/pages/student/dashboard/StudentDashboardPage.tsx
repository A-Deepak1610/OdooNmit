import React from 'react';
import { RoleDashboardPage } from '../../dashboards/RoleDashboardPage';
import { ROLES } from '../../../config/roles';

export const StudentDashboardPage: React.FC = () => {
  return <RoleDashboardPage role={ROLES.STUDENT} />;
};

export default StudentDashboardPage;
