const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('../config/aws');

const BRAND_LOGO = 'https://cloud-web-drive.web.app/favicon.png';

const createTemplate = ({ title, greeting, body, link, buttonText }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      padding: 40px 16px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    }
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
      text-align: center;
    }
    .logo img {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .logo span {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.4px;
    }
    h1 {
      font-size: 24px;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    p {
      font-size: 15px;
      color: #475569;
      line-height: 1.7;
      margin: 0 0 24px 0;
    }
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);
    }
    .link {
      font-size: 12px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 24px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <img src="${BRAND_LOGO}" alt="Cloud Web Drive logo" />
        <span>Cloud Web Drive</span>
      </div>

      <h1>${title}</h1>
      <p>${greeting}</p>
      <p>${body}</p>

      <div class="button-wrapper">
        <a href="${link}" class="btn">${buttonText}</a>
      </div>

      <p class="link">If the button doesn’t work, copy and paste this link into your browser:<br />${link}</p>

      <div class="footer">
        © ${new Date().getFullYear()} Cloud Web Drive · Secure Cloud Storage
      </div>
    </div>
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

  static async sendActivationEmail(email, token, firstName = 'there') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendUrl}/activate/${token}`;

    const html = createTemplate({
      title: 'Activate your Cloud Web Drive account',
      greeting: `Hi ${firstName},`,
      body: 'Welcome to Cloud Web Drive! Click the button below to verify your email address and unlock your secure cloud storage.',
      link,
      buttonText: 'Activate Account'
    });

    await this.sendEmail(email, 'Activate your Cloud Web Drive account', html);
  }

  static async sendPasswordResetEmail(email, token, firstName = 'there') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendUrl}/reset-password/${token}`;

    const html = createTemplate({
      title: 'Reset your password',
      greeting: `Hi ${firstName},`,
      body: 'We received a request to reset your Cloud Web Drive password. If this wasn’t you, you can safely ignore this email.',
      link,
      buttonText: 'Reset Password'
    });

    await this.sendEmail(email, 'Reset your Cloud Web Drive password', html);
  }
}

module.exports = EmailService;