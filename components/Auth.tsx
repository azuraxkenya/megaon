
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { sendOTP, verifyOTP, OTPMethod, OTPResponse, VerificationResult } from '../services/notificationService';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'form' | 'otp' | 'forgot-password' | 'reset-password';

interface RegisteredUserRecord {
  password: string;
  userData: User;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('form');
  const [otpMethod, setOtpMethod] = useState<OTPMethod>('phone');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getRegisteredUsers = (): RegisteredUserRecord[] => {
    const data = localStorage.getItem('megaon_users');
    return data ? JSON.parse(data) : [];
  };

  const saveUser = (newUser: RegisteredUserRecord) => {
    const users = getRegisteredUsers();
    users.push(newUser);
    localStorage.setItem('megaon_users', JSON.stringify(users));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsProcessing(true);

    if (isLogin) {
      // Admin Backend Quick-Access
      if (formData.phone === 'admin@megaon.com' && formData.password === 'admin123') {
        setTimeout(() => {
          onLogin({
            id: 'admin_001',
            name: 'Platform Administrator',
            email: 'admin@megaon.com',
            phoneNumber: '0700000000',
            isActivated: true,
            isAdmin: true,
            referralCode: 'ADMIN_ROOT',
            bankLinked: false
          });
        }, 1200);
        return;
      }

      setTimeout(() => {
        const users = getRegisteredUsers();
        const found = users.find(u => 
          (u.userData.phoneNumber === formData.phone || u.userData.email === formData.phone) && 
          u.password === formData.password
        );

        if (found) {
          onLogin(found.userData);
        } else {
          setLoginError("Invalid details. Account not found or password incorrect.");
          setIsProcessing(false);
        }
      }, 1200);
    } else {
      const users = getRegisteredUsers();
      const exists = users.some(u => u.userData.phoneNumber === formData.phone || u.userData.email === formData.email);
      
      if (exists) {
        setLoginError("This account already exists. Please login instead.");
        setIsProcessing(false);
        return;
      }

      const destination = otpMethod === 'phone' ? formData.phone : formData.email;
      const response: OTPResponse = await sendOTP(destination, otpMethod);
      
      setIsProcessing(false);
      if (response.success) {
        setIsResetFlow(false);
        setStep('otp');
      } else {
        setLoginError(response.error || "Failed to send OTP. Please try again.");
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsProcessing(true);
    
    const users = getRegisteredUsers();
    const destination = otpMethod === 'phone' ? formData.phone : formData.email;
    const exists = users.some(u => (otpMethod === 'phone' ? u.userData.phoneNumber === formData.phone : u.userData.email === formData.email));
    
    if (!exists) {
      setLoginError("Account not found. Please check the phone/email entered.");
      setIsProcessing(false);
      return;
    }

    const response: OTPResponse = await sendOTP(destination, otpMethod);
    setIsProcessing(false);
    if (response.success) {
      setIsResetFlow(true);
      setStep('otp');
    } else {
      setLoginError(response.error || "Failed to send recovery code.");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const destination = otpMethod === 'phone' ? formData.phone : formData.email;
      const index = users.findIndex(u => (otpMethod === 'phone' ? u.userData.phoneNumber === formData.phone : u.userData.email === formData.email));
      
      if (index !== -1) {
        users[index].password = formData.newPassword;
        localStorage.setItem('megaon_users', JSON.stringify(users));
      }

      alert("Password reset successful!");
      setIsProcessing(false);
      setIsResetFlow(false);
      setIsLogin(true);
      setStep('form');
    }, 1500);
  };

  const finalizeAuth = () => {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: formData.name || 'John Doe',
      email: formData.email,
      phoneNumber: formData.phone,
      isActivated: false,
      referralCode: Math.random().toString(36).substring(7).toUpperCase(),
      bankLinked: false
    };

    saveUser({
      password: formData.password,
      userData: newUser
    });

    onLogin(newUser);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpValue.join('');
    if (code.length === 6) {
      setIsProcessing(true);
      const destination = otpMethod === 'phone' ? formData.phone : formData.email;
      const result: VerificationResult = await verifyOTP(destination, code);
      
      if (result.status === 'approved') {
        if (isResetFlow) {
          setIsProcessing(false);
          setStep('reset-password');
        } else {
          finalizeAuth();
        }
      } else {
        alert(result.error || 'Invalid code. Please try again.');
        setIsProcessing(false);
      }
    } else {
      alert('Please enter the full 6-digit code');
    }
  };

  const maskDestination = (val: string) => {
    if (!val) return '...';
    if (val.includes('@')) {
      const [name, domain] = val.split('@');
      return `${name[0]}***@${domain}`;
    }
    return `*******${val.slice(-3)}`;
  };

