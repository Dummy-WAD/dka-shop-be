import transporter from "../../config/email.js";

const sendConfirmationEmail = async (email, tokenString) => {
    const url = `${process.env.REACT_URL}/confirm-signup?token=${tokenString}`;
    const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: email,
        subject: "Registration Confirmation at Dekan Shop",
        text: `Click the link below to confirm your registration:`,
        html: `<a href="${url}">Confirm register</a>`,
    };
    await transporter.sendMail(mailOptions);
}

export default { sendConfirmationEmail };