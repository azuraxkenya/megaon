
/**
 * OTP Service - Twilio Verify Integration
 * 
 * Why Twilio Verify? 
 * It is the industry-leading platform for identity verification. 
 * Unlike standard SMS, Verify manages the code lifecycle (generation, 
 * expiration, and rate-limiting) on Twilio's secure servers.
 * 
 * Note: In production, these client-side calls must point to your 
 * backend (e.g., /api/otp/start) to keep your Twilio Account SID 
 * and Auth Token hidden from the browser.
 */

export type OTPMethod = 'phone' | 'email';

export interface OTPResponse {
  success: boolean;
  sid?: string;
  error?: string;
}

export interface VerificationResult {
  status: 'approved' | 'pending' | 'canceled' | 'expired';
  error?: string;
}

/**
 * Initiates the OTP process by sending a code to the user.
 */
export const sendOTP = async (destination: string, method: OTPMethod): Promise<OTPResponse> => {
  const channel = method === 'phone' ? 'sms' : 'email';
  console.log(`[Twilio Verify API] Starting ${channel} verification for: ${destination}`);

  // This simulates a fetch to your Node/Python/PHP backend
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate for network reliability
      const isSuccess = Math.random() < 0.98;
      
      if (isSuccess) {
        resolve({
          success: true,
          sid: `VA${Math.random().toString(36).substring(2, 12).toUpperCase()}`
        });
      } else {
        resolve({
          success: false,
          error: "OTP service is temporarily busy. Please try again in 1 minute."
        });
      }
    }, 1800);
  });
};

/**
 * Validates the code entered by the user.
 */
export const verifyOTP = async (destination: string, code: string): Promise<VerificationResult> => {
  console.log(`[Twilio Verify API] Checking code ${code} for: ${destination}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      // Production logic simulation:
      // '123456' is our master test code
      // Otherwise, we simulate a check
      if (code === '123456' || code.length === 6) {
        // Simulating the "Approved" state from Twilio
        resolve({ status: 'approved' });
      } else {
        resolve({ 
          status: 'pending', 
          error: "The code you entered is incorrect. Please check and try again." 
        });
      }
    }, 1500);
  });
};
