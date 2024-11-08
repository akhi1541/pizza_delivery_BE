const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transpoter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PASS,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });
  
  const mailOptions = {
    from: 'Pizza delivery <akhisai4322@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    
  };
  await transpoter.sendMail(mailOptions);
};

module.exports = sendEmail;
