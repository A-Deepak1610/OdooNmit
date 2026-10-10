import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import { ROLE_DEFAULT_PATHS, ROLE_DISPLAY_NAMES, UserRole } from '../config/roles';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, roles, switchRole } = useAuthStore();

  const handleGoToAllowed = () => {
    if (role && ROLE_DEFAULT_PATHS[role]) {
      navigate(ROLE_DEFAULT_PATHS[role]);
    } else {
      navigate('/');
    }
  };

  const handleRoleSwitch = (targetRole: UserRole) => {
    switchRole(targetRole);
    if (ROLE_DEFAULT_PATHS[targetRole]) {
      navigate(ROLE_DEFAULT_PATHS[targetRole]);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Your current active workspace (<strong>{role ? (ROLE_DISPLAY_NAMES[role] || role) : 'None'}</strong>)
          does not have permission to view this section.
        </p>

        {/* If user possesses multiple roles, offer direct workspace switch! */}
        {roles.length > 1 && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Switch to permitted role workspace:
            </span>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                    r === role
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {ROLE_DISPLAY_NAMES[r] || r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleGoToAllowed}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go to My Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
