const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendStatusEmail = async (candidateEmail, candidateName, status) => {
  const messages = {
    Shortlisted: `Congratulations ${candidateName}! You have been shortlisted for the next round.`,
    Interviewed: `Dear ${candidateName}, your interview has been scheduled. We will contact you shortly.`,
    Hired: `Congratulations ${candidateName}! We are pleased to offer you the position. Welcome to the team!`,
    Rejected: `Dear ${candidateName}, thank you for applying. After careful consideration, we have decided to move forward with other candidates.`,
  }

  const message = messages[status]
  if (!message) return

  return resend.emails.send({
    from: 'HR Dashboard <onboarding@resend.dev>',
    to: candidateEmail,
    subject: `Application Update — ${status}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1f2937">HR Dashboard</h2>
        <p style="color:#4b5563;line-height:1.6">${message}</p>
        <p style="color:#9ca3af;font-size:13px;margin-top:24px">This is an automated message from HR Dashboard.</p>
      </div>
    `
  })
}

const sendInterviewEmail = async (candidateEmail, candidateName, date, time, mode, interviewer) => {
  return resend.emails.send({
    from: 'HR Dashboard <onboarding@resend.dev>',
    to: candidateEmail,
    subject: `Interview Scheduled — ${date} at ${time}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1f2937">Interview Scheduled</h2>
        <p style="color:#4b5563;line-height:1.6">Dear <strong>${candidateName}</strong>,</p>
        <p style="color:#4b5563;line-height:1.6">Your interview has been scheduled. Here are the details:</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
          <table style="width:100%;font-size:14px;color:#374151">
            <tr><td style="padding:6px 0;color:#6b7280;width:120px">Date</td><td style="padding:6px 0;font-weight:600">${date}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Time</td><td style="padding:6px 0;font-weight:600">${time}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Mode</td><td style="padding:6px 0;font-weight:600">${mode}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Interviewer</td><td style="padding:6px 0;font-weight:600">${interviewer}</td></tr>
          </table>
        </div>
        <p style="color:#4b5563;line-height:1.6">Please be available on time. Good luck!</p>
        <p style="color:#9ca3af;font-size:13px;margin-top:24px">This is an automated message from HR Dashboard.</p>
      </div>
    `
  })
}

module.exports = { sendStatusEmail, sendInterviewEmail }