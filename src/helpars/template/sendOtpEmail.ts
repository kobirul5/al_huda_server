export const sendOtpEmailTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="margin: 0; color: #111827;">Al Huda Email Verification</h1>
    </div>
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
      <p style="margin-top: 0; font-size: 16px; line-height: 1.6;">
        Use the verification code below to verify your Al Huda account:
      </p>
      <div style="margin: 24px 0; text-align: center;">
        <span style="display: inline-block; padding: 14px 24px; font-size: 28px; font-weight: 700; letter-spacing: 8px; background: #111827; color: #ffffff; border-radius: 10px;">
          ${otp}
        </span>
      </div>
      <p style="margin-bottom: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
        This code will expire in 15 minutes. If you did not request this, you can safely ignore this email.
      </p>
    </div>
    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
      © ${new Date().getFullYear()} Al Huda. All rights reserved.
    </p>
  </div>
`;
