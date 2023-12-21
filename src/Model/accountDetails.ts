import mongoose from "mongoose";

const userSubscriptionShema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  payPalEmail: { type: String, default: true },
});

export const creatorAccountDetails = mongoose.model(
  "accountDetails",
  userSubscriptionShema
);
