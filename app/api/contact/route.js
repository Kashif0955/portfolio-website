import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSKEY,
  },
  debug: true, // Debugging enabled
});

// HTML Email Template
const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin-left: 0;">
        ${userMessage}
      </blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// Send Email Function
async function sendEmail(payload) {
  const { name, email, message: userMessage } = payload;

  console.log("EMAIL:", process.env.EMAIL_ADDRESS);
  console.log("PASSKEY:", process.env.GMAIL_PASSKEY);

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: process.env.EMAIL_ADDRESS,
    subject: `New Message From ${name}`,
    text: `New message from ${name}\n\nEmail: ${email}\n\nMessage:\n\n${userMessage}`,
    html: generateEmailTemplate(name, email, userMessage),
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error while sending email:", error.message);
    return false;
  }
}

// API Route
export async function POST(request) {
  try {
    const payload = await request.json();
    console.log("Received Payload:", payload);

    // Send Email
    const emailSuccess = await sendEmail(payload);
    console.log("Email Sent Status:", emailSuccess);

    if (emailSuccess) {
      return NextResponse.json(
        { success: true, message: "Email sent successfully!" },
        { status: 200 }
      );
    }

    console.error("❌ Email sending failed");
    return NextResponse.json(
      { success: false, message: "Failed to send email." },
      { status: 500 }
    );
  } catch (error) {
    console.error("🔥 API Error:", error);  // Print full error

    return NextResponse.json(
      { success: false, message: "Server error occurred." },
      { status: 500 }
    );
  }
}

