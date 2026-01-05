
import React, { useState } from 'react';
import { User } from '../types';

interface AdminSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user, onUpdateUser }) => {
  const [bankData, setBankData] = useState({
    bankName: user.platformSettlementBank?.bankName || 'Co-operative Bank (Paybill 400200)',
    accountNumber: user.platformSettlementBank?.accountNumber || '01102301315001',
    accountName: user.platformSettlementBank?.accountName || 'MEGAON ACTIVATION REVENUE'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call to save platform settlement account
    setTimeout(() => {
      onUpdateUser({
        ...user,
        platformSettlementBank: bankData
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center">
            <i className="fa-solid fa-piggy-bank text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Platform Receiving Account</h3>
            <p className="text-slate-500 text-sm">Official account receiving all activation fees.</p>
          </div>
        </div>

        {showSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center animate-in fade-in slide-in-from-top-4">
            <i className="fa-solid fa-circle-check mr-2"></i>
            Platform receiving account updated successfully!
          </div>
        )}

        <div className="mb-8 p-6 bg-slate-900 rounded-2xl text-white">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Current Settlement Target</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 text-sm">Paybill / Bank</span>
              <span className="font-mono text-indigo-400">{bankData.bankName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 text-sm">Account Number</span>
              <span className="font-mono text-indigo-400">{bankData.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Receiver Name</span>
              <span className="text-sm font-semibold">{bankData.accountName}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Update Receiving Bank / Paybill</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              value={bankData.bankName}
              onChange={e => setBankData({...bankData, bankName: e.target.value})}
              placeholder="e.g. Co-operative Bank (Paybill 400200)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Official Account Number</label>
            <input 
              required
              type="text" 
              placeholder="01102301315001"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={bankData.accountNumber}
              onChange={e => setBankData({...bankData, accountNumber: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Display Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. MEGAON SOLUTIONS"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={bankData.accountName}
              onChange={e => setBankData({...bankData, accountName: e.target.value})}
            />
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-3">
            <i className="fa-solid fa-circle-info text-indigo-600 mt-1"></i>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Activation fees of KES 100 from all Megaon users are processed and deposited into this specific Co-operative Bank account (Paybill 400200).
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center"
          >
            {isSaving ? <i className="fa-solid fa-spinner animate-spin mr-2"></i> : null}
            {isSaving ? 'Saving Account...' : 'Update Receiving Bank'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
