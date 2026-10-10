import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Ticket,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  CreditCard,
  QrCode,
  Tag,
  KeyRound,
  Check,
  Building2,
  Trophy,
  Loader2,
  ArrowRight,
  Filter,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { eventService, CampusEventItem } from '../../../services/event.service';
import { RealQrCode } from '../../shared/RealQrCode';

export const EventsTicketingModule: React.FC = () => {
  const { user } = useAuthStore();
  const isMember = user?.roles?.includes('MEMBER') || user?.roles?.includes('PRESIDENT') || user?.roles?.includes('EVENT_ORGANIZER');

  const [activeTab, setActiveTab] = useState<'events' | 'my-tickets'>('events');
  const [events, setEvents] = useState<CampusEventItem[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [viewingEvent, setViewingEvent] = useState<CampusEventItem | null>(null);
  const [bookingEvent, setBookingEvent] = useState<CampusEventItem | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'campus_pay' | 'upi_mock' | 'student_id'>('campus_pay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Load events
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load user tickets
  const loadMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const tickets = await eventService.getMyTickets();
      setMyTickets(tickets);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadMyTickets();
  }, []);

  const handleOpenBooking = (event: CampusEventItem) => {
    setBookingEvent(event);
    setTicketQuantity(1);
    setViewingEvent(null);
  };

  const handleConfirmMockBooking = async () => {
    if (!bookingEvent) return;
    setIsProcessingPayment(true);
    try {
      const res = await eventService.bookTicket(bookingEvent.id, {
        quantity: ticketQuantity,
        paymentMethod,
      });
      setConfirmedBooking(res.data);
      setBookingEvent(null);
      // Refresh tickets and events
      loadMyTickets();
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to complete ticket booking.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.organization?.name && ev.organization.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' || ev.category.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'HACKATHON', 'TECHNICAL', 'CULTURAL', 'WORKSHOP', 'SEMINAR'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Campus Ticketing & Passes
            </span>
            {isMember && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Member Rate Active
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Events & Digital Admission Passes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover campus events, secure bulk passes at member discounts, and present instant QR codes or OTPs at the door.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Browse Events ({events.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('my-tickets');
              loadMyTickets();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'my-tickets'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            My Booked Passes ({myTickets.length})
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Search & Category Pills */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, venues, clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loadingEvents ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">Loading campus events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No events found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const memPrice = Number(event.memberPriceINR) || 0;
                const regPrice = Number(event.nonMemberPriceINR) || 0;
                const isFree = memPrice === 0 && regPrice === 0;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-indigo-200 transition-all group"
                  >
                    {/* Event Banner */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={
                          event.bannerUrl ||
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                          {event.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600/90 backdrop-blur-md text-white shadow-sm uppercase">
                          {event.mode}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-xs font-medium opacity-90">
                          {new Date(event.startAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {event.organization && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 mb-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{event.organization.name}</span>
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Details row */}
                      <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.remainingSeats} / {event.totalSeats} seats left</span>
                          </div>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.round(((event.totalSeats - event.remainingSeats) / Math.max(1, event.totalSeats)) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ticket Price Range Box */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-3 h-3 text-indigo-500" />
                            Ticket Price Range
                          </div>
                          <div className="mt-0.5">
                            {isFree ? (
                              <span className="text-base font-extrabold text-emerald-600">Free Admission</span>
                            ) : (
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-extrabold text-slate-900">
                                  ₹{memPrice} - ₹{regPrice}
                                </span>
                                {isMember && (
                                  <span className="text-xs font-semibold text-emerald-600">
                                    (₹{memPrice} for you)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-500">
                          <div>Member: <span className="font-semibold text-slate-800">₹{memPrice}</span></div>
                          <div>Regular: <span className="font-semibold text-slate-800">₹{regPrice}</span></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setViewingEvent(event)}
                          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleOpenBooking(event)}
                          disabled={event.remainingSeats <= 0}
                          className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          {event.remainingSeats <= 0 ? 'Sold Out' : 'Book Pass'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BOOKED PASSES & QR CODES */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-6">
          {loadingTickets ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">Loading your booked event passes...</p>
            </div>
          ) : myTickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No event passes booked yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Explore exciting campus hackathons, technical symposia, and cultural events to claim your entry pass.
              </p>
              <button
                onClick={() => setActiveTab('events')}
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 inline-flex items-center gap-2"
              >
                Browse Campus Events <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Active Event Gate Passes</h2>
                  <p className="text-xs text-slate-500">
                    Present your digital QR code or recite the 6-digit OTP to the volunteer at the door for entry.
                  </p>
                </div>
                <button
                  onClick={loadMyTickets}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all"
                >
                  Refresh Passes
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myTickets.map((t) => {
                  const isCheckedIn = Boolean(t.checkedInAt);

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-indigo-300 transition-all"
                    >
                      {/* Left: Pass Meta */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-dashed border-slate-200">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              PASS #{t.bookingNumber}
                            </span>
                            {isCheckedIn ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Checked In
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Ready For Entry
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {t.event?.title || 'Campus Event'}
                          </h3>
                          {t.event?.organization && (
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              Organized by {t.event.organization.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time
                            </span>
                            <span className="font-semibold text-slate-800">
                              {t.event?.startAt
                                ? new Date(t.event.startAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'TBA'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                              {t.event?.venue || 'Campus Auditorium'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" /> Quantity
                            </span>
                            <span className="font-semibold text-slate-800">
                              {t.quantity} Attendee{t.quantity > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Total Paid
                            </span>
                            <span className="font-bold text-emerald-700">
                              ₹{Math.round(t.totalAmount / 100)} (Mock Captured)
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Issued: {new Date(t.createdAt).toLocaleDateString()}</span>
                          <span className="text-indigo-600 font-medium">Digital Pass Verified</span>
                        </div>
                      </div>

                      {/* Right: QR Code & 6-Digit Door OTP */}
                      <div className="p-6 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3 min-w-[240px]">
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                          <RealQrCode
                            value={t.qrPayload || `CAMPUSMITRA:${t.bookingNumber}:${t.otpCode || '123456'}`}
                            size={140}
                            showPayloadPreview={false}
                          />
                        </div>

                        {/* Door OTP Box */}
                        <div className="w-full bg-indigo-900 text-white rounded-xl p-2.5 shadow-sm">
                          <div className="text-[10px] font-semibold tracking-wider uppercase text-indigo-200 flex items-center justify-center gap-1">
                            <KeyRound className="w-3 h-3 text-indigo-300" /> Door Check-in OTP
                          </div>
                          <div className="text-xl font-black tracking-widest font-mono text-amber-300 mt-0.5">
                            {t.otpCode ? `${t.otpCode.slice(0, 3)} ${t.otpCode.slice(3)}` : '482 910'}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 max-w-[190px] leading-tight">
                          Show QR code or quote OTP to the door scanner volunteer.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-48 bg-slate-100 flex-shrink-0">
              <img
                src={
                  viewingEvent.bannerUrl ||
                  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
                }
                alt={viewingEvent.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingEvent(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {viewingEvent.category} • {viewingEvent.domain}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{viewingEvent.title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{viewingEvent.description}</p>
              </div>

              {viewingEvent.prizes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Prizes & Awards</h4>
                    <p className="text-xs text-amber-800 mt-0.5">{viewingEvent.prizes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 font-medium">Date & Schedule</div>
                  <div className="font-bold text-slate-900 mt-1">
                    {new Date(viewingEvent.startAt).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 font-medium">Venue & Hall</div>
                  <div className="font-bold text-slate-900 mt-1">{viewingEvent.venue}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Available Ticket Price</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Member: ₹{viewingEvent.memberPriceINR} • Regular: ₹{viewingEvent.nonMemberPriceINR}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenBooking(viewingEvent)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  Book Pass Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOK PASS & BULK MOCK PAYMENT MODAL */}
      {bookingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Fast Checkout</span>
                <h3 className="text-lg font-bold text-slate-900">Book Event Entry Pass</h3>
              </div>
              <button
                onClick={() => setBookingEvent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Event Summary Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{bookingEvent.title}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(bookingEvent.startAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {bookingEvent.venue}
                </span>
              </div>
            </div>

            {/* Role & Discount Banner */}
            {isMember ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Member Privilege Applied:</strong> You get the exclusive member price of{' '}
                  <strong>₹{bookingEvent.memberPriceINR}</strong> per ticket (Regular is ₹{bookingEvent.nonMemberPriceINR}).
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-600">
                <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  Standard Student Rate: <strong>₹{bookingEvent.nonMemberPriceINR}</strong> per pass. Join the club to unlock member discounts!
                </span>
              </div>
            )}

            {/* Bulk / Quantity Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Ticket Quantity (Bulk Option)
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 5].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setTicketQuantity(qty)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      ticketQuantity === qty
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {qty} {qty === 1 ? 'Pass' : 'Passes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Payment Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Mode (Simulated Mock Gateway)
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'campus_pay',
                    title: 'Campus Mitra 1-Click Pay (Mock)',
                    desc: 'Instant zero-credential sandbox checkout',
                    icon: Sparkles,
                  },
                  {
                    id: 'upi_mock',
                    title: 'UPI / QR Mock Pay',
                    desc: 'Simulated GooglePay / PhonePe / Paytm scan',
                    icon: QrCode,
                  },
                  {
                    id: 'student_id',
                    title: 'Student ID Smart Wallet',
                    desc: 'Deduct from campus meal/event balance',
                    icon: CreditCard,
                  },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <label
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === pm.id}
                        onChange={() => {}}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <Icon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-slate-900">{pm.title}</div>
                        <div className="text-[11px] text-slate-500">{pm.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Cost Breakdown */}
            {(() => {
              const unitPrice = isMember
                ? Number(bookingEvent.memberPriceINR)
                : Number(bookingEvent.nonMemberPriceINR);
              const totalAmount = unitPrice * ticketQuantity;

              return (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Pass Price ({ticketQuantity} × ₹{unitPrice})
                    </span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Convenience / Platform Fee</span>
                    <span className="text-emerald-600 font-semibold">FREE (Campus Sponsored)</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Amount Payable</span>
                    <span className="text-indigo-600 text-base">₹{totalAmount}</span>
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBookingEvent(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMockBooking}
                disabled={isProcessingPayment}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-indigo-400"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Mock Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Pay & Issue Ticket Pass
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS PASS CONFIRMATION POPUP */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Payment Mock Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Ticket Pass Issued Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking #{confirmedBooking.bookingNumber} is registered. Present the QR code or door OTP below at entry.
              </p>
            </div>

            {/* QR Code and OTP Highlight */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <RealQrCode
                  value={confirmedBooking.qrPayload || `CAMPUSMITRA:${confirmedBooking.bookingNumber}:${confirmedBooking.otpCode}`}
                  size={140}
                  showPayloadPreview={false}
                />
              </div>

              <div className="w-full bg-indigo-900 text-white rounded-xl p-2.5 shadow-sm">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-indigo-200">
                  Door Check-in OTP
                </div>
                <div className="text-2xl font-black tracking-widest font-mono text-amber-300 mt-0.5">
                  {confirmedBooking.otpCode
                    ? `${confirmedBooking.otpCode.slice(0, 3)} ${confirmedBooking.otpCode.slice(3)}`
                    : '482 910'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setActiveTab('my-tickets');
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                View in My Passes
              </button>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
