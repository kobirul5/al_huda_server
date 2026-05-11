import config from "../../../config";
import emailSender from "../../../shared/brevoMailSender";

const sendContactEmail = async (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const { name, email, subject, message } = payload;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; margin: auto;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Contact Form Submission</h2>
      <div style="margin-top: 20px;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
      </div>
      <div style="margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <p style="margin-top: 0; font-weight: bold; color: #64748b;">Message:</p>
        <p style="white-space: pre-wrap; color: #334155; line-height: 1.6;">${message}</p>
      </div>
      <footer style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 0.875rem;">
        Sent from Al-Huda Contact Form
      </footer>
    </div>
  `;

  // Send email to the admin email
  await emailSender(config.brevoMail.email as string, htmlContent, `Al-Huda Contact: ${subject}`);
  
  return null;
};

export const ContactService = {
  sendContactEmail,
};
