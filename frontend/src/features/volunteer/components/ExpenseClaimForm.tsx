import React, { useState } from 'react';
import { ExpenseCategory, VolunteerExpenseClaim } from '../types/volunteer.types';
import { Receipt, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ExpenseClaimFormProps {
  submitting: boolean;
  onSubmit: (data: Omit<VolunteerExpenseClaim, 'id' | 'status'>) => Promise<unknown>;
  onCancel?: () => void;
}

export const ExpenseClaimForm: React.FC<ExpenseClaimFormProps> = ({
  submitting,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('SUPPLIES');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [projectName, setProjectName] = useState('Spring Charity Bake Sale & Fundraiser');
  const [receiptNote, setReceiptNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    if (!title.trim()) {
      setValidationError('Please provide a descriptive title for this expense.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid expense amount greater than ₹0.');
      return;
    }

    if (!receiptNote.trim()) {
      setValidationError('Please include a receipt reference, tax invoice number, or store details.');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        amount: Math.round(numAmount * 100) / 100,
        category,
        date,
        projectName,
        receiptNote: receiptNote.trim(),
      });

      // Reset form fields
      setTitle('');
      setAmount('');
      setReceiptNote('');
    } catch {
      // Handled by parent hook
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Receipt className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Submit New Reimbursement Claim
          </h3>
          <p className="text-xs text-slate-500">
            Claims are verified by the Skyline Club Treasurer against uploaded bills before payout.
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Expense Title / Item Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Bake sale butter, baking trays & food packaging"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Amount (₹ INR) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="e.g. 1450"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Expense Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="SUPPLIES">Supplies & Consumables</option>
            <option value="FOOD">Food & Baking Ingredients</option>
            <option value="VENUE">Venue & Utilities</option>
            <option value="DECORATION">Decoration & Signage</option>
            <option value="PRINTING">Printing & Stationery</option>
            <option value="EQUIPMENT">Equipment & Cables</option>
            <option value="OTHER">Other Reimbursable</option>
          </select>
        </div>

        {/* Project association */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Related Project or Event
          </label>
          <select
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Spring Charity Bake Sale & Fundraiser">Spring Charity Bake Sale & Fundraiser</option>
            <option value="Skyline Annual Spring Gala 2026">Skyline Annual Spring Gala 2026</option>
            <option value="Inter-College Hackathon Logistics">Inter-College Hackathon Logistics</option>
            <option value="General Club Operations">General Club Operations</option>
          </select>
        </div>

        {/* Date of Purchase */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Date of Purchase *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Receipt / Invoice Details */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Receipt / Bill Reference *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Supermarket Bill #9482 / Store Cash Memo #301"
            value={receiptNote}
            onChange={(e) => setReceiptNote(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Keep physical or digital receipts safe for handover during audit verification.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting Claim...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Reimbursement Claim</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
