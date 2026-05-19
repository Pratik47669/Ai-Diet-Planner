import nodemailer from 'nodemailer';
import { logger } from './logger.js';

export const sendEmail = async (options) => {
  try {
    let transporter;

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const hasRealCreds = smtpEmail && smtpPassword && smtpPassword.length >= 14 && !smtpPassword.includes('xxxx');

    if (hasRealCreds) {
      // Use real Gmail App Password if correctly configured
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: smtpEmail, pass: smtpPassword }
      });
    } else {
      // Auto-create Ethereal test account (no config needed!)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      logger.info('📧 Using Ethereal test SMTP — check the preview URL printed after sending');
    }

    const info = await transporter.sendMail({
      from: `NutriPlan AI <${smtpEmail || 'noreply@nutriplanai.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    });

    logger.info(`✅ Email sent to ${options.email}`);

    // Ethereal gives a preview URL — open this in browser to see the email!
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`🔗 OPEN THIS IN BROWSER to see the OTP email: ${previewUrl}`);
    }

  } catch (error) {
    logger.error(`❌ Email failed: ${error.message}`);
    if (error.code === 'EAUTH') {
      logger.error('💡 Gmail auth failed. Generate App Password at: https://myaccount.google.com/apppasswords');
    }
    throw new Error('Email sending failed');
  }
};

