
/**
 * M-Pesa Daraja API Integration Service (Simulated)
 * 
 * In production, this service would call your backend endpoint.
 * Your backend would then securely call the Safaricom Daraja API
 * to initiate an STK Push (LIPA NA M-PESA ONLINE).
 */

export const initiateStkPush = async (phoneNumber: string, amount: number, accountReference: string) => {
  console.log(`[Daraja API] Initiating STK Push to ${phoneNumber} for KES ${amount}...`);
  
  // Simulate network latency for the Daraja handshake
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        MerchantRequestID: '29115-345564-1',
        CheckoutRequestID: 'ws_CO_191220191020363925',
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: 'Success. Request accepted for processing'
      });
    }, 2000);
  });
};

export const checkPaymentStatus = async (checkoutRequestID: string) => {
  console.log(`[Daraja API] Polling status for ${checkoutRequestID}...`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate checking the callback result from Safaricom
      // In a real app, your backend would receive a callback and update a DB.
      resolve({ ResultCode: 0, ResultDesc: 'The service request is processed successfully.' });
    }, 1500);
  });
};
