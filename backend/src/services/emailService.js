const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send({ to, subject, html }) {
    if (!process.env.EMAIL_USER) {
      logger.warn('Email not configured — skipping send');
      return;
    }
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'BusTrackPro <no-reply@bustrakpro.com>',
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      logger.error('Email send failed:', err.message);
    }
  }

  async sendBusArrivalAlert({ to, userName, busNumber, stopName, etaMinutes }) {
    await this.send({
      to,
      subject: `🚌 Bus ${busNumber} arriving in ${etaMinutes} min at ${stopName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">BusTrackPro Arrival Alert</h2>
          <p>Hi ${userName},</p>
          <p>
            Your bus <strong>#${busNumber}</strong> is arriving at
            <strong>${stopName}</strong> in approximately
            <strong>${etaMinutes} minute${etaMinutes !== 1 ? 's' : ''}</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Open BusTrackPro to view live tracking.
          </p>
        </div>
      `,
    });
  }
}

module.exports = new EmailService();
