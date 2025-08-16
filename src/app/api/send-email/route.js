export const runtime = "nodejs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { MongoClient } from "mongodb";

export async function POST(req) {
  const { summary, recipients } = await req.json();
  try {
    // Dynamically import markdown-it to avoid isSpace bug
    const MarkdownIt = (await import("markdown-it")).default;
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

    // Configure transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Meeting Bot" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject: "Professional Meeting Summary",
      html: professionalEmailHtml,
    });

    console.log("Nodemailer info:", info);

    // Store HTML version in MongoDB
    try {
      const uri = process.env.MONGODB_URI;
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("AImeet");
      const collection = db.collection("summaries");

      await collection.insertOne({
        summaryHtml: htmlSummary,
        recipients,
        date: new Date(),
      });

      await client.close();
    } catch (dbError) {
      console.error("MongoDB error:", dbError);
    }

    return NextResponse.json({ success: true, info });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
