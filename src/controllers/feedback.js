import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { sendEmail } from '../utils/sendMail.js';
import { SMTP } from '../constants/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Read feedback email template
    const templatePath = path.join(
      __dirname,
      '../templates/feedback-email.html'
    );
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Compile template with Handlebars
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      name,
      email,
      subject,
      message,
    });

    // Send email to admin
    await sendEmail({
      from: SMTP.SMTP_FROM,
      to: SMTP.SMTP_FROM, // Send to our own email
      subject: `Feedback: ${subject}`,
      html,
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback sent successfully',
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send feedback',
      error: error.message,
    });
  }
};
