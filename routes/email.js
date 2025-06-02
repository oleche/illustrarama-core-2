
const express = require('express');
const router = express.Router();

const formData = require('form-data');
const Mailjet = require('node-mailjet');
const database = require('../config/database');

// Configure MailerSend
const MAILJET_API_KEY = database.mailjet || 'your-mailjet-public-key';
const MAILJET_API_SECRET = database.mailjet_secret || 'your-mailjet-private-key';
const RECIPIENT_EMAIL = 'oleche@geekcowsd.com';

const mailjet = Mailjet.apiConnect(MAILJET_API_KEY, MAILJET_API_SECRET)

const generateContactEmailText = (contactData) => {
  const { name, email, message } = contactData;
  
  return `
    Nuevo mensaje de contacto recibido:

    Nombre: ${name}
    Email: ${email}

    Mensaje:
    ${message}


    Submitted from: Illustrarama
    Timestamp: ${new Date().toLocaleString()}
  `;
}
// Generate contact email template
const generateContactEmailTemplate = (contactData) => {
  const { name, email, message } = contactData;
  
  return `
  
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Nuevo mensaje de contacto recibido</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <h3>Mensaje:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Este mensaje fue enviado desde el formulario de contacto de Illustrarama.</em></p>
      </body>
    </html>
  `;
};

// Send email using MailerSend API
const sendEmail = async (emailData) => {
  const request = mailjet
	.post("send", {'version': 'v3.1'})
	.request({
		"Messages":[
				{
						"From": {
								"Email": emailData.from.email,
								"Name": emailData.from.name
						},
						"To": [
								{
										"Email": emailData.to[0].email
								}
						],
						"Subject": emailData.subject,
						"TextPart": emailData.text,
						"HTMLPart": emailData.html
				}
		]
	});
};

// POST /api/email/contact - Send contact email
router.post('/contact', async (req, res) => {
  try {

    const name = req.body.name || '';
    const email = req.body.email || '';
    const message = req.body.message || '';

    res.setHeader('Content-Type', 'application/json');


    // Validate required fields
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, and message are required'
      });
    }

    // Validate MailerSend API token
    if (!MAILJET_API_KEY || !MAILJET_API_SECRET) {
      console.error('MAILJET_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service is not properly configured'
      });
    }

    // Send email to Oscar
    const contactEmailData = {
      from: {
        email: email,
        name: name
      },
      to: [{
        email: RECIPIENT_EMAIL,
        name: 'Oscar Leche'
      }],
      subject: `New Inquiry from ${name}`,
      html: generateContactEmailTemplate({ name, email, message }),
      text: generateContactEmailText({ name, email, message })
    };

    await sendEmail(contactEmailData);
    console.log('Contact email sent successfully');

    res.json({
      success: true,
      message: 'Emails sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
});

module.exports = router;
