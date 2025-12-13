import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

import config from "../config/index.js";

export const sendEmail = async (
  templateName,
  replacements,
  subject,
  recipients
) => {
  try {
    // Load template
    const templatePath = path.join(
      config.email.templatesDir,
      `${templateName}.html`
    );
    let emailBody = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders like {{name}} or {{link}}
    for (const [key, value] of Object.entries(replacements)) {
      emailBody = emailBody.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: config.email.from,
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
