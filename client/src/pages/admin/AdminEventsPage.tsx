import React from 'react';
import { EventsTicketingModule } from '../../components/modules/events/EventsTicketingModule';

export const AdminEventsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <EventsTicketingModule />
    </div>
  );
};
