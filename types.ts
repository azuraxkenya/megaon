
export interface User {
  id: string;
  name: string;
  email: string;
  isActivated: boolean;
  isAdmin?: boolean; // New: Flag for admin access
  phoneNumber: string;
  referralCode: string;
  bankLinked: boolean;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  platformSettlementBank?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface Transaction {
  id: string;
  userId?: string; // New: To track which user the txn belongs to in Admin view
  userName?: string; // New: For display in Admin lists
  type: 'referral' | 'withdrawal' | 'activation';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export interface EarningsData {
  totalEarned: number;
  referralEarnings: number;
  totalWithdrawn: number;
  pendingBalance: number;
}

export interface PlatformConfig {
  activationFee: number;
  referralBonus: number;
  minWithdrawal: number;
  receivingBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}
