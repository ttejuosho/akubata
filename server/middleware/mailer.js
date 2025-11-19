import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const __dirname = path.resolve();

export const sendEmail = async (
  templateName,
  replacements,
  subject,
  recipients
) => {
  try {
    // Load template
    const templatePath = path.join(
      __dirname,
      "emailTemplates",
      `${templateName}.html`
    );
    let emailBody = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders like {{name}} or {{link}}
    for (const [key, value] of Object.entries(replacements)) {
      emailBody = emailBody.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.aol.com",
      port: 587,
      secure: false,
      auth: {
        user: "ttejuosho@aol.com",
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: '"Akubata Stores" <ttejuosho@aol.com>',
      to: recipients,
      subject,
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
