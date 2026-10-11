import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import QRCode from 'qrcode';
import { ENV } from '../../config/env.js';

export interface TicketEmailPayload {
  recipientEmail?: string;
  recipientName?: string;
  bookingNumber: string;
  bookingId: string;
  otpCode: string;
  eventTitle: string;
  venue?: string;
  startAt?: Date | string;
  quantity: number;
  totalAmountPaise?: number;
  qrPayload: string;
}

export class EmailService {
  private transporter: Transporter;


  constructor() {
    this.transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Verify SMTP Transporter Connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('📧 SMTP Mailer connected and ready to send emails.');
      return true;
    } catch (err: any) {
      console.error('❌ SMTP Mailer verification failed:', err.message);
      return false;
    }
  }

  /**
   * Send Confirmed Event Ticket Email with Ticket No, Booking ID, OTP, and Embedded QR Code
   */
  async sendTicketConfirmationEmail(payload: TicketEmailPayload): Promise<any> {
    const {
      recipientEmail,
      recipientName = 'Student',
      bookingNumber,
      bookingId,
      otpCode,
      eventTitle,
      venue = 'Campus Main Auditorium',
      startAt,
      quantity,
      totalAmountPaise = 0,
      qrPayload,
    } = payload;

    // Recipients: Always include deepak.ad24@bitsathy.ac.in as required
    const targetEmails = new Set<string>();
    targetEmails.add(ENV.ADMIN_NOTIFICATION_EMAIL || 'deepak.ad24@bitsathy.ac.in');
    if (recipientEmail && recipientEmail.includes('@')) {
      targetEmails.add(recipientEmail.trim());
    }
    const toRecipients = Array.from(targetEmails).join(', ');

    // Generate QR Code image buffer for inline CID attachment
    let qrBuffer: Buffer;
    try {
      qrBuffer = await QRCode.toBuffer(qrPayload || `CAMPUSMITRA:${bookingNumber}:${otpCode}`, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.error('Failed to generate QR buffer:', e);
      qrBuffer = Buffer.from('');
    }

    const eventDateStr = startAt
      ? new Date(startAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Scheduled on Event Day';

    const amountInr = totalAmountPaise ? `₹${(totalAmountPaise / 100).toFixed(2)}` : 'FREE';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ticket Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 13px; color: #e0e7ff; font-weight: 500; }
    .badge { display: inline-block; background: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
    .content { padding: 28px 24px; }
    .thankyou-box { background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; }
    .thankyou-box p { margin: 0; font-size: 13px; color: #334155; line-height: 1.5; }
    .event-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
    .event-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .event-meta { font-size: 12px; color: #64748b; margin: 4px 0; display: flex; align-items: center; }
    .details-grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .details-grid td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .details-grid td.label { font-weight: 600; color: #64748b; width: 40%; }
    .details-grid td.value { font-weight: 700; color: #0f172a; text-align: right; font-family: monospace; }
    .otp-highlight { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-size: 14px; font-weight: 800; border: 1px solid #fde68a; letter-spacing: 2px; }
    .qr-section { text-align: center; padding: 20px; background: #faf5ff; border: 2px dashed #c084fc; border-radius: 14px; margin-bottom: 24px; }
    .qr-section img { width: 220px; height: 220px; display: block; margin: 0 auto 12px auto; border-radius: 8px; background: #ffffff; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .qr-caption { font-size: 11px; color: #7e22ce; font-weight: 600; margin: 0; }
    .footer { text-align: center; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Official Entry Pass Confirmed</div>
      <h1>CampusMitra Pass Issued</h1>
      <p>Your event registration and ticket purchase have been approved!</p>
    </div>

    <div class="content">
      <div class="thankyou-box">
        <p>
          🎉 <strong>Thank You, ${recipientName}!</strong><br />
          Thank you for securing your ticket with CampusMitra. We are thrilled to confirm your booking! Please present the entry pass QR code or your 6-digit OTP below at the reception desk for instant check-in.
        </p>
      </div>

      <div class="event-card">
        <div class="event-title">${eventTitle}</div>
        <div class="event-meta">📍 <strong>Venue:</strong>&nbsp;${venue}</div>
        <div class="event-meta">📅 <strong>Date:</strong>&nbsp;${eventDateStr}</div>
      </div>

      <table class="details-grid">
        <tr>
          <td class="label">Ticket Number</td>
          <td class="value">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="label">Booking ID</td>
          <td class="value">${bookingId}</td>
        </tr>
        <tr>
          <td class="label">Check-in OTP (6-Digit)</td>
          <td class="value"><span class="otp-highlight">${otpCode}</span></td>
        </tr>
        <tr>
          <td class="label">Passes / Seats</td>
          <td class="value" style="font-family: inherit;">${quantity} Pass${quantity > 1 ? 'es' : ''}</td>
        </tr>
        <tr>
          <td class="label">Amount Paid</td>
          <td class="value" style="font-family: inherit; color: #4f46e5;">${amountInr}</td>
        </tr>
        <tr>
          <td class="label">Booking Status</td>
          <td class="value" style="color: #059669; font-family: inherit;">CONFIRMED & ACTIVE</td>
        </tr>
      </table>

      <div class="qr-section">
        <img src="cid:ticket-qr-code" alt="Official Ticket QR Code Pass" />
        <p class="qr-caption">⚡ Present this QR code or 6-Digit OTP at the venue check-in desk</p>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated pass issued by CampusMitra Student Platform Management.</p>
      <p>For inquiries or assistance, contact support@campusmitra.edu or visit the student help desk.</p>
    </div>
  </div>
</body>
</html>
`;

    const mailOptions: SendMailOptions = {
      from: ENV.SMTP_FROM,

      to: toRecipients,
      subject: `🎟️ Entry Pass Confirmed: ${eventTitle} (Pass #${bookingNumber})`,
      html: htmlContent,
      attachments: qrBuffer.length
        ? [
            {
              filename: `ticket-${bookingNumber}.png`,
              content: qrBuffer,
              cid: 'ticket-qr-code',
            },
          ]
        : [],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Ticket confirmation email successfully sent to: ${toRecipients} (MessageId: ${info.messageId})`);
      return info;
    } catch (err: any) {
      console.error('❌ Failed to send ticket confirmation email:', err.message);
      // Non-blocking: Do not crash ticket booking if mail delivery encounters an external network block
      return null;
    }
  }
}

export const emailService = new EmailService();
