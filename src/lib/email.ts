import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

export interface EventSummary {
  eventId: string;
  title: string;
  eventDate: string;
  hostName: string;
  hostEmail: string;
  totalGuests: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  groups?: Array<{
    name: string;
    guests: number;
    confirmed: number;
  }>;
  awards?: Array<{
    title: string;
    winner: string;
    votes: number;
  }>;
}

export const sendEventSummaryEmail = async (summary: EventSummary) => {
  try {
    const emailHtml = generateEventSummaryHTML(summary);
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@yeahnah.com',
      to: summary.hostEmail,
      subject: `Event Summary: ${summary.title}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('Event summary email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending event summary email:', error);
    return false;
  }
};

const generateEventSummaryHTML = (summary: EventSummary): string => {
  const eventDate = new Date(summary.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Summary - ${summary.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        .event-title {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        .event-date {
          font-size: 16px;
          color: #666;
          background: #f8f9fa;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .stat-card {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        .group-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .award-item {
          background: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #ffc107;
        }
        .winner {
          font-weight: bold;
          color: #856404;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #666;
          font-size: 14px;
        }
        .highlight {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📅 Yeahnah</div>
          <h1 class="event-title">${summary.title}</h1>
          <div class="event-date">${eventDate}</div>
        </div>

        <div class="highlight">
          <h2 style="margin: 0 0 10px 0;">Event Summary</h2>
          <p style="margin: 0;">Thank you for using Yeahnah for your event!</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${summary.totalGuests}</div>
            <div class="stat-label">Total Guests</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" style="color: #28a745;">${summary.confirmedGuests}</div>
            <div class="stat-label">Confirmed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" style="color: #dc3545;">${summary.declinedGuests}</div>
            <div class="stat-label">Declined</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" style="color: #ffc107;">${summary.pendingGuests}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>

        ${summary.groups && summary.groups.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Group Breakdown</h2>
            ${summary.groups.map(group => `
              <div class="group-item">
                <strong>${group.name}</strong><br>
                <span style="color: #666;">${group.confirmed} of ${group.guests} guests confirmed</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${summary.awards && summary.awards.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Award Winners</h2>
            ${summary.awards.map(award => `
              <div class="award-item">
                <strong>${award.title}</strong><br>
                <span class="winner">🏆 ${award.winner}</span> (${award.votes} votes)
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="section">
          <div class="highlight">
            <h3 style="margin: 0 0 10px 0;">Event Data Cleanup</h3>
            <p style="margin: 0; font-size: 14px;">
              Your event data has been automatically archived and removed from our active database 
              to make space for new events. Thank you for using Yeahnah!
            </p>
          </div>
        </div>

        <div class="footer">
          <p>Powered by Yeahnah - RSVP Management Platform</p>
          <p>This email was automatically generated after your event completion.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
