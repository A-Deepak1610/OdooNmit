import React, { useState } from 'react';
import { ExpenseCategory, VolunteerExpenseClaim } from '../types/volunteer.types';
import { Receipt, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

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
      setValidationError('Please provide a descriptive title for this expense item.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid expense amount in INR greater than ₹0.');
      return;
    }

    if (!receiptNote.trim()) {
      setValidationError('Please provide an invoice number, cash memo reference, or vendor store details.');
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
      style={{
        background: 'var(--card-bg, #ffffff)',
        borderRadius: '14px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
    >
      {/* Form Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color, #f1f5f9)',
        }}
        className="border-slate-100 dark:border-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-blue-950"
          >
            <Receipt style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
          </div>
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--foreground, #1e293b)',
                margin: '0 0 2px 0',
              }}
              className="text-slate-900 dark:text-slate-100"
            >
              Submit New Reimbursement Claim
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Submitted claims are verified by the Skyline Club Treasurer against tax bills before bank disbursement.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
            }}
            className="hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        )}
      </div>

      {validationError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          className="dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400"
        >
          <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Fields Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Title */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground, #334155)',
              marginBottom: '6px',
            }}
            className="text-slate-700 dark:text-slate-300"
          >
            Expense Description / Item Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Bake sale butter, baking trays & food packaging"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'var(--foreground, #1e293b)',
              outline: 'none',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Amount */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground, #334155)',
              marginBottom: '6px',
            }}
            className="text-slate-700 dark:text-slate-300"
          >
            Claim Amount (₹ INR) *
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#64748b',
              }}
            >
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
              style={{
                width: '100%',
                padding: '10px 14px 10px 30px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--foreground, #1e293b)',
                outline: 'none',
              }}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground, #334155)',
              marginBottom: '6px',
            }}
            className="text-slate-700 dark:text-slate-300"
          >
            Budget Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'var(--foreground, #1e293b)',
              outline: 'none',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
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

        {/* Project Association */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground, #334155)',
              marginBottom: '6px',
            }}
            className="text-slate-700 dark:text-slate-300"
          >
            Associated Club Project / Activity
          </label>
          <select
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'var(--foreground, #1e293b)',
              outline: 'none',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="Spring Charity Bake Sale & Fundraiser">Spring Charity Bake Sale & Fundraiser</option>
            <option value="Skyline Annual Spring Gala 2026">Skyline Annual Spring Gala 2026</option>
            <option value="Inter-College Hackathon Logistics">Inter-College Hackathon Logistics</option>
            <option value="General Club Operations">General Club Operations</option>
          </select>
        </div>

        {/* Date of Purchase */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground, #334155)',
              marginBottom: '6px',
            }}
            className="text-slate-700 dark:text-slate-300"
          >
            Purchase / Invoice Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'var(--foreground, #1e293b)',
              outline: 'none',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Receipt / Invoice Details */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground, #334155)',
              marginBottom: '6px',
            }}
            className="text-slate-700 dark:text-slate-300"
          >
            Receipt Reference / Store Cash Memo *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Supermarket Bill #9482 / Metro Cash & Carry Memo #301"
            value={receiptNote}
            onChange={(e) => setReceiptNote(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'var(--foreground, #1e293b)',
              outline: 'none',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Retain paper or digital copies for semester audit reconciliation with the Treasurer Office.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color, #f1f5f9)',
        }}
        className="border-slate-100 dark:border-slate-800"
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              color: 'var(--foreground, #64748b)',
              cursor: 'pointer',
            }}
            className="hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            background: '#1e3a8a',
            color: 'white',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          {submitting ? (
            <>
              <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
              <span>Submitting Claim...</span>
            </>
          ) : (
            <>
              <CheckCircle2 style={{ width: '16px', height: '16px' }} />
              <span>Submit Reimbursement Claim</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
