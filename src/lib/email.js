import nodemailer from "nodemailer";

export async function sendEmail({ summary, recipients }) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipients,
    subject: "Meeting Summary",
    text: summary,
  });
}
