const dns = require("dns").promises;
const validator = require("validator");
const nodemailer = require("nodemailer");

// 1. Transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

exports.verifyEmail = async (email) => {
  if (!validator.isEmail(email)) {
    return { success: false, message: "Invalid email format." };
  }

  const domain = email.split("@")[1];

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { success: false, message: "Email domain is unreachable." };
    }
    return {
      success: true,
      message: "Email is valid and domain is reachable.",
    };
  } catch (error) {
    return { success: false, message: "Domain lookup failed." };
  }
};

exports.sendEmail = async (email, message, subject = "Message from App") => {
  const mailOptions = {
    from: `"App Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return { success: false, message: "Failed to send email." };
  }
};
