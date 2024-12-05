import fs from "fs/promises";
import path from "path";
import transporter from "../../config/email.js";

const sendConfirmationEmail = async (email, tokenString) => {
    const htmlFilePath = path.join(
        process.cwd(),
        "src",
        "services",
        "external",
        "confirmation-email.html"
    );
    
    let htmlContent = await fs.readFile(htmlFilePath, "utf-8");

    const url = `${process.env.REACT_URL}/confirm-signup?token=${tokenString}`;
    htmlContent = htmlContent.replace("{{URL}}", url);

    const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: email,
        subject: "Registration Confirmation at Dekan Shop",
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

export default { sendConfirmationEmail };