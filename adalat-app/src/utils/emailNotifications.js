import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────────────────────────────────────
// EMAILJS CONFIGURATION
// To set up:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with these variables:
//    {{to_email}}, {{subject}}, {{user_address}}, {{event_title}}, {{event_body}}, {{cta_url}}
// 4. Add these to your .env file:
//    VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//    VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
//    VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxx
// ─────────────────────────────────────────────────────────────────────────────

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const isConfigured = () => {
  return SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY &&
    SERVICE_ID !== 'YOUR_SERVICE_ID' &&
    TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';
};

/**
 * Core send function
 */
const sendEmail = async ({ toEmail, subject, eventTitle, eventBody, ctaUrl = 'https://aap-ki-adalat.app' }) => {
  if (!isConfigured()) {
    console.warn('[EmailJS] Not configured. Set VITE_EMAILJS_* env variables to enable emails.');
    return;
  }
  if (!toEmail) return;

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        subject,
        event_title: eventTitle,
        event_body: eventBody,
        cta_url: ctaUrl,
        app_name: 'Aap Ki Adalat',
        current_year: new Date().getFullYear(),
      },
      PUBLIC_KEY
    );
    console.log('[EmailJS] Email sent:', subject);
  } catch (err) {
    console.error('[EmailJS] Failed to send email:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification Templates
// ─────────────────────────────────────────────────────────────────────────────

export const notifyEscrowCreated = ({ toEmail, escrowId, partyB, amount }) =>
  sendEmail({
    toEmail,
    subject: `✅ Escrow #${escrowId} Created — Aap Ki Adalat`,
    eventTitle: `Your Escrow Has Been Created`,
    eventBody: `Escrow #${escrowId} has been successfully deployed on Ethereum Sepolia.\n\nCounterparty (Party B): ${partyB}\nAmount Locked: ${amount} ETH\n\nBoth parties must agree to mark the escrow as complete. If a dispute arises, either party can file it directly from the Escrow Panel.`,
    ctaUrl: 'https://aap-ki-adalat.app/disputes',
  });

export const notifyDisputeFiled = ({ toEmail, escrowId, filedBy }) =>
  sendEmail({
    toEmail,
    subject: `⚠️ Dispute Filed on Escrow #${escrowId} — Aap Ki Adalat`,
    eventTitle: `A Dispute Has Been Filed`,
    eventBody: `A dispute has been filed on Escrow #${escrowId} by ${filedBy}.\n\nAction Required: Please log in to the Escrow Panel and upload your evidence. The jury will be convened shortly and will evaluate both sides' submissions before casting their votes.`,
    ctaUrl: 'https://aap-ki-adalat.app/disputes',
  });

export const notifyJurorSelected = ({ toEmail, disputeId, votingDeadline }) =>
  sendEmail({
    toEmail,
    subject: `⚖️ You've Been Selected as a Juror — Case #${disputeId}`,
    eventTitle: `You Are Assigned to Dispute #${disputeId}`,
    eventBody: `You have been randomly selected as a juror for Dispute #${disputeId}.\n\nVoting Deadline: ${votingDeadline}\n\nPlease review the evidence submitted by both parties on the Juror Panel and cast your vote before the deadline. Honest participation earns you ETH rewards. Failure to participate may result in penalties.`,
    ctaUrl: 'https://aap-ki-adalat.app/juror-panel',
  });

export const notifyDisputeResolved = ({ toEmail, disputeId, outcome }) =>
  sendEmail({
    toEmail,
    subject: `🏛️ Dispute #${disputeId} Resolved — Aap Ki Adalat`,
    eventTitle: `Dispute #${disputeId} Has Been Resolved`,
    eventBody: `The jury has reached a verdict on Dispute #${disputeId}.\n\nOutcome: ${outcome}\n\nThe escrow funds have been automatically released to the winning party by the smart contract. Thank you for using Aap Ki Adalat.`,
    ctaUrl: 'https://aap-ki-adalat.app/disputes',
  });

export const notifyEscrowCompleted = ({ toEmail, escrowId }) =>
  sendEmail({
    toEmail,
    subject: `🎉 Escrow #${escrowId} Completed — Aap Ki Adalat`,
    eventTitle: `Escrow Successfully Completed`,
    eventBody: `Both parties have agreed to mark Escrow #${escrowId} as complete. The funds have been released to Party B.\n\nThank you for using Aap Ki Adalat for your agreement.`,
    ctaUrl: 'https://aap-ki-adalat.app/disputes',
  });
