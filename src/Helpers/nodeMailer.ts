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
): Promise<boolean> => {
  const mailOptions = {
    from: "bman88873@gmail.com",
    to,
    subject,
    text,
  };

  return new Promise((resolve) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
