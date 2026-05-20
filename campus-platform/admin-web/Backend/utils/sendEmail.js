const nodemailer = require("nodemailer");

let transporterPromise = null;

const createTransporter = async () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const hasSmtpConfig = Boolean(emailUser && emailPass);

  if (!hasSmtpConfig && process.env.EMAIL_TEST_MODE !== "true") {
    throw new Error(
      "Email SMTP is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS, or enable EMAIL_TEST_MODE=true for an Ethereal preview account.",
    );
  }

  if (hasSmtpConfig) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    const secure =
      typeof process.env.EMAIL_SECURE === "string"
        ? process.env.EMAIL_SECURE === "true"
        : port === 465;

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port,
      secure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }

  return transporterPromise;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      "Campus Platform <no-reply@campus-platform.local>",
    to,
    subject,
    html,
    text,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log(`📧 Email preview: ${previewUrl}`);
  }

  console.log(`📨 Email sent to ${to} (${info.messageId})`);

  return {
    messageId: info.messageId,
    previewUrl,
  };
};

module.exports = sendEmail;
