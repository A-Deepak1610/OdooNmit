import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { mockAnnouncements } from '../../../data/mockClubData';

export const AnnouncementBoardModule: React.FC = () => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [showCreate, setShowCreate] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'MEETING' as const,
    author: 'Skyline Secretariat',
    priority: 'NORMAL' as const,
    content: '',
  });
  const [postNotice, setPostNotice] = useState<string | null>(null);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    const notice = {
      id: `ann-${Date.now()}`,
      title: newNotice.title,
      category: newNotice.category,
      author: newNotice.author,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: newNotice.priority,
      content: newNotice.content,
    };

    setAnnouncements([notice, ...announcements]);
    setShowCreate(false);
    setPostNotice(`Broadcast published! Notification delivered to all student member dashboards.`);
    setNewNotice({
      title: '',
      category: 'MEETING',
      author: 'Skyline Secretariat',
      priority: 'NORMAL',
      content: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-[#fff4ed] px-2.5 py-0.5 rounded-full border border-orange-200">
              Dev 4 Workstream
            </span>
            <span className="text-xs text-slate-400 font-medium">Problem Statement Scene:</span>
            <span className="text-xs font-semibold text-slate-700">"Announcing the next meeting & notices"</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Centralized Campus Announcement Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Post once to reach all members with timestamped logs, replacing fragmented and lost WhatsApp group messages.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Megaphone className="h-4 w-4" />
          <span>Broadcast Notice</span>
        </button>
      </div>

      {postNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{postNotice}</span>
          </div>
          <button
            onClick={() => setPostNotice(null)}
            className="font-bold underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Broadcast Composer */}
      {showCreate && (
        <form
          onSubmit={handlePostNotice}
          className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Official Broadcast</h3>
              <p className="text-slate-500">
                Notice will be displayed across student dashboards and sent to verified member emails.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Venue Change for Spring Gala"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Notice Category</label>
              <select
                value={newNotice.category}
                onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="EVENT">Event Update</option>
                <option value="MEETING">General Body Meeting</option>
                <option value="DEADLINE">Dues / Form Deadline</option>
                <option value="GENERAL">General Notice</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={newNotice.priority}
                onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="NORMAL">Standard Notice</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Red Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Notice Content</label>
            <textarea
              rows={3}
              required
              placeholder="Type your message details here..."
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const isUrgent = ann.priority === 'URGENT';
          const isHigh = ann.priority === 'HIGH';

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all ${
                isUrgent
                  ? 'bg-rose-50/50 border-rose-200'
                  : isHigh
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Posted by {ann.author}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{ann.content}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  <span>Audience: Skyline Association & Campus Students</span>
                </div>
                <span className="font-semibold text-orange-600 hover:text-orange-800 cursor-pointer">
                  View Full Thread →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
