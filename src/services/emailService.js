const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('../config/aws');

const createTemplate = (title, body, link, buttonText) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; margin-top: 0; font-size: 24px; }
    p { color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .btn { display: inline-block; background-color: #4F46E5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }
    .btn:hover { background-color: #4338ca; }
    .link-text { font-size: 12px; color: #999; margin-top: 30px; word-break: break-all; }
    .footer { margin-top: 40px; font-size: 12px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${body}</p>
    <div style="text-align: center;">
      <a href="${link}" class="btn">${buttonText}</a>
    </div>
    <p class="link-text">If the button doesn't work, copy this link:<br>${link}</p>
    <div class="footer">&copy; ${new Date().getFullYear()} Secure Cloud App. All rights reserved.</div>
  </div>
</body>
</html>
`;

class EmailService {
  static async sendEmail(toAddress, subject, htmlContent) {
    const params = {
      Destination: { ToAddresses: [toAddress] },
      Message: {
        Body: { Html: { Data: htmlContent } },
        Subject: { Data: subject },
      },
      Source: process.env.AWS_SES_SENDER_EMAIL,
    };
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
  }

  static async sendActivationEmail(email, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendUrl}/activate/${token}`;
    const html = createTemplate(
      'Activate Your Account',
      'Welcome! We are excited to have you on board. Please confirm your email address to get started.',
      link,
      'Activate Account'
    );
    await this.sendEmail(email, 'Welcome! Activate your account', html);
  }

  static async sendPasswordResetEmail(email, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendUrl}/reset-password/${token}`;
    const html = createTemplate(
      'Reset Your Password',
      'We received a request to reset your password. If you didn\'t ask for this, you can safely ignore this email.',
      link,
      'Reset Password'
    );
    await this.sendEmail(email, 'Password Reset Request', html);
  }
}

module.exports = EmailService;