  // OTP STEP UI
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Secure OTP Link Established</span>
            </div>
          </div>

          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 border-2 border-indigo-200 rounded-3xl animate-ping opacity-20"></div>
            <i className={`fa-solid ${otpMethod === 'phone' ? 'fa-mobile-vibration' : 'fa-envelope-open-text'} text-3xl`}></i>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900">Verify Identity</h2>
          <p className="text-slate-500 mt-3 mb-10 leading-relaxed">
            {isResetFlow ? 'Resetting password for' : 'A verification code was sent to'} <span className="font-bold text-slate-900">{otpMethod === 'phone' ? 'phone' : 'email'}</span>:<br />
            <span className="font-mono font-bold text-indigo-600 text-lg">
              {maskDestination(otpMethod === 'phone' ? formData.phone : formData.email)}
            </span>
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-10">
            <div className="flex justify-between gap-2">
              {otpValue.map((val, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-full h-16 text-center text-3xl font-black border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all bg-slate-50 text-slate-900"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing && <i className="fa-solid fa-circle-notch animate-spin"></i>}
              {isProcessing ? 'Verifying with Platform...' : 'Validate Code'}
            </button>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel & Go Back
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-3 opacity-40">
            <i className="fa-solid fa-shield-halved text-xs"></i>
            <span className="text-[10px] font-bold text-slate-400">Encrypted by Global Identity Standards</span>
          </div>
        </div>
      </div>
    );
  }

  // FORGOT PASSWORD STEP UI
  if (step === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-10 animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-key text-2xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Forgot Password?</h2>
            <p className="text-slate-500 text-sm">Choose how to receive your recovery code.</p>
          </div>

          <form onSubmit={handleForgotSubmit} className="space-y-6">
            {loginError && (
              <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {loginError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setOtpMethod('phone')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-xs ${otpMethod === 'phone' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                <i className="fa-solid fa-mobile-screen"></i>
                SMS OTP
              </button>
              <button
                type="button"
                onClick={() => setOtpMethod('email')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-xs ${otpMethod === 'email' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                <i className="fa-solid fa-envelope"></i>
                EMAIL OTP
              </button>
            </div>

            {otpMethod === 'phone' ? (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">M-Pesa Number</label>
                <input
                  required
                  type="tel"
                  className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                  placeholder="0712345678"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registered Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                  placeholder="name@company.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isProcessing && <i className="fa-solid fa-circle-notch animate-spin"></i>}
              Send Recovery Code
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RESET PASSWORD STEP UI
  if (step === 'reset-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">New Password</h2>
            <p className="text-slate-500 text-sm">Identity verified. Set your new security credentials.</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <input
                required
                type="password"
                className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input
                required
                type="password"
                className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {isProcessing && <i className="fa-solid fa-circle-notch animate-spin"></i>}
              Update Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOGIN / SIGNUP FORM STEP UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <i className="fa-solid fa-shield-halved text-8xl text-white"></i>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/20">
            <i className="fa-solid fa-bolt-lightning text-white text-2xl"></i>
          </div>
          <h1 className="text-white text-3xl font-black tracking-tighter">MEGAON</h1>
          <p className="text-slate-400 mt-2 font-medium">Kenya's Premium Earning Hub</p>
        </div>

        <div className="p-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setIsResetFlow(false); setLoginError(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Member Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setIsResetFlow(false); setLoginError(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            {loginError && (
              <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {loginError}
              </div>
            )}

            {!isLogin && (
              <>
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                    placeholder="Enter your legal names"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="animate-in slide-in-from-top-4 duration-500">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">OTP Delivery Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpMethod('phone')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-xs ${otpMethod === 'phone' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <i className="fa-solid fa-mobile-screen text-lg"></i>
                      SMS OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpMethod('email')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-xs ${otpMethod === 'email' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <i className="fa-solid fa-envelope text-lg"></i>
                      Email OTP
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {isLogin ? 'Phone or Email' : 'M-Pesa Number'}
              </label>
              <input
                required
                type={isLogin ? "text" : "tel"}
                className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                placeholder={isLogin ? "0712345678 or admin@megaon.com" : "0712345678"}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => setStep('forgot-password')}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                required
                type="password"
                className="w-full px-5 py-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-95 ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  {isLogin ? 'Authenticating...' : 'Connecting to OTP Platform...'}
                </>
              ) : (
                isLogin ? 'Enter Dashboard' : `Start Verification`
              )}
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-300 mt-8 leading-relaxed">
            By continuing, you agree to Megaon's Terms of Service and Privacy Policy. All transactions are secured by industry-leading encryption.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
