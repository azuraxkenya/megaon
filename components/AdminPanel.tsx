
import React, { useState, useEffect } from 'react';
import { User, PlatformConfig, Transaction } from '../types';
import { getPlatformConfig, updatePlatformConfig, getAllUsers, getAllTransactions } from '../services/platformService';

interface AdminPanelProps {
  admin: User;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ admin, onLogout }) => {
  const [config, setConfig] = useState<PlatformConfig>(getPlatformConfig());
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'withdrawals' | 'settings'>('dashboard');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUsers(getAllUsers());
    setTransactions(getAllTransactions());
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updatePlatformConfig(config);
      setIsSaving(false);
      alert('Platform configuration updated successfully.');
    }, 1000);
  };

  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const totalRevenue = transactions
    .filter(t => t.type === 'activation' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-72 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
              <i className="fa-solid fa-shield-halved text-white"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">ADMIN HQ</h1>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Platform Backend</p>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fa-solid fa-chart-pie"></i>
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fa-solid fa-users"></i>
            User Base
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fa-solid fa-money-bill-transfer"></i>
            Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="ml-auto bg-rose-600 text-[10px] text-white px-2 py-0.5 rounded-full">{pendingWithdrawals.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fa-solid fa-gears"></i>
            Platform Config
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Active Admin</p>
            <p className="text-sm font-bold truncate">{admin.name}</p>
          </div>
          <button onClick={onLogout} className="w-full py-3 text-rose-400 hover:text-rose-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <i className="fa-solid fa-power-off"></i>
            Secure Exit
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight capitalize">{activeTab} Backend</h2>
            <p className="text-slate-500 text-sm font-medium">Real-time platform governance and security audit.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase">System Status</p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                API CONNECTED
              </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Gross Revenue</p>
                  <h3 className="text-3xl font-black text-emerald-400">KES {totalRevenue.toLocaleString()}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">From Activation Fees</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Total Users</p>
                  <h3 className="text-3xl font-black text-white">{users.length}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{users.filter(u => u.isActivated).length} Activated accounts</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Pending Cashout</p>
                  <h3 className="text-3xl font-black text-rose-400">KES {pendingWithdrawals.reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString()}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{pendingWithdrawals.length} Unprocessed requests</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">System Load</p>
                  <h3 className="text-3xl font-black text-indigo-400">Normal</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Lat: 42ms • Safe</p>
                </div>
              </div>

              <section className="bg-slate-800 border border-slate-700 rounded-[2rem] overflow-hidden">
                <div className="p-8 border-b border-slate-700 flex justify-between items-center">
                  <h4 className="font-black text-xl">Recent Global Activity</h4>
                  <button className="text-xs font-bold text-indigo-400 hover:underline">Download CSV Audit</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-700">
                        <th className="px-8 py-6">User</th>
                        <th className="px-8 py-6">Action</th>
                        <th className="px-8 py-6">Amount</th>
                        <th className="px-8 py-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {transactions.slice(0, 10).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-bold text-white text-sm">{t.userName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{t.id}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.type === 'activation' ? 'bg-emerald-500/10 text-emerald-400' : t.type === 'withdrawal' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-white">KES {Math.abs(t.amount).toLocaleString()}</td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-bold ${t.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-slate-800 border border-slate-700 rounded-[2.5rem] overflow-hidden">
              <div className="p-10 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-2xl font-black mb-2">Member Database</h3>
                <p className="text-slate-400 text-sm">Managing {users.length} registered affiliate members.</p>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-[10px] font-black uppercase border-b border-slate-700">
                    <th className="px-10 py-6">Name & ID</th>
                    <th className="px-10 py-6">Contact</th>
                    <th className="px-10 py-6">Ref Code</th>
                    <th className="px-10 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-700/30 transition-all">
                      <td className="px-10 py-6">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{u.id}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-medium">{u.email}</p>
                        <p className="text-xs text-indigo-400 font-bold">{u.phoneNumber}</p>
                      </td>
                      <td className="px-10 py-6">
                        <code className="bg-slate-900 px-3 py-1 rounded-lg text-xs font-bold text-indigo-400">{u.referralCode}</code>
                      </td>
                      <td className="px-10 py-6">
                        {u.isActivated ? (
                          <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Activated
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase">
                            <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-[3rem] p-12 shadow-2xl">
              <h3 className="text-3xl font-black mb-10">Global Variables</h3>
              <form onSubmit={handleSaveConfig} className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Activation Fee (KES)</label>
                    <input 
                      type="number" 
                      value={config.activationFee}
                      onChange={e => setConfig({...config, activationFee: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 px-6 py-4 rounded-2xl text-xl font-black text-white outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Referral Bonus (KES)</label>
                    <input 
                      type="number" 
                      value={config.referralBonus}
                      onChange={e => setConfig({...config, referralBonus: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 px-6 py-4 rounded-2xl text-xl font-black text-white outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-700 space-y-6">
                  <h4 className="font-bold text-indigo-400 text-sm">Settlement Account (Receiving activation fees)</h4>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bank / Provider</label>
                    <input 
                      type="text" 
                      value={config.receivingBank.bankName}
                      onChange={e => setConfig({...config, receivingBank: {...config.receivingBank, bankName: e.target.value}})}
                      className="w-full bg-slate-900 border border-slate-700 px-5 py-3 rounded-xl text-sm font-bold text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Account Number</label>
                    <input 
                      type="text" 
                      value={config.receivingBank.accountNumber}
                      onChange={e => setConfig({...config, receivingBank: {...config.receivingBank, accountNumber: e.target.value}})}
                      className="w-full bg-slate-900 border border-slate-700 px-5 py-3 rounded-xl text-sm font-bold text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={config.receivingBank.accountName}
                      onChange={e => setConfig({...config, receivingBank: {...config.receivingBank, accountName: e.target.value}})}
                      className="w-full bg-slate-900 border border-slate-700 px-5 py-3 rounded-xl text-sm font-bold text-white outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                >
                  {isSaving && <i className="fa-solid fa-spinner animate-spin"></i>}
                  Update Platform Logic
                </button>
              </form>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="bg-slate-800 border border-slate-700 rounded-[2.5rem] overflow-hidden">
               <div className="p-10 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black mb-2">Pending Withdrawals</h3>
                  <p className="text-slate-400 text-sm">Action required for the following payout requests.</p>
                </div>
                <div className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-xs font-black border border-rose-500/20">
                  {pendingWithdrawals.length} REQUESTS OPEN
                </div>
              </div>
              {pendingWithdrawals.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                    <i className="fa-solid fa-check-double text-3xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-slate-500">Queue Clear</h4>
                  <p className="text-slate-600">All withdrawals have been processed.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] font-black uppercase border-b border-slate-700">
                      <th className="px-10 py-6">Member</th>
                      <th className="px-10 py-6">Amount</th>
                      <th className="px-10 py-6">Destination</th>
                      <th className="px-10 py-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {pendingWithdrawals.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-700/30 transition-all">
                        <td className="px-10 py-6">
                          <p className="font-bold text-white">{t.userName}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{t.userId}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-xl font-black text-rose-400">KES {Math.abs(t.amount).toLocaleString()}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-sm font-bold text-slate-300">{t.description}</p>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex gap-2">
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Approve</button>
                            <button className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-[10px] font-black uppercase">Hold</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
