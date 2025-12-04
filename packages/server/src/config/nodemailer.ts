import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  // SMTP_FROM_EMAIL,
  // SMTP_FROM_NAME,
} = process.env;

async function buildTransporter() {
  if (!SMTP_HOST) {
    // No SMTP configured — create an Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Wrap sendMail so we log the preview URL for dev convenience
    const originalSend = t.sendMail.bind(t);
    // @ts-ignore assign
    t.sendMail = async (mailOptions: any) => {
      const info = await originalSend(mailOptions);
      try {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log('[EMAIL PREVIEW]', preview);
      } catch (e) {
        // ignore
      }
      return info;
    };

    console.warn('[nodemailer] No SMTP config found — using Ethereal test account. Emails will not be delivered to real addresses.');
    return t;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

// Export a promise-resolved transporter instance
const transporterPromise = buildTransporter();

export default transporterPromise;