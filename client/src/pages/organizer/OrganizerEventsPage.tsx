import React from 'react';
import { PresidentEventsFundraisersPage } from '../president/PresidentEventsFundraisersPage';

interface OrganizerEventsPageProps {
  initialTab?: 'analytics' | 'ticketing' | 'organizer' | 'attendees';
}

/**
 * Event Organizer Operations, Ticket Quotas & Attendee Analytics Page
 * Provides Event Organizers with the full management & visual analysis suite:
 * - Demographics and turnout graphs (departments, year of study, member vs student, hourly check-ins)
 * - Differential ticket quotas and member pricing discount engine with live seat adjustments
 * - Real-time attendee roster & authentic QR pass scanner simulation with duplicate entry protection
 * - Debounced server-side event search powered by backend /api/v1/events JSON catalog
 */
export const OrganizerEventsPage: React.FC<OrganizerEventsPageProps> = ({
  initialTab = 'ticketing',
}) => {
  return (
    <PresidentEventsFundraisersPage
      roleVariant="EVENT_ORGANIZER"
      defaultTab={initialTab}
    />
  );
};

export default OrganizerEventsPage;
