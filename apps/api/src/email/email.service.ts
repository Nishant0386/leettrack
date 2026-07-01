// apps/api/src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
    this.from = config.get('EMAIL_FROM', 'noreply@leettrack.dev');
  }

  private wrapHtml(content: string, subject: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0e8de7, #6366f1); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
    .body { padding: 32px; color: #1e293b; }
    .footer { padding: 24px 32px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; background: #0e8de7; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 LeetTrack</h1>
      <p>${subject}</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>LeetTrack — AI-Powered DSA Classroom Analytics</p>
      <p>You're receiving this because you're enrolled in a LeetTrack class.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendEmail(to: string | string[], subject: string, htmlContent: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: this.wrapHtml(htmlContent, subject),
      });

      if (error) throw new Error(error.message);
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return data;
    } catch (err) {
      this.logger.error(`Email failed: ${err.message}`);
      throw err;
    }
  }

  async sendClassAnnouncement(studentEmails: string[], className: string, announcement: string) {
    return this.sendEmail(
      studentEmails,
      `📢 New Announcement — ${className}`,
      `<h2>Class Announcement</h2><p>${announcement}</p>`,
    );
  }

  async sendAssignmentReminder(studentEmail: string, assignmentTitle: string, dueDate: Date) {
    return this.sendEmail(
      studentEmail,
      `⏰ Assignment Due Soon — ${assignmentTitle}`,
      `<h2>Reminder: Assignment Due</h2>
       <p>Your assignment <strong>${assignmentTitle}</strong> is due on <strong>${dueDate.toLocaleDateString()}</strong>.</p>
       <a href="${process.env.FRONTEND_URL}/student/assignments" class="btn">View Assignment →</a>`,
    );
  }

  async sendLiveClassNotification(studentEmails: string[], className: string, scheduledAt: Date, meetingUrl: string) {
    return this.sendEmail(
      studentEmails,
      `🎥 Live Class Starting — ${className}`,
      `<h2>Live Class Alert</h2>
       <p>Your class <strong>${className}</strong> starts at <strong>${scheduledAt.toLocaleTimeString()}</strong>.</p>
       <a href="${meetingUrl}" class="btn">Join Now →</a>`,
    );
  }

  async sendPerformanceReport(studentEmail: string, studentName: string, report: any) {
    return this.sendEmail(
      studentEmail,
      `📈 Your Weekly Performance Report`,
      `<h2>Hi ${studentName}!</h2>
       <p>Here's your performance summary:</p>
       <ul>
         <li>Total Problems Solved: <strong>${report.totalSolved}</strong></li>
         <li>Weekly Growth: <strong>+${report.weeklyGrowth}</strong></li>
         <li>Attendance: <strong>${report.attendance}%</strong></li>
         <li>Performance Score: <strong>${report.score}/100</strong></li>
       </ul>
       <a href="${process.env.FRONTEND_URL}/student/dashboard" class="btn">View Full Report →</a>`,
    );
  }

  async sendBulkEmail(recipients: { email: string; name: string }[], subject: string, content: string) {
    // Send in batches of 50 to avoid rate limits
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const emails = batch.map((r) => r.email);
      results.push(await this.sendEmail(emails, subject, content));
      if (i + batchSize < recipients.length) {
        await new Promise((res) => setTimeout(res, 1000)); // 1s delay between batches
      }
    }

    return results;
  }
}
