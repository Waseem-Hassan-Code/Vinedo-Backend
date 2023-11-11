import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "bman88873@gmail.com",
    pass: "ijmu ljsi jokh fble",
  },
});

export const sendEmail = (
  to: string,
  subject: string,
  text: string
): Promise<any> => {
  const mailOptions = {
    from: "bman88873@gmail.com",
    to,
    subject,
    text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        reject(error);
      } else {
        console.log("Email sent: ", info.response);
        resolve(info);
      }
    });
  });
};
