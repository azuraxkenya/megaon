
import React, { useState } from 'react';
import { User } from '../types';

interface WithdrawalFormProps {
  balance: number;
  user: User;
  onUpdateUser: (user: User) => void;
  onWithdraw: (amount: number, method: string) => void;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ balance, user, onUpdateUser, onWithdraw }) => {
  const [method, setMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [amount, setAmount] = useState('');
  const [bankData, setBankData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: ''
  });
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    setTimeout(() => {
      onUpdateUser({
        ...user,
        bankLinked: true,
        bankDetails: bankData
      });
      setIsLinking(false);
    }, 1500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > balance) return alert('Insufficient balance');
    if (withdrawAmount < 200) return alert('Minimum withdrawal is KES 200');
    
    onWithdraw(withdrawAmount, method === 'mpesa' ? 'M-Pesa' : bankData.bankName);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Withdraw Funds</h3>
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMethod('mpesa')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'mpesa' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
          >
            <i className="fa-solid fa-mobile-screen-button text-2xl"></i>
            <span className="font-bold">M-Pesa</span>
          </button>
          <button 
            onClick={() => setMethod('bank')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'bank' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
          >
            <i className="fa-solid fa-building-columns text-2xl"></i>
            <span className="font-bold">Bank Transfer</span>
          </button>
        </div>

        {method === 'bank' && !user.bankLinked ? (
          <form onSubmit={handleLinkBank} className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
              <p className="text-sm text-blue-700 flex items-center">
                <i className="fa-solid fa-circle-info mr-2"></i>
                Link your bank account to receive high-value withdrawals directly.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <select 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setBankData({...bankData, bankName: e.target.value})}
              >
                <option value="">Select Bank...</option>
                <option value="Equity Bank">Equity Bank</option>
                <option value="KCB Bank">KCB Bank</option>
                <option value="Co-operative Bank">Co-operative Bank</option>
                <option value="Absa Bank">Absa Bank</option>
                <option value="Standard Chartered">Standard Chartered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
              <input 
                required
                type="text" 
                placeholder="Name as it appears on bank"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setBankData({...bankData, accountName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input 
                required
                type="text" 
                placeholder="0123456789"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setBankData({...bankData, accountNumber: e.target.value})}
              />
            </div>
            <button 
              disabled={isLinking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center"
            >
              {isLinking ? <i className="fa-solid fa-spinner animate-spin mr-2"></i> : null}
              {isLinking ? 'Securing Connection...' : 'Connect Bank Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm">Recipient</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-700 border border-slate-200">
                  {method === 'mpesa' ? 'M-PESA' : 'BANK'}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {method === 'mpesa' ? user.phoneNumber : user.bankDetails?.accountName}
              </p>
              <p className="text-sm text-slate-400">
                {method === 'mpesa' ? 'Primary M-Pesa Number' : `${user.bankDetails?.bankName} - ${user.bankDetails?.accountNumber}`}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Amount (KES)</label>
                <span className="text-xs text-emerald-600 font-bold">Balance: KES {balance}</span>
              </div>
              <input 
                required
                type="number" 
                min="200"
                max={balance}
                placeholder="Minimum 200"
                className="w-full px-4 py-4 text-2xl font-bold border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl">
              Process Withdrawal
            </button>
            <p className="text-center text-xs text-slate-400">
              Funds are typically processed within 15 minutes for M-Pesa and 24 hours for Bank transfers.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawalForm;
