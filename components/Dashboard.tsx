
import React, { useState, useEffect } from 'react';
import { User, EarningsData, Transaction } from '../types';
import { getEarningsInsights } from '../services/geminiService';
import ReferralSystem from './ReferralSystem';
import WithdrawalForm from './WithdrawalForm';
import AdminSettings from './AdminSettings';

interface DashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser }) => {
  // Simulate fetching real data from an account ledger
  const [earnings, setEarnings] = useState<EarningsData>(() => {
    const saved = localStorage.getItem(`earnings_${user.id}`);
    return saved ? JSON.parse(saved) : {
      totalEarned: 0,
      referralEarnings: 0,
      totalWithdrawn: 0,
      pendingBalance: 0
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`txns_${user.id}`);
    return saved ? JSON.parse(saved) : [
      { id: 'TXN-UA5RA2Z8RE', type: 'activation', amount: -100, date: new Date().toISOString().split('T')[0], status: 'completed', description: 'Megaon Activation Fee' }
    ];
  });

  const [aiTips, setAiTips] = useState<any[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'history' | 'admin'>('overview');
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [lastBonusDate, setLastBonusDate] = useState(localStorage.getItem(`last_bonus_${user.id}`) || '');

  // Persist state to "DB"
  useEffect(() => {
    localStorage.setItem(`earnings_${user.id}`, JSON.stringify(earnings));
    localStorage.setItem(`txns_${user.id}`, JSON.stringify(transactions));
  }, [earnings, transactions, user.id]);

  useEffect(() => {
    const fetchTips = async () => {
      setIsLoadingTips(true);
      const tips = await getEarningsInsights(user, earnings);
      setAiTips(tips);
      setIsLoadingTips(false);
    };
    fetchTips();
  }, [user]);

  const addTransaction = (txn: Partial<Transaction>) => {
    const newTxn: Transaction = {
      id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      ...txn as Transaction
    };
    setTransactions(prev => [newTxn, ...prev]);
    
    setEarnings(prev => ({
      ...prev,
      totalEarned: txn.amount! > 0 ? prev.totalEarned + txn.amount! : prev.totalEarned,
      referralEarnings: txn.type === 'referral' ? prev.referralEarnings + txn.amount! : prev.referralEarnings,
      totalWithdrawn: txn.type === 'withdrawal' ? prev.totalWithdrawn + Math.abs(txn.amount!) : prev.totalWithdrawn,
      pendingBalance: prev.pendingBalance + txn.amount!
    }));
  };

  const handleClaimDailyBonus = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastBonusDate === today) return;

    setIsClaimingBonus(true);
    setTimeout(() => {
      addTransaction({
        type: 'referral', // Count as earning
        amount: 20,
        description: 'Daily Activity Bonus',
        status: 'completed'
      });
      setLastBonusDate(today);
      localStorage.setItem(`last_bonus_${user.id}`, today);
      setIsClaimingBonus(false);
    }, 1500);
  };

  const handleSimulateReferral = () => {
    addTransaction({
      type: 'referral',
      amount: 500,
      description: 'Referral Bonus: New Invite Joined',
      status: 'completed'
    });
  };

  const handleWithdrawal = (amount: number, method: string) => {
    addTransaction({
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal to ${method}`,
      status: 'pending'
    });
    setActiveTab('overview');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const bonusClaimed = lastBonusDate === todayStr;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white shrink-0 border-r border-slate-800">
        <div className="p-8 border-b border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">M</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">MEGAON</h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">LIVE ACCOUNT</span>
          </div>
        </div>
        
        <nav className="p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-wallet text-lg"></i>
            <span>My Earnings</span>
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'withdraw' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-money-bill-transfer text-lg"></i>
            <span>Withdraw</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-list-check text-lg"></i>
            <span>Activity Logs</span>
          </button>
          
          <div className="pt-8 pb-4">
            <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Platform Settings</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'admin' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-building-columns text-lg"></i>
            <span>Settlement Bank</span>
          </button>
        </nav>
        
        <div className="mt-auto p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Member Verified</p>
            <p className="font-bold truncate">{user.name}</p>
            <p className="text-xs text-indigo-400 font-mono">{user.phoneNumber}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Earnings Center</h2>
            <p className="text-slate-500 font-medium">Real-time tracking of your account balance.</p>
          </div>
          <div className="flex gap-3">
             <button 
              disabled={bonusClaimed}
              onClick={handleClaimDailyBonus}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${bonusClaimed ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600'}`}
            >
              {isClaimingBonus ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-gift"></i>}
              {bonusClaimed ? 'Activity Bonus Claimed' : 'Claim Daily Bonus'}
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-up-from-bracket"></i>
              Cash Out
            </button>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4 relative z-10">Real-time Balance</p>
                  <h3 className="text-4xl font-black text-slate-900 relative z-10">KES {earnings.pendingBalance.toLocaleString()}</h3>
                  <div className="mt-4 flex items-center text-emerald-500 text-sm font-bold relative z-10">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-2"></span>
                    Account Active
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Total Earned</p>
                  <h3 className="text-4xl font-black text-slate-900">KES {earnings.totalEarned.toLocaleString()}</h3>
                  <div className="mt-4 flex items-center text-indigo-500 text-sm font-bold">
                    <i className="fa-solid fa-users mr-2"></i>
                    KES 500 per friend
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Amount Withdrawn</p>
                  <h3 className="text-4xl font-black text-slate-900">KES {earnings.totalWithdrawn.toLocaleString()}</h3>
                  <div className="mt-4 flex items-center text-slate-400 text-sm font-bold">
                    <i className="fa-solid fa-circle-check mr-2"></i>
                    Direct to {user.phoneNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <ReferralSystem user={user} onSimulateInvite={handleSimulateReferral} />
                  
                  {/* AI Growth section */}
                  <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <i className="fa-solid fa-chart-line text-indigo-500"></i>
                        Earning Insights
                      </h4>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-tighter">AI Analysis</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {isLoadingTips ? (
                        Array(2).fill(0).map((_, i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>)
                      ) : (
                        aiTips.map((tip, idx) => (
                          <div key={idx} className="group p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default">
                            <i className={`${tip.icon} text-2xl text-indigo-600 mb-4 block`}></i>
                            <h5 className="font-black text-slate-900 mb-2">{tip.title}</h5>
                            <p className="text-sm text-slate-500 leading-relaxed">{tip.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <aside className="space-y-8">
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-200">
                    <h4 className="font-black mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-indigo-400"></i>
                      Live Feed
                    </h4>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 group">
                          <div>
                            <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{tx.description}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{tx.date}</p>
                          </div>
                          <p className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('history')} className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                      View Full History
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <WithdrawalForm 
              balance={earnings.pendingBalance} 
              user={user} 
              onUpdateUser={onUpdateUser}
              onWithdraw={handleWithdrawal}
            />
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-900">Transaction History</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audited Records</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-8 py-6">Reference ID</th>
                      <th className="px-8 py-6">Activity</th>
                      <th className="px-8 py-6">Date</th>
                      <th className="px-8 py-6 text-right">Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                           <span className="text-[11px] font-mono text-slate-400 uppercase tracking-tighter">{tx.id}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              <i className={`fa-solid ${tx.type === 'referral' ? 'fa-user-plus' : tx.type === 'withdrawal' ? 'fa-bank' : 'fa-check-circle'}`}></i>
                            </div>
                            <p className="font-bold text-slate-700 text-sm">{tx.description}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-500 text-sm">{tx.date}</td>
                        <td className={`px-8 py-6 text-right font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <AdminSettings user={user} onUpdateUser={onUpdateUser} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
