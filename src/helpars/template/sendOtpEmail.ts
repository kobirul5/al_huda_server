export const sendOtpEmailTemplate = (otp: string) => `
  <div style="background-color:#f4f4f4; padding: 40px 0; font-family: Arial, sans-serif;">
    <div style="
      max-width: 480px; 
      margin: auto; 
      background: #ffffff; 
      padding: 30px; 
      border-radius: 12px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    ">
      <h2 style="color:#6C63FF; text-align:center; margin-bottom: 20px;">
        Iconic Email Verification
      </h2>

      <p style="font-size:16px; color:#333; text-align:center;">
        Use the verification code below to verify your Iconic account:
      </p>

      <div style="
        font-size: 32px; 
        font-weight: bold; 
        color: #6C63FF; 
        text-align: center; 
        margin: 25px 0; 
        letter-spacing: 4px;
      ">
        ${otp}
      </div>

      <p style="font-size:14px; color:#666; text-align:center; margin-top: 20px;">
        This code will expire shortly. If you did not request this, please ignore this email.
      </p>

      <p style="text-align:center; margin-top: 30px; font-size:12px; color:#999;">
        © ${new Date().getFullYear()} Iconic. All rights reserved.
      </p>
    </div>
  </div>
`;
