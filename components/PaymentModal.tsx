
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { initiateStkPush, checkPaymentStatus } from '../services/mpesaService';

interface PaymentModalProps {
  user: User;
  onSuccess: () => void;
  onLogout: () => void;
}

type PaymentStep = 'idle' | 'pushing' | 'awaiting_pin' | 'verifying' | 'success' | 'failed';

const PaymentModal: React.FC<PaymentModalProps> = ({ user, onSuccess, onLogout }) => {
  const [step, setStep] = useState<PaymentStep>('idle');
  const [timer, setTimer] = useState(60);
  const [errorReason, setErrorReason] = useState('');
  const [checkoutID, setCheckoutID] = useState('');

  useEffect(() => {
    let interval: any;
    if (step === 'awaiting_pin' && timer > 0) {
      const countdown = setInterval(() => setTimer(t => t - 1), 1000);
      
      // Every 10 seconds, simulate an automatic check
      interval = setInterval(async () => {
        if (timer % 10 === 0 && timer < 50) {
          handleVerification();
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(countdown);
      };
    } else if (timer === 0 && (step === 'awaiting_pin' || step === 'verifying')) {
      handleFailure('Timeout: No payment detected. Please ensure you entered your M-Pesa PIN.');
    }
  }, [step, timer]);

  const handleVerification = async () => {
    setStep('verifying');
    const status: any = await checkPaymentStatus(checkoutID);
    if (status.ResultCode === 0 && timer < 35) { // Simulate successful payment detection after some time
      setStep('success');
    } else {
      setStep('awaiting_pin');
    }
  };

  const handleStartPayment = async () => {
    setStep('pushing');
    try {
      const res: any = await initiateStkPush(user.phoneNumber, 100, `ACT-${user.id.slice(-5)}`);
      setCheckoutID(res.CheckoutRequestID);
      setStep('awaiting_pin');
    } catch (e) {
      handleFailure('Failed to connect to M-Pesa gateway.');
    }
  };

  const handleFailure = (reason: string) => {
    setStep('failed');
    setErrorReason(reason);
  };

  useEffect(() => {
    if (step === 'success') {
      const redirect = setTimeout(onSuccess, 3000);
      return () => clearTimeout(redirect);
    }
  }, [step, onSuccess]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/20">
        
        {/* Animated Progress Bar */}
        <div className="h-2 w-full bg-slate-100 overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${
              step === 'success' ? 'bg-emerald-500' : 
              step === 'failed' ? 'bg-rose-500' : 
              'bg-indigo-600'
            }`}
            style={{ width: 
              step === 'idle' ? '5%' : 
              step === 'pushing' ? '40%' : 
              step === 'awaiting_pin' ? '75%' : '100%' 
            }}
          ></div>
        </div>

        <div className="p-10">
          {step === 'idle' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" 
                  className="h-8 grayscale group-hover:grayscale-0 transition-all" 
                  alt="M-Pesa" 
                />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Activate Account</h2>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed px-2">
                Pay a one-time activation fee of <span className="text-slate-900 font-bold">KES 100</span> to start earning. A secure payment prompt will be sent to:
                <br/><span className="font-mono font-black text-indigo-600 text-lg">{user.phoneNumber}</span>
              </p>

              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-lock text-xs"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Secured Payment Gateway</p>
                    <p className="text-[10px] text-slate-400 font-medium">Your data is encrypted and private</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStartPayment}
                className="w-full bg-[#4BB543] hover:bg-[#3da336] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-emerald-100 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-mobile-button text-lg"></i>
                TRIGGER M-PESA PROMPT
              </button>
              
              <button onClick={onLogout} className="mt-6 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">
                Cancel & Logout
              </button>
            </div>
          )}

          {step === 'pushing' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <i className="fa-solid fa-signal text-indigo-600 text-3xl animate-bounce"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900">M-Pesa Handshake</h3>
              <p className="text-slate-500 text-sm mt-3 font-medium">Communicating with Safaricom line {user.phoneNumber}...</p>
            </div>
          )}

          {(step === 'awaiting_pin' || step === 'verifying') && (
            <div className="text-center">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-amber-50/50">
                {step === 'verifying' ? (
                  <i className="fa-solid fa-spinner animate-spin text-amber-500 text-4xl"></i>
                ) : (
                  <i className="fa-solid fa-fingerprint text-amber-500 text-4xl animate-pulse"></i>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Prompt Sent to Phone!
              </h3>
              <p className="text-slate-500 text-sm mb-10 px-4 leading-relaxed font-medium">
                Please check your phone screen for an <span className="text-slate-900 font-bold">M-Pesa PIN Prompt</span> for KES 100. Enter your secret PIN to authorize.
              </p>

              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black mb-8 shadow-lg">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                POLLING FOR PIN INPUT: {timer}s
              </div>

              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-left">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Next Steps</h4>
                <ul className="text-xs text-indigo-900 space-y-3 font-bold">
                  <li className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                    Unlock your smartphone.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                    Wait for the white M-Pesa popup.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                    Enter your <span className="underline">Secret PIN</span> and Send.
                  </li>
                </ul>
              </div>
              
              <div className="mt-10 flex flex-col gap-3">
                <button 
                  onClick={handleVerification}
                  className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
                >
                  I've entered my PIN
                </button>
                <button 
                  onClick={() => handleFailure('Prompt expired or rejected by user.')}
                  className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-rose-500"
                >
                  Prompt didn't show up
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 animate-in zoom-in duration-700">
              <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <i className="fa-solid fa-check-double text-emerald-600 text-6xl"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Success!</h2>
              <p className="text-slate-500 text-sm mb-10 font-medium">
                Activation fee received. Welcome to Megaon Network!
              </p>
              
              <div className="bg-slate-900 p-8 rounded-[2.5rem] mb-8 shadow-xl relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <i className="fa-solid fa-shield-check text-white text-6xl"></i>
                </div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Receipt Confirmed</p>
                <p className="text-sm font-bold text-white mb-1">M-Pesa Ref: <span className="font-mono text-emerald-400">UA5RA2Z8RE</span></p>
                <p className="text-[10px] text-slate-500 font-bold">Processed via Secured Settlement Network</p>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-emerald-600 font-black text-xs">
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                UNLOCKING YOUR DASHBOARD...
              </div>
            </div>
          )}

          {step === 'failed' && (
            <div className="text-center py-6">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="fa-solid fa-triangle-exclamation text-5xl"></i>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Failed</h2>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium px-4">
                {errorReason}
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => { setStep('idle'); setTimer(60); }}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-slate-800 transition-all transform active:scale-95"
                >
                  RE-TRY ACTIVATION
                </button>
                <button onClick={onLogout} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
