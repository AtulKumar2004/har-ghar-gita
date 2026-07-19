import nodemailer from 'nodemailer';

export const sendRegistrationEmail = async (userEmail: string, userName: string) => {
  // If SMTP is not configured, silently skip or use a fallback mechanism
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Registration email skipped.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this or make it configurable (e.g. host: process.env.SMTP_HOST)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
          color: #374151;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          padding: 40px 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #1f2937;
          font-size: 22px;
          margin-top: 0;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          color: #4b5563;
        }
        .btn-container {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background-color: #f97316;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        }
        .footer {
          background-color: #f3f4f6;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to #HarGharGita</h1>
        </div>
        <div class="content">
          <h2>Hare Krishna, ${userName}! 🙏</h2>
          <p>Thank you for registering on our platform. Your account has been successfully created, and we are thrilled to have you join our community.</p>
          <p>You can now log in, explore various books and their chapters, and participate in tests to check your knowledge.</p>
          
          <div class="btn-container">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Login to Your Account</a>
          </div>
          
          <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>
          <p>Warm regards,<br>The #HarGharGita Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} #HarGharGita. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Har Ghar Gita" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Welcome to Har Ghar Gita! 🙏 Registration Successful",
      html: htmlContent,
    });
    console.log(`Confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export const sendTestSubmittedEmail = async (userEmail: string, userName: string, chapterTitle: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #f97316;">Test Submitted Successfully!</h2>
      <p>Hare Krishna, <strong>${userName}</strong>! 🙏</p>
      <p>We have received your test submission for the chapter: <strong>${chapterTitle}</strong>.</p>
      <p>If your test contained writing questions, our admins will review and grade them shortly. Otherwise, your score is already available in your dashboard!</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Har Ghar Gita" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Test Submitted: ${chapterTitle}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send test submission email:", error);
  }
};

export const sendTestGradedEmail = async (userEmail: string, userName: string, chapterTitle: string, score: number, totalPoints: number) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10b981;">Test Results Ready!</h2>
      <p>Hare Krishna, <strong>${userName}</strong>! 🙏</p>
      <p>Your test for <strong>${chapterTitle}</strong> has been graded.</p>
      <h3 style="font-size: 24px; color: #1f2937;">Your Score: <span style="color: #f97316;">${score} / ${totalPoints}</span></h3>
      <p>You can view the detailed breakdown and download your PDF report from your dashboard.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">View Report</a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Har Ghar Gita" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Test Graded: ${chapterTitle}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending test graded email:", error);
  }
};

export const sendPasswordResetEmail = async (userEmail: string, userName: string, resetUrl: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Password reset email skipped.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #374151; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1f2937; font-size: 22px; margin-top: 0; }
        .content p { font-size: 16px; line-height: 1.6; color: #4b5563; }
        .btn-container { text-align: center; margin: 35px 0; }
        .btn { display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hare Krishna, ${userName}! 🙏</h2>
          <p>We received a request to reset the password for your #HarGharGita account.</p>
          <p>Click the button below to choose a new password. This link is valid for 1 hour.</p>
          
          <div class="btn-container">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">If you did not request a password reset, please ignore this email. Your account is safe.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Har Ghar Gita. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Har Ghar Gita" <noreply@harghargita.com>',
      to: userEmail,
      subject: 'Password Reset Link - Har Ghar Gita',
      html: htmlContent,
    });
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};
