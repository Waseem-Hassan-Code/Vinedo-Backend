import {
  authentication,
  generateOTP,
  random,
  otpStorage,
  expirationTime,
} from "../Helpers";
import {
  createUser,
  getUserByEmail,
  updateUserInfo,
  updateUserPassword,
  UserModel,
} from "../Model/users";
import express, { response } from "express";
import { ResponseDto } from "Model/response";
import { json } from "body-parser";
import { createToken } from "../Helpers/jwtTokens";
import { sendEmail } from "../Helpers/nodeMailer";

//-----------------------User login------------------
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim()) {
      const response = {
        message: "Provide email and password.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) {
      const response = {
        message: "User not found.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const userObj = user.toObject();
    const expectedHash = authentication(userObj.authentication.salt, password);

    if (userObj.authentication.password !== expectedHash) {
      const response = {
        status: 403,
        message: "Incorrect Password.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const userClaims = await getUserByEmail(email)
      .select(
        "_id email name isContentCreator phoneNumber location dateOfBirth bio createdAt"
      )
      .lean();
    const userToken = createToken(userClaims);

    if (userToken) {
      const response = {
        status: 200,
        message: "User login success!",
        userToken: userToken,
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Cannot fulfill the request right now.",
        result: {},
      };
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//--------------------Register new user---------------
export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { name, password, email, dateOfBirth, phoneNumber, location } =
      req.body;
    if (
      !name.trim() ||
      !password.trim() ||
      !email.trim() ||
      !dateOfBirth.trim() ||
      !phoneNumber.trim() ||
      !location.trim()
    ) {
      const response = {
        message: "Provide complete information, fill all the fields!",
        result: {},
      };
      return res.status(400).json(response);
    }

    const verifyEmail = await sendEmail(
      email,
      "Vinedo Team",
      "Thank you for joining us. We're excited to have you on board. Feel free to explore and make the most of our app features."
    );

    if (!verifyEmail) {
      const response = {
        message: "This email does not exists.",
        result: {},
      };
      return res.status(404).json(response);
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      const response = {
        message: "User is already registered!",
        result: {},
      };
      return res.status(409).json(response);
    }

    const salt = random();
    const user = await createUser({
      name,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
      email,
      dateOfBirth,
      phoneNumber,
      location,
    });

    const response = {
      status: 200,
      message: "User registered successfully!",
      result: user,
    };
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

//----------------------------Forget and Update Password--------------------------
export const forgetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const email = req.body.email;

  if (!email) {
    const response = {
      message: "Email is required.",
      result: {},
    };
    return res.status(400).json(response);
  }

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    const response = {
      message: "Email address not found!",
      result: {},
    };
    return res.status(400).json(response);
  }

  const user = await getUserByEmail(email);

  if (!user) {
    const response = {
      status: 400,
      message: "User not found.",
      result: {},
    };
    return res.status(400).json(response);
  } else {
    const otp = generateOTP();

    const message = `We're pleased to inform you that a 6-digit One-Time Password (OTP) 
    has been successfully generated and sent to your registered email address.
     This OTP ${otp} is an additional layer of security to ensure the protection of your account.`;

    try {
      await sendEmail(email, "OTP for Password Reset", message);

      const expirationTime = new Date().getTime() + 5 * 60 * 1000;

      otpStorage.set(email, { otp, expirationTime });

      const response = {
        status: 200,
        message: "OTP sent successfully.",
        result: { otp },
      };
      return res.status(200).json(response);
    } catch (error) {
      const response = {
        status: 500,
        message: "Email sending failed.",
        result: {},
      };
      return res.json(response);
    }
  }
};

//-----------------------------------------------Verify OTP-----------------------------------------------
export const verifyOTP = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, otp } = req.body;
    const currentTime = new Date().getTime();

    if (!email || !otp) {
      const response = {
        message: "OTP or Email address is missing.",
        result: {},
      };
      return res.status(400).json(response);
    }

    // const date = new Date(currentTime);
    // const CurrTime =
    //   date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    // const expTime = new Date(expirationTime);
    // const expiTime =
    //   expTime.getHours() +
    //   ":" +
    //   expTime.getMinutes() +
    //   ":" +
    //   expTime.getSeconds();
    // console.log("Current Time:", CurrTime);
    // console.log("Expiration Time:", expiTime);

    const storedOtp = otpStorage.get(email);
    if (!storedOtp || storedOtp.expirationTime < currentTime) {
      const response = {
        message: "OTP Expired!",
        result: {},
      };
      return res.status(401).json(response);
    }

    const storedOTP = otpStorage.get(email);

    if (otp != storedOTP.otp) {
      const response = {
        message: "Incorrect OTP",
        result: {},
      };
      return res.status(403).json(response);
    }
    if (otp === storedOTP.otp) {
      const response = {
        message: "Enter a new password",
        result: {},
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Failed to update, try again.",
        result: {},
      };
      return res.status(400).json(response);
    }
  } catch {
    const response = {
      message: "Internal server error",
      result: {},
    };
    return res.status(500).json(response);
  }
};
//=====================================UPDATE-PASSWORD=========================================

export const updatePassword = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      const response = {
        message: "Passwords or Email address is missing.",
        result: {},
      };
      return res.status(400).json(response);
    }
    if (password != confirmPassword) {
      const response = {
        message: "Password and Confirm Password are not same.",
        result: {},
      };
      return res.status(401).json(response);
    }
    const salt = random();
    const newPassword = authentication(salt, password);
    const update = updateUserPassword(email, newPassword, salt);
    const newHahsedPass = await update.exec();
    if (newHahsedPass) {
      const response = {
        status: 200,
        message: "Password updated successfully!",
        result: {},
      };
      return res.json(response);
    }
  } catch {
    const response = {
      message: "Internal server error.",
      result: {},
    };
    return res.status(500).json(response);
  }
};
// ================================getUser Personal Info==================================

export const getPersonalInfo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      const response = {
        message: "UserId is required.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const getInfo = await UserModel.findById(userId)
      .select("name location dateOfBirth bio createdAt")
      .lean();

    if (getInfo) {
      const response = {
        message: "User Info Updated.",
        result: getInfo,
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Unable to update at the moment.",
        result: {},
      };
      return res.status(401).json(response);
    }
  } catch {
    const response = {
      message: "Internal server error.",
      result: {},
    };
    return res.status(500).json(response);
  }
};

//=====================================UPDATE-PERSONAL INFO=========================================

export const userPersonalInfo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, name, location, bio } = req.body;

    if (!userId) {
      const response = {
        message: "UserId is required.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const updateInfo = await updateUserInfo(userId, name, location, bio);

    const getInfo = await UserModel.findById(userId)
      .select("name location dateOfBirth bio createdAt")
      .lean();

    if (updateInfo) {
      const response = {
        message: "User Info Updated.",
        result: getInfo,
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Unable to update at the moment.",
        result: {},
      };
      return res.status(401).json(response);
    }
  } catch {
    const response = {
      message: "Internal server error.",
      result: {},
    };
    return res.status(500).json(response);
  }
};

//=====================================UPDATE-PERSONAL INFO=========================================
export const registerCreator = async (
  req: express.Request,
  res: express.Response
) => {
  console.log("Hello");
  res.render("../ejs/registerCreator.ejs");
};
