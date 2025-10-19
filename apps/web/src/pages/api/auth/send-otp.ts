import { NextApiRequest, NextApiResponse } from 'next';
import { generateOTP, storeOTP } from '../../../lib/otp';
import { sendOTPEmail } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, language = 'en' } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const otp = generateOTP();
    await storeOTP(email, otp);
    
    const emailSent = await sendOTPEmail(email, otp, language);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
