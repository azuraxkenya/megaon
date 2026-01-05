
import React, { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleActivationSuccess = () => {
    if (user) {
      const activatedUser = { ...user, isActivated: true };
      setUser(activatedUser);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Admin Route
  if (user.isAdmin) {
    return <AdminPanel admin={user} onLogout={handleLogout} />;
  }

  // Strict check: If user is not activated, they must stay on the payment screen.
  if (!user.isActivated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <PaymentModal 
          user={user} 
          onSuccess={handleActivationSuccess} 
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <Dashboard user={user} onUpdateUser={setUser} />
      <footer className="md:pl-64 py-6 border-t border-slate-200 bg-white text-center text-slate-400 text-sm">
        <p>© 2024 Megaon. Empowering Affiliate Growth in Kenya.</p>
      </footer>
    </div>
  );
};

export default App;
