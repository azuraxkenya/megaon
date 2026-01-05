
import { PlatformConfig } from "../types";

const DEFAULT_CONFIG: PlatformConfig = {
  activationFee: 100,
  referralBonus: 500,
  minWithdrawal: 200,
  receivingBank: {
    bankName: 'Co-operative Bank (Paybill 400200)',
    accountNumber: '01102301315001',
    accountName: 'MEGAON ACTIVATION REVENUE'
  }
};

export const getPlatformConfig = (): PlatformConfig => {
  const saved = localStorage.getItem('megaon_platform_config');
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
};

export const updatePlatformConfig = (config: PlatformConfig) => {
  localStorage.setItem('megaon_platform_config', JSON.stringify(config));
};

export const getAllUsers = () => {
  const data = localStorage.getItem('megaon_users');
  const userRecords = data ? JSON.parse(data) : [];
  return userRecords.map((r: any) => r.userData);
};

export const getAllTransactions = () => {
  // In a real backend, this would be a single query.
  // Here we aggregate from all user-specific storage keys.
  const allTxns: any[] = [];
  const users = getAllUsers();
  users.forEach((u: any) => {
    const userTxns = localStorage.getItem(`txns_${u.id}`);
    if (userTxns) {
      const parsed = JSON.parse(userTxns);
      parsed.forEach((t: any) => {
        allTxns.push({ ...t, userId: u.id, userName: u.name });
      });
    }
  });
  return allTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
