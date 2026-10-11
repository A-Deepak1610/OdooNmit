import React, { useState, useEffect } from 'react';
import { adminService, ElectionItem, ClubItem } from '../../services/admin.service';
import { AdminElectionsView } from './dashboard/AdminElectionsView';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminElectionsPage: React.FC = () => {
  const [elections, setElections] = useState<ElectionItem[]>([]);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [electionsData, clubsData] = await Promise.all([
        adminService.getElections(),
        adminService.getClubs(),
      ]);
      setElections(electionsData);
      setClubs(clubsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync elections from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Annual Elections</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage elections, review nominations, monitor voting, and finalize leadership results.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Production-grade Elections View */}
      <AdminElectionsView
        elections={elections}
        clubs={clubs}
        isLoading={isLoading}
        actionLoading={actionLoading}
        onRefresh={fetchData}
        onElectionsUpdated={(updated) => setElections(updated)}
        onClubsUpdated={(updated) => setClubs(updated)}
        showToast={showToast}
      />
    </div>
  );
};

export default AdminElectionsPage;
