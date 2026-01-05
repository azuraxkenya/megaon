
import React, { useState } from 'react';
import { User } from '../types';

interface ReferralSystemProps {
  user: User;
  onSimulateInvite?: () => void;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ user, onSimulateInvite }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-500/30">
            <i className="fa-solid fa-crown"></i>
            Top Affiliate Tier
          </div>
          <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">Grow Your Megaon<br/>Earnings Network</h3>
          <p className="text-indigo-200/70 leading-relaxed max-w-lg font-medium">
            Copy your unique referral link below. For every active member you bring into the network, your balance increases by <span className="text-white font-black underline decoration-indigo-500 decoration-4">KES 500</span> instantly.
          </p>
          
          <div className="mt-10 space-y-4">
            <div className="flex items-center bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10 ring-1 ring-white/10">
              <input 
                readOnly
                type="text" 
                value={referralLink} 
                className="bg-transparent flex-1 px-4 text-sm font-mono text-indigo-200 outline-none truncate"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-black text-xs hover:bg-indigo-50 transition-all transform active:scale-95 shadow-lg"
              >
                {copied ? 'COPIED!' : 'COPY LINK'}
              </button>
            </div>
            
            {onSimulateInvite && (
              <button 
                onClick={onSimulateInvite}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2"
              >
                <i className="fa-solid fa-vial"></i>
                Simulate successful invite (Testing Only)
              </button>
            )}
          </div>
        </div>
        
        <div className="shrink-0 flex flex-col items-center">
          <div className="flex -space-x-4 mb-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-14 h-14 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-xl ring-1 ring-indigo-500/20">
                <img 
                  className="w-full h-full object-cover"
                  src={`https://picsum.photos/seed/mega_${i + 50}/200`}
                  alt="Affiliate"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Network Active • 2,401 Online</p>
        </div>
      </div>
    </section>
  );
};

export default ReferralSystem;
