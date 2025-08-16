export const runtime = "nodejs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import MarkdownIt from "markdown-it";

export async function POST(req) {
  const { summary, recipients } = await req.json();
  try {
    // Convert Markdown to HTML
  // Use MarkdownIt with default options only (no plugins)
  const md = new MarkdownIt();
  const htmlSummary = md.render(summary);

    // Wrap in professional email template
    const professionalEmailHtml = `
      <p>Hi Team,</p>

      <p>Please find below the summary of our recent meeting:</p>

      ${htmlSummary}

      <p>Kindly review the action items and next steps. Let me know if you have any questions or updates.</p>

      <p>Best regards,<br/>
      Meeting Bot</p>
    `;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Meeting Bot" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject: "Professional Meeting Summary",
      html: professionalEmailHtml, // use the polished HTML
    });

    console.log("Nodemailer info:", info); // log full info object

    return NextResponse.json({ success: true, info });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
