import { getResend } from "@/lib/email";

export function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "Welcome to Lexio Underground",
    html: `<p>Hey ${name},</p><p>Welcome to Lexio Underground. Let's level up your language.</p>`,
  });
}

export function sendBadgeEmail(to: string, badgeName: string, badgeDescription: string) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `You earned: ${badgeName}`,
    html: `<p>Congratulations! You earned the <strong>${badgeName}</strong> badge.</p><p>${badgeDescription}</p>`,
  });
}

export function sendStreakAtRiskEmail(to: string, streak: number) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "🔥 Your streak is at risk!",
    html: `<p>Your streak is at ${streak} days. Complete an exercise before midnight (BRT) to keep it going.</p>`,
  });
}

export function sendLevelUpEmail(to: string, level: string) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `You reached ${level}!`,
    html: `<p>Congratulations! You've been placed at CEFR level <strong>${level}</strong>.</p><p>Time to put in the work.</p>`,
  });
}

export function sendAssignmentEmail(to: string, assignmentTitle: string) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `New assignment: ${assignmentTitle}`,
    html: `<p>A new exercise module has been assigned to you: <strong>${assignmentTitle}</strong>.</p><p>Log in to Lexio Underground to get started.</p>`,
  });
}
