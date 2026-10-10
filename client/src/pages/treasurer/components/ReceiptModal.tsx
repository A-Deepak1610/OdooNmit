import React from 'react';
import { X, Printer, Download, CheckCircle2, Building, Receipt, FileText } from 'lucide-react';
import { ItemizedReceipt } from '../../../data/mockTreasurerData';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ItemizedReceipt | null;
  claimTitle?: string;
  volunteerName?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  claimTitle,
  volunteerName,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textData = `
======================================================
           OFFICIAL TAX INVOICE & RECEIPT
======================================================
Merchant: ${receipt.merchantName}
Address:  ${receipt.merchantAddress}
GSTIN:    ${receipt.merchantGSTIN}
Invoice:  ${receipt.invoiceNumber}
Date:     ${receipt.invoiceDate}
------------------------------------------------------
Claim:    ${claimTitle || 'N/A'}
Claimant: ${volunteerName || 'Volunteer'}
------------------------------------------------------
ITEMS:
${receipt.items.map((i) => `• ${i.name} (x${i.quantity}) - ₹${i.price}`).join('\n')}
------------------------------------------------------
Subtotal: ₹${receipt.subtotal}
Taxes:    ₹${receipt.taxAmount}
TOTAL:    ₹${receipt.totalAmount}
Payment:  ${receipt.paymentProofType}
Ref:      ${receipt.transactionRef}
======================================================
Audited by CampusMitra Treasury
    `;
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receipt.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Receipt & Tax Invoice</h3>
              <p className="text-xs text-slate-500">Invoice #{receipt.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download text slip"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print receipt"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close modal"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Receipt Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Claim Context Header */}
          {claimTitle && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Claim Attached: </span>
                <span>{claimTitle}</span>
                {volunteerName && (
                  <span className="block text-blue-700 mt-0.5">Submitted by: {volunteerName}</span>
                )}
              </div>
            </div>
          )}

          {/* Skeuomorphic Thermal/Tax Invoice Card */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 border border-dashed border-slate-300 rounded-xl p-5 shadow-xs font-mono text-xs text-slate-800 space-y-4">
            {/* Merchant Info */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-1.5">
                <Building className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 tracking-wide font-sans">{receipt.merchantName}</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">{receipt.merchantAddress}</p>
              <div className="inline-block mt-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-sans font-semibold">
                GSTIN: {receipt.merchantGSTIN}
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-b border-dashed border-slate-300">
              <div>
                <span className="text-slate-400 block font-sans text-[10px]">INVOICE NO:</span>
                <span className="font-bold text-slate-900">{receipt.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-sans text-[10px]">DATE:</span>
                <span className="font-bold text-slate-900">{receipt.invoiceDate}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 py-1">
              <div className="grid grid-cols-12 text-[10px] font-sans font-bold text-slate-400 border-b border-slate-200 pb-1">
                <span className="col-span-7">ITEM</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-3 text-right">AMOUNT</span>
              </div>
              {receipt.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] items-center py-0.5">
                  <span className="col-span-7 font-sans text-slate-700 truncate pr-1">{item.name}</span>
                  <span className="col-span-2 text-center text-slate-500 font-mono">x{item.quantity}</span>
                  <span className="col-span-3 text-right font-bold text-slate-900 font-mono">₹{item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600 font-sans">
                <span>Subtotal</span>
                <span className="font-mono">₹{receipt.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-sans">
                <span>Taxes & GST</span>
                <span className="font-mono">₹{receipt.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span className="font-sans">Total Paid</span>
                <span className="font-mono text-base text-slate-900">₹{receipt.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Settlement Footnote */}
            <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] font-sans">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{receipt.paymentProofType}</span>
              </div>
              <span className="text-slate-400 font-mono truncate max-w-[150px]">{receipt.transactionRef}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
