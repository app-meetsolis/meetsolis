import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  try {
    const info = await transporter.sendMail({
      from: `"Harigopal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "You're on the list! 🌟",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <div style="margin-bottom: 32px; text-align: center;">
            <img src="https://meetsolis.vercel.app/logo.jpg" alt="Solis Logo" style="width: 64px; height: 64px; border-radius: 12px; object-fit: cover;" />
          </div>
          <h2 style="margin-bottom: 24px;">You're in. 🚀</h2>
          <img src="https://via.placeholder.com/600x200?text=Placeholder+Image" alt="Placeholder Image" style="width: 100%; height: auto; margin-bottom: 24px;" />
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">
            Thanks for joining the Solis 2.0 waitlist, ${firstName}. We're thrilled to have you early on this journey.
          </p>

          <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <p style="font-weight: 600; margin-top: 0; margin-bottom: 12px; font-size: 16px;">Here is what we are building for you:</p>
            <ul style="color: #475569; padding-left: 20px; line-height: 1.6; margin-bottom: 0;">
              <li style="margin-bottom: 8px;"><strong>Total Client Memory:</strong> Never forget a detail. Solis remembers every meeting, email, and decision.</li>
              <li style="margin-bottom: 8px;"><strong>Instant Prep:</strong> Get a "Pre-meeting Brief" before every call with context and action items.</li>
              <li><strong>Second Brain:</strong> Ask Solis anything—"What did I promise Alex last week?" or "Draft a proposal based on our last chat."</li>
            </ul>
          </div>

          <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">
            <strong>What happens next?</strong><br>
            We are rolling out access in small batches to ensure a perfect experience. Keep an eye on your inbox—you'll receive a personal invite link when your spot opens.
          </p>

          <p style="color: #475569; line-height: 1.6; margin-bottom: 32px;">
            <strong>Have ideas or old meeting notes?</strong><br>
            We love feedback. If you have feature requests or want to share how you currently manage client notes, just <strong>reply to this email</strong>. We read everything.
          </p>

          <p style="color: #475569; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            Talk soon,<br>
            <strong>Harigopal</strong>
          </p>
          
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
            Follow us on <a href="https://x.com/SutharHarigopal" style="color: #2563eb; text-decoration: none;">Twitter/X</a> for behind-the-scenes updates.
          </p>
        </div>
      `,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
