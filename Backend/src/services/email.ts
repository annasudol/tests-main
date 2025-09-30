import nodemailer from "nodemailer";
export const sendEmail = async (dest: string, subject: string, message: string) => {
  try {
    // Validate recipient email
    if (!dest || dest.trim() === "" || !dest.includes("@")) {
      console.error("Invalid recipient email address:", dest);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "trainingsytem11@gmail.com"
        //    process.env.SENDEREMAIL
        , // generated ethereal user
        pass: 'stqmwejhkhufabpw'
        //   process.env.SENDEPASS
        , // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    //   const mailOptions = {
    //             from: auth.user,
    //             to: email,
    //             subject: subject,
    //             text: text
    //         };
    //         transporter.sendMail(mailOptions, function (error, info) {
    //             if (error) {
    //                 console.log(error);
    //             } else {
    //                 console.log('Email sent: ' + info.response);
    //             }

    let info = await transporter.sendMail({
      from: "trainingsytem11@gmail.com",
      to: dest, // list of receivers
      subject: subject, // Subject line
      text: message,
    });
    console.log("Email sent successfully:", info.messageId);
  }
  catch (err) {
    console.error("Failed to send email:", err)
  }
}
export default { sendEmail }; 