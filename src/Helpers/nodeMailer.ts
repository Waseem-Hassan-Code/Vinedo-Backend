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
    html: generateEmailBody("Vinedo", text),
  };

  return new Promise((resolve) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        resolve(false);
      } else {
        if (info.response.includes("OK") || info.response.includes("queued")) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
};

const generateEmailBody = (appName: string, message: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }

      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #000000; /* Black color */
        font-weight: 900; /* Maximum font weight */
      }

      p {
        color: #666666;
      }

      .logo {
        display: block;
        margin: 20px auto;
      }

      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="path/to/your-logo.png" alt="${appName} Logo" class="logo">
      <h1>Welcome to ${appName}!</h1>
      <p>${message}</p>
      <p>If you have any questions or need assistance, don't hesitate to reach out.</p>
      <p>Best regards,<br/>The ${appName} Team</p>
    </div>
  </body>
  </html>
`;
