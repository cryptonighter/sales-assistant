// pages/api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { to, subject, text, html } = req.body;

    // Check allowed domains
    const allowedDomains = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];
    const toDomain = to.split('@')[1];
    if (allowedDomains.length > 0 && !allowedDomains.includes(toDomain)) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // Create transporter (use SMTP settings from env)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });

    res.status(200).json({ message: 'Email sent', info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}