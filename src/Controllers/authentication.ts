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

    const userToken = createToken(req.body);

    if (userToken) {
      const response = {
        status: 200,
        message: "User login success!",
        result: { userToken },
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
      const response: ResponseDto = {
        status: 400,
        message: "Provide complete information, fill all the fields!",
        result: {},
      };
      return res.json(response);
    }
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      const response: ResponseDto = {
        status: 400,
        message: "User is already registered!",
        result: {},
      };
      return res.json(response);
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
    const response: ResponseDto = {
      status: 200,
      message: "User registered successfully!",
      result: user,
    };
    return res.json(response).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

//--------------------Forget and Update Password---------------
export const forgetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const email = req.body.email;

  if (!email) {
    const response = {
      status: 400,
      message: "Email is required.",
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

    try {
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
        message: "Email sending failed.",
        result: {},
      };
      return res.json(response);
    }
  }
};

export const updatePassword = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    //------------------------------------------------------------------------------------------------------
    const currentTime = new Date().getTime();

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
        status: 400,
        message: "OTP Expired!",
        result: {},
      };
      return res.json(response);
    }

    const storedOTP = otpStorage.get(email);

    if (otp != storedOTP.otp) {
      const response = {
        status: 400,
        message: "Incorrect OTP",
        result: {},
      };
      return res.json(response);
    }
    if (otp === storedOTP.otp) {
      if (password != confirmPassword) {
        const response = {
          status: 400,
          message: "Password and confirm password should be same",
          result: {},
        };
        return res.json(response);
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
      } else {
        const response = {
          status: 400,
          message: "Failed to update, try again.",
          result: {},
        };
        return res.json(response);
      }
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
