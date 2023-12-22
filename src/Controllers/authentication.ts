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
        status: 400,
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
        status: 400,
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
      .select("_id email isContentCreator phoneNumber location dateOfBirth")
      .lean();
    const userToken = createToken(userClaims);

    if (userToken) {
      const response = {
        status: 200,
        message: "User login success!",
        result: userToken,
      };
      return res.status(200).json(response);
    } else {
      const response = {
        status: 500,
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
      return res.status(400).json(response); // Sending status code 400 with JSON response
    }

    const verifyEmail = await sendEmail(
      email,
      "Vinedo Team",
      "We have successfully created your account."
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
      return res.status(409).json(response); // Sending status code 409 with JSON response
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
    return res.json(response); // Sending status code 200 with JSON response
  } catch (error) {
    console.log(error);
    return res.sendStatus(500); // Sending status code 500 for server error
  }
};

//--------------------Forget and Update Password---------------
export const forgetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const email = req.body.email;
  console.log(email, "email");

  if (!email) {
    const response = {
      message: "Email is required.",
      result: {},
    };
    return res.status(400).json(response);
  }

  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      const response = {
        status: 404, // Change the status code to 404 for "Not Found"
        message: "Email address not found!",
        result: {},
      };
      return res.status(404).json(response);
    }

    const otp = generateOTP();
    // const expirationTime = /* Set your expiration time for OTP */

    await sendEmail(email, "OTP for Password Reset", `Your OTP is: ${otp}`);
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
      message: "Error occurred while processing the request.",
      result: {},
    };
    return res.status(500).json(response);
  }
};

//------------------------------------------------------------------------------------------------------
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

    if (expirationTime < currentTime) {
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
        status: 200,
        message: "Success",
        result: {},
      };
      return res.json(response);
    } else {
      const response = {
        status: 400,
        message: "Failed to update, try again.",
        result: {},
      };
      return res.json(response);
    }
  } catch {
    const response = {
      status: 500,
      message: "Internal server error",
      result: {},
    };
    return res.json(response);
  }
};
//=====================================UPDATE-PASSWORD=========================================

export const updatePassword = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const currentTime = new Date().getTime();

    if (!email || !password || confirmPassword) {
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

export const registerCreator = async (
  req: express.Request,
  res: express.Response
) => {
  console.log("Hello");
  res.render("../ejs/registerCreator.ejs");
};
