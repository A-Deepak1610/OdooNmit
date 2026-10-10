import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import { authService } from "../../auth/services/auth.service";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  ChevronDown,
  ArrowRight,
  Shield,
  UserCheck,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  Building,
  GraduationCap,
  HeartHandshake,
  QrCode,
  Receipt,
  Ticket,
  Package,
  Layers,
  Award,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { Colors } from "../../../assets/Colors";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, setUser } = useAuthStore();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleInstantRoleLaunch = async (email: string, roleName: string) => {
    setLoadingRole(roleName);
    try {
      const data = await authService.login({ email, password: "Password123!" });
      setUser(data.user, data.token);
      navigate("/dashboard");
    } catch {
      navigate(`/login?role=${roleName}`);
    } finally {
      setLoadingRole(null);
    }
  };

  // High quality images related to CampusMitra student org project
  const column1Images = [
    {
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&q=80",
      title: "Hackathon & Tech Club",
      desc: "Coding competitions & collaborative build sessions",
    },
    {
      url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80",
      title: "Cultural Festival Dance",
      desc: "Annual performing arts & music concerts",
    },
    {
      url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=500&q=80",
      title: "Robotics Society Team",
      desc: "Hardware prototyping & maker exhibitions",
    },
    {
      url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=500&q=80",
      title: "Volunteer Charity Drive",
      desc: "Community support & fundraiser logistics",
    },
  ];

  const column2Images = [
    {
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=500&q=80",
      title: "Student Leadership Council",
      desc: "Club officers planning semester agenda",
    },
    {
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
      title: "Medical & Science Society",
      desc: "Research symposiums & guest speaker seminars",
    },
    {
      url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=500&q=80",
      title: "Inter-College Sports Tournament",
      desc: "Varsity athletics & intramural club league",
    },
    {
      url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
      title: "College Fest Music Night",
      desc: "Live stage, lighting & ticketed attendance",
    },
  ];

  const column3Images = [
    {
      url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=500&q=80",
      title: "University Aquatics Club",
      desc: "Team victory celebration and medal distribution",
    },
    {
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80",
      title: "Academic Workshop Seminar",
      desc: "Faculty lecture & certification distribution",
    },
    {
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80",
      title: "Annual Student Gala",
      desc: "Club awards & formal celebration evening",
    },
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80",
      title: "Design & Media Society",
      desc: "Creative showcase & student project exhibition",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-surface-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* 1. FLOATING PILL NAVIGATION BAR (Matches UI Reference: Clean Capsule, Without Gradient) */}
      <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-8 lg:px-12 xl:px-14 pointer-events-none">
        <div
          ref={navRef}
          className="max-w-[1540px] mx-auto rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-purple-950/5 px-6 sm:px-9 h-[68px] sm:h-[72px] flex items-center justify-between pointer-events-auto transition-all"
        >
          {/* Left: Brand Logo with Official App Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="CampusMitra Logo"
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span
                className="text-lg sm:text-xl font-black tracking-tight leading-none"
                style={{ color: Colors.deepprimary }}
              >
                CampusMitra
              </span>
              <span
                className="text-[10px] font-bold tracking-wider mt-0.5"
                style={{ color: Colors.primary }}
              >
                Be the true you. Be found.
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links matching Reference Layout */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[15px] font-semibold text-slate-700">
            {/* 1. Users Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("users")}
                className="flex items-center gap-1.5 transition-colors py-2 hover:text-[#6C35DC]"
                style={{
                  color: activeDropdown === "users" ? Colors.primary : undefined,
                }}
              >
                <span>Users</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "users" ? "rotate-180" : ""
                  }`}
                  style={{
                    color: activeDropdown === "users" ? Colors.primary : Colors.textSecondary,
                  }}
                />
              </button>
              {activeDropdown === "users" && (
                <div className="absolute top-full left-0 mt-3 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Direct Persona Portals
                  </div>
                  <button
                    onClick={() =>
                      handleInstantRoleLaunch(
                        "member@CampusMitra.test",
                        "MEMBER",
                      )
                    }
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] flex items-center justify-between font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" style={{ color: Colors.primary }} /> Student /
                      Member
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-purple-200 text-[#6C35DC]">
                      MEMBER
                    </Badge>
                  </button>
                  <button
                    onClick={() =>
                      handleInstantRoleLaunch(
                        "volunteer@CampusMitra.test",
                        "VOLUNTEER",
                      )
                    }
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] flex items-center justify-between font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CheckSquare className="h-3.5 w-3.5 text-blue-600" />{" "}
                      Volunteer Operations
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      VOLUNTEER
                    </Badge>
                  </button>
                  <button
                    onClick={() =>
                      handleInstantRoleLaunch(
                        "organizer@CampusMitra.test",
                        "EVENT_ORGANIZER",
                      )
                    }
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] flex items-center justify-between font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" /> Event
                      Organizer
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      ORGANIZER
                    </Badge>
                  </button>
                  <button
                    onClick={() =>
                      handleInstantRoleLaunch(
                        "treasurer@CampusMitra.test",
                        "TREASURER",
                      )
                    }
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] flex items-center justify-between font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />{" "}
                      Treasurer & Ledger
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      TREASURER
                    </Badge>
                  </button>
                  <button
                    onClick={() =>
                      handleInstantRoleLaunch(
                        "president@CampusMitra.test",
                        "PRESIDENT",
                      )
                    }
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] flex items-center justify-between font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5" style={{ color: Colors.primary }} /> Club
                      President
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      PRESIDENT
                    </Badge>
                  </button>
                  <button
                    onClick={() =>
                      handleInstantRoleLaunch("admin@CampusMitra.test", "ADMIN")
                    }
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] flex items-center justify-between font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-rose-600" /> System
                      Super Admin
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      ADMIN
                    </Badge>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Organization Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("organization")}
                className="flex items-center gap-1.5 transition-colors py-2 hover:text-[#6C35DC]"
                style={{
                  color: activeDropdown === "organization" ? Colors.primary : undefined,
                }}
              >
                <span>Organization</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "organization" ? "rotate-180" : ""
                  }`}
                  style={{
                    color: activeDropdown === "organization" ? Colors.primary : Colors.textSecondary,
                  }}
                />
              </button>
              {activeDropdown === "organization" && (
                <div className="absolute top-full left-0 mt-3 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Club Governance
                  </div>
                  <Link
                    to="/memberships"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    Student Roster & Leadership Roles
                  </Link>
                  <Link
                    to="/tasks"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    Volunteer Duties & Deadlines
                  </Link>
                  <Link
                    to="/finance"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    Financial Balance & Semester Reports
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Our Solutions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("solutions")}
                className="flex items-center gap-1.5 transition-colors py-2 hover:text-[#6C35DC]"
                style={{
                  color: activeDropdown === "solutions" ? Colors.primary : undefined,
                }}
              >
                <span>Our Solutions</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "solutions" ? "rotate-180" : ""
                  }`}
                  style={{
                    color: activeDropdown === "solutions" ? Colors.primary : Colors.textSecondary,
                  }}
                />
              </button>
              {activeDropdown === "solutions" && (
                <div className="absolute top-full left-0 mt-3 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                  <Link
                    to="/events"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    <Calendar className="h-4 w-4 shrink-0" style={{ color: Colors.primary }} />
                    <div>
                      <div className="font-semibold text-slate-900">
                        Event & Ticketing Platform
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tier pricing & single-use QR passes
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/memberships"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        Membership & Dues Settlement
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Validity windows & door lookup
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/merchandise"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    <Package className="h-4 w-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        Merchandise & Store
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Apparel stock & member discounts
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/reimbursements"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    <Receipt className="h-4 w-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        Expense Reimbursements
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Receipt upload & officer payouts
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. About Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("about")}
                className="flex items-center gap-1.5 transition-colors py-2 hover:text-[#6C35DC]"
                style={{
                  color: activeDropdown === "about" ? Colors.primary : undefined,
                }}
              >
                <span>About</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "about" ? "rotate-180" : ""
                  }`}
                  style={{
                    color: activeDropdown === "about" ? Colors.primary : Colors.textSecondary,
                  }}
                />
              </button>
              {activeDropdown === "about" && (
                <div className="absolute top-full left-0 mt-3 w-60 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <a
                    href="#why-CampusMitra"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    Why CampusMitra?
                  </a>
                  <a
                    href="#whom-we-serve"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    Whom We Serve
                  </a>
                  <a
                    href="#network"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-purple-50 hover:text-[#6C35DC] font-medium"
                  >
                    Purposeful Social Network
                  </a>
                </div>
              )}
            </div>

            <Link
              to="/announcements"
              className="hover:text-[#6C35DC] transition-colors py-2"
            >
              Contact Us
            </Link>
          </nav>

          {/* Right: Pill Sign In Button matching Reference */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <Button
                variant="primary"
                onClick={() => navigate("/dashboard")}
                className="text-white px-5 sm:px-6 h-9 sm:h-10 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105"
                style={{ backgroundColor: Colors.primary }}
              >
                Go to Workspace ({role})
              </Button>
            ) : (
              <Link to="/login">
                <Button
                  variant="primary"
                  className="text-white px-5 sm:px-7 h-9 sm:h-10 rounded-full text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-105"
                  style={{ backgroundColor: Colors.primary }}
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors pointer-events-auto"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="lg:hidden max-w-[1540px] mx-auto mt-2 rounded-3xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-4 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-3">
              <div
                className="text-[11px] font-bold uppercase tracking-wider px-2"
                style={{ color: Colors.textSecondary }}
              >
                Quick Navigation
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/events"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" style={{ color: Colors.primary }} /> Events
                </Link>
                <Link
                  to="/memberships"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-emerald-600" /> Memberships
                </Link>
                <Link
                  to="/merchandise"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Package className="h-3.5 w-3.5 text-amber-600" /> Merchandise
                </Link>
                <a
                  href="#why-CampusMitra"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Award className="h-3.5 w-3.5" style={{ color: Colors.primary }} /> About Platform
                </a>
              </div>

              <div
                className="text-[11px] font-bold uppercase tracking-wider px-2 pt-2 border-t border-slate-100"
                style={{ color: Colors.textSecondary }}
              >
                Direct Persona Login
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleInstantRoleLaunch("member@CampusMitra.test", "MEMBER");
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-50 text-[#6C35DC] text-xs font-bold text-left hover:bg-purple-100 transition-colors"
                >
                  Member Portal →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleInstantRoleLaunch("president@CampusMitra.test", "PRESIDENT");
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-50 text-[#6C35DC] text-xs font-bold text-left hover:bg-purple-100 transition-colors"
                >
                  President Portal →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleInstantRoleLaunch("admin@CampusMitra.test", "ADMIN");
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-50 text-[#6C35DC] text-xs font-bold text-left hover:bg-purple-100 transition-colors"
                >
                  Admin Portal →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleInstantRoleLaunch("volunteer@CampusMitra.test", "VOLUNTEER");
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-50 text-[#6C35DC] text-xs font-bold text-left hover:bg-purple-100 transition-colors"
                >
                  Volunteer Portal →
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION WITH VERTICAL CONTINUOUS AUTO-SCROLLING IMAGES (Matches sample image 1) */}
      <section
        className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-surface-200"
        style={{ backgroundColor: Colors.background }}
      >
        <div className="max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-7">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] font-black tracking-tight leading-[1.12]" style={{ color: Colors.text }}>
                Build Your Community <br />
                <span style={{ color: Colors.primary }}>All in One Place</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: Colors.textSecondary }}>
                CampusMitra connects events, clubs, memberships, fees,
                fundraising, volunteering, and extracurricular activities—then
                turns participation into verifiable digital credentials and
                portfolios that prove social impact for scholarships, grants,
                and fundraising.
              </p>

              {/* Two CTA Buttons matching Reference styling with Colors palette */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  onClick={() =>
                    handleInstantRoleLaunch(
                      "president@CampusMitra.test",
                      "PRESIDENT",
                    )
                  }
                  isLoading={loadingRole === "PRESIDENT"}
                  className="text-white px-7 h-12 rounded-full text-sm font-bold shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: Colors.primary }}
                >
                  Start as an Organizer
                </Button>

                <Button
                  onClick={() =>
                    handleInstantRoleLaunch("member@CampusMitra.test", "MEMBER")
                  }
                  isLoading={loadingRole === "MEMBER"}
                  className="px-7 h-12 rounded-full text-sm font-bold shadow-xs transition-all hover:scale-[1.02] border-2"
                  style={{
                    backgroundColor: Colors.surface,
                    color: Colors.deepprimary,
                    borderColor: `${Colors.primary}30`,
                  }}
                >
                  Join as a User
                </Button>
              </div>

              {/* Live Persona Quick Links */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-surface-500">
                <span className="font-semibold text-surface-700">
                  Explore Role Workspaces:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleInstantRoleLaunch("admin@CampusMitra.test", "ADMIN")
                  }
                  className="underline hover:text-brand-600 font-medium"
                >
                  Super Admin
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() =>
                    handleInstantRoleLaunch(
                      "treasurer@CampusMitra.test",
                      "TREASURER",
                    )
                  }
                  className="underline hover:text-brand-600 font-medium"
                >
                  Treasurer
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() =>
                    handleInstantRoleLaunch(
                      "organizer@CampusMitra.test",
                      "EVENT_ORGANIZER",
                    )
                  }
                  className="underline hover:text-brand-600 font-medium"
                >
                  Event Organizer
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() =>
                    handleInstantRoleLaunch(
                      "volunteer@CampusMitra.test",
                      "VOLUNTEER",
                    )
                  }
                  className="underline hover:text-brand-600 font-medium"
                >
                  Volunteer
                </button>
              </div>
            </div>

            {/* Right Column: 3-COLUMN CONTINUOUS VERTICALLY SCROLLING MARQUEE GALLERY */}
            <div className="lg:col-span-7 xl:col-span-7 relative marquee-wrapper h-[560px] sm:h-[620px] xl:h-[650px] overflow-hidden rounded-3xl p-1">
              {/* Subtle top & bottom gradient fade overlays for smooth scrolling transition */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-16 z-20"
                style={{
                  background: `linear-gradient(to bottom, ${Colors.background}, transparent)`,
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-20"
                style={{
                  background: `linear-gradient(to top, ${Colors.background}, transparent)`,
                }}
              />

              <div className="grid grid-cols-3 gap-4 xl:gap-5 h-full">
                {/* Column 1: Scrolling UP */}
                <div className="space-y-4 animate-marquee-up">
                  {[...column1Images, ...column1Images].map((img, idx) => (
                    <div
                      key={`col1-${idx}`}
                      className="rounded-2xl overflow-hidden bg-white shadow-sm border border-surface-200/60 group relative shrink-0"
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-44 sm:h-48 xl:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="p-2.5 bg-white text-left">
                        <div className="text-[11px] font-bold text-surface-900 truncate">
                          {img.title}
                        </div>
                        <div className="text-[9px] text-surface-500 truncate">
                          {img.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Scrolling DOWN */}
                <div className="space-y-4 animate-marquee-down">
                  {[...column2Images, ...column2Images].map((img, idx) => (
                    <div
                      key={`col2-${idx}`}
                      className="rounded-2xl overflow-hidden bg-white shadow-sm border border-surface-200/60 group relative shrink-0"
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-44 sm:h-48 xl:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="p-2.5 bg-white text-left">
                        <div className="text-[11px] font-bold text-surface-900 truncate">
                          {img.title}
                        </div>
                        <div className="text-[9px] text-surface-500 truncate">
                          {img.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3: Scrolling UP (Slow) */}
                <div className="space-y-4 animate-marquee-up-slow">
                  {[...column3Images, ...column3Images].map((img, idx) => (
                    <div
                      key={`col3-${idx}`}
                      className="rounded-2xl overflow-hidden bg-white shadow-sm border border-surface-200/60 group relative shrink-0"
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-44 sm:h-48 xl:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="p-2.5 bg-white text-left">
                        <div className="text-[11px] font-bold text-surface-900 truncate">
                          {img.title}
                        </div>
                        <div className="text-[9px] text-surface-500 truncate">
                          {img.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "WHY CampusMitra?" SECTION (Matches sample images 2 & 3) */}
      <section
        id="why-CampusMitra"
        className="py-20 lg:py-28 bg-white border-b border-surface-200"
      >
        <div className="max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-14">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 tracking-tight">
              Why <span style={{ color: Colors.primary }}>CampusMitra</span>?
            </h2>
            <p className="text-lg sm:text-xl font-bold" style={{ color: Colors.deepprimary }}>
              One Platform. Multiple Solutions. Real Results.
            </p>
            <p className="text-sm sm:text-base text-surface-500">
              <span style={{ color: Colors.primary }} className="font-semibold">Cut costs</span>{" "}
              and operate efficiently. Build your{" "}
              <span style={{ color: Colors.primary }} className="font-semibold">
                authentic brand
              </span>{" "}
              and deepen engagement—
              <span style={{ color: Colors.primary }} className="font-semibold">
                all in one place
              </span>
              .
            </p>
          </div>

          {/* 6 Solutions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Event Management */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 p-4 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
                    alt="Event crowd"
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-white/60 shadow-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-surface-900">
                        QR Gate Ticket
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Anti-Duplicate Validated
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-surface-900 mt-5">
                  Event Management
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2.5 leading-relaxed">
                  Plan events, tickets, classes, RSVPs, and micro-donations
                  easily. Keep participants engaged with messaging, volunteers,
                  achievements, and smart door check-in.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Clubs & Classes */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 p-4 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
                    alt="Students collaborating"
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-white/60 shadow-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-surface-900">
                        Student Org Hub
                      </div>
                      <div className="text-[10px] text-surface-500">
                        6 Persona Access Controls
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-surface-900 mt-5">
                  Clubs & Classes
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2.5 leading-relaxed">
                  Connect student or member groups with simple attendance,
                  posts, and updates. Handle fees effortlessly and keep
                  communities engaged.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Memberships */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl bg-linear-to-br from-amber-100 to-rose-100 p-4 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
                    alt="Active membership"
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-white/60 shadow-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                      <Ticket className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-surface-900">
                        Exclusive Pass
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold">
                        Verified Member Discounts
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-surface-900 mt-5">
                  Memberships
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2.5 leading-relaxed">
                  Offer flexible membership plans with easy renewals and
                  insights. Give members exclusive access, digital badges, and
                  instant benefits.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100">
                <Link
                  to="/memberships"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 4: Treasury & Finance */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl bg-linear-to-br from-emerald-100 to-green-100 p-4 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
                    alt="Treasury and finance"
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-white/60 shadow-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-surface-900">
                        Audited Ledger
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        Anti-Self-Approval Review
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-surface-900 mt-5">
                  Treasury & Finance
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2.5 leading-relaxed">
                  Track dues, expenses, and cash accounts with double-entry
                  precision. Ensure accountability with strict separation of
                  duties and financial reports.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100">
                <Link
                  to="/finance"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 5: Volunteering & Tasks */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl bg-linear-to-br from-teal-100 to-cyan-100 p-4 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80"
                    alt="Volunteering in action"
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-white/60 shadow-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                      <CheckSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-surface-900">
                        Volunteer Duty Log
                      </div>
                      <div className="text-[10px] text-teal-700 font-semibold">
                        Supervisor Verified Hours
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-surface-900 mt-5">
                  Volunteering & Tasks
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2.5 leading-relaxed">
                  Launch community fundraisers, coordinate volunteer teams with
                  visual kanban boards, and certify verified community service
                  hours.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100">
                <Link
                  to="/fundraisers"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 6: Merchandise & Store */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl bg-linear-to-br from-rose-100 to-orange-100 p-4 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80"
                    alt="Club merchandise"
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-white/60 shadow-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-surface-900">
                        Official Club Store
                      </div>
                      <div className="text-[10px] text-rose-700 font-semibold">
                        Real-Time Inventory Sync
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-surface-900 mt-5">
                  Merchandise & Store
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2.5 leading-relaxed">
                  Sell branded club apparel, gear, and event swag. Manage
                  product variants, track inventory levels in real-time, and
                  process orders cleanly.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100">
                <Link
                  to="/merchandise"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "WHOM WE SERVE" SECTION (Matches sample image 4) */}
      <section
        id="whom-we-serve"
        className="py-20 lg:py-28 bg-[#FDF6E9] border-b border-amber-200/60"
      >
        <div className="max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            {/* Left: Heading & Description */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 tracking-tight">
                Whom We Serve
              </h2>
              <p className="text-base sm:text-lg text-surface-700 leading-relaxed font-normal max-w-xl">
                CampusMitra empowers organizations and individuals to connect,
                operate, and showcase their impact.
              </p>
            </div>

            {/* Right: Circular Quadrant Collage with Floating Badges (Matches sample image 4) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                <div className="w-full h-full rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5 bg-white shadow-xl border border-amber-200">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=300&q=80"
                    alt="Volunteers organizing event packages"
                    className="w-full h-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80"
                    alt="Team hands in collaboration"
                    className="w-full h-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80"
                    alt="University students on campus"
                    className="w-full h-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80"
                    alt="Students consulting at laptop"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-2 left-4 h-9 w-9 rounded-full bg-[#E59728] text-white flex items-center justify-center shadow-md">
                  <Users className="h-4 w-4" />
                </div>
                <div className="absolute top-8 -right-2 h-9 w-9 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-md">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="absolute -bottom-2 -left-2 h-9 w-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="absolute bottom-10 -right-3 h-9 w-9 rounded-full bg-[#E59728] text-white flex items-center justify-center shadow-md">
                  <Building className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Target Beneficiary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-surface-900">
                Organizations
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 mt-2 leading-relaxed">
                Schools, Academies, Corporates, and Nonprofits — manage events,
                memberships, donations, and communities in one place.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-surface-900">
                Students & Learners
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 mt-2 leading-relaxed">
                Showcase skills, achievements, and build your portfolio for
                college or career.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-surface-900">
                Community Members
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 mt-2 leading-relaxed">
                Engage with organizations, volunteer, and highlight your
                leadership impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "JOIN THE PURPOSEFUL SOCIAL NETWORK" SECTION (Elevated to match sample image 5) */}
      <section
        id="network"
        className="py-20 lg:py-28 bg-linear-to-b from-white via-[#FCF8F2]/50 to-[#FAF3E7]/40 border-b border-surface-200 relative overflow-hidden"
      >
        {/* Subtle decorative radial background blur */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-linear-to-tr from-amber-200/20 via-orange-100/30 to-yellow-100/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 text-center relative z-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto space-y-3 mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 tracking-tight leading-tight">
              Join the Purposeful{" "}
              <span className="text-[#E59728]">Social Network</span>
            </h2>
            <p className="text-base sm:text-xl font-medium text-surface-700">
              Not Likes. Real Achievements Define Your Net Worth.
            </p>
          </div>

          {/* Central Connected Network Architecture Hub */}
          <div className="relative w-full max-w-7xl mx-auto rounded-3xl bg-white/90 backdrop-blur-md border border-amber-200/60 p-4 sm:p-8 lg:p-12 shadow-xl shadow-amber-500/5">
            {/* The Visual Network Diagram Centerpiece */}
            <div className="relative mx-auto w-full max-w-6xl">
              <img
                src="/network-hub-illustration.png"
                alt="CampusMitra Purposeful Social Network Architecture"
                className="w-full h-auto object-contain mx-auto select-none drop-shadow-sm transition-transform duration-500 hover:scale-[1.01]"
                loading="eager"
              />
            </div>

            {/* 4 Pillar Badges Below The Central Diagram */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6 border-t border-amber-200/50">
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-surface-200/80 hover:border-amber-300 hover:shadow-xs transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                    Tamper-Proof
                  </span>
                </div>
                <h4 className="text-sm font-bold text-surface-900">
                  Verified Portfolios
                </h4>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">
                  Certificates and event attendance tied directly to real campus
                  records, not vanity metrics.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-surface-200/80 hover:border-brand-300 hover:shadow-xs transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wide">
                    Anti-Counterfeit
                  </span>
                </div>
                <h4 className="text-sm font-bold text-surface-900">
                  Cryptographic QR Passes
                </h4>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">
                  Single-use entry barcodes verified instantly at venue doors to
                  eliminate scalping and fraud.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-surface-200/80 hover:border-emerald-300 hover:shadow-xs transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                    Real Governance
                  </span>
                </div>
                <h4 className="text-sm font-bold text-surface-900">
                  Audited Track Records
                </h4>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">
                  Treasurers, volunteers, and club presidents demonstrate
                  real-world financial stewardship.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-surface-200/80 hover:border-teal-300 hover:shadow-xs transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">
                    High Signal
                  </span>
                </div>
                <h4 className="text-sm font-bold text-surface-900">
                  Zero Social Noise
                </h4>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">
                  Purposeful collaboration centered on skill growth, service
                  impact, and active campus life.
                </p>
              </div>
            </div>
          </div>

          {/* Impact Statement & Quick Navigation CTA */}
          <div className="mt-12 text-center space-y-6 max-w-3xl mx-auto">
            <p className="text-base sm:text-lg lg:text-xl font-medium text-surface-800 leading-relaxed">
              Discover skills, connect with aligned organizations, and showcase
              verified achievements on CampusMitra network.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to="/register"
                className="px-7 py-3 rounded-full text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: Colors.primary }}
              >
                <span>Join Campus Network</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/events"
                className="px-5 py-3 rounded-xl bg-white hover:bg-surface-50 text-surface-800 font-semibold text-sm border border-surface-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2"
              >
                <span>Explore Live Events</span>
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-sm border border-amber-200 transition-all flex items-center gap-2"
              >
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLEAN FOOTER (Directly following the network section, as requested) */}
      <footer className="bg-white border-t border-surface-200 py-12">
        <div className="max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="CampusMitra Logo"
              className="h-7 w-7 object-contain"
            />
            <span className="font-bold text-surface-900">CampusMitra</span>
            <span className="text-surface-300">|</span>
            <span>© 2026. Student Organization Management System.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/events" className="hover:text-[#6C35DC] transition-colors">
              Events
            </Link>
            <Link to="/memberships" className="hover:text-[#6C35DC] transition-colors">
              Memberships
            </Link>
            <Link to="/merchandise" className="hover:text-[#6C35DC] transition-colors">
              Merchandise
            </Link>
            <Link
              to="/login"
              className="font-bold transition-colors hover:text-[#713CE8]"
              style={{ color: Colors.primary }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
