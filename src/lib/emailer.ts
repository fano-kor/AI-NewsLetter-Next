import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, content: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: content,
  };
  //console.log('## transporter', transporter);
  await transporter.sendMail(mailOptions);
}

