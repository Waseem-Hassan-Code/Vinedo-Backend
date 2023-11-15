import mongoose from "mongoose";

const userSubscriptionShema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "creatorSubscription",
    required: true,
  },
  expiryDate: { type: Date, default: Date.now() },

  userQuotation: {
    type: Number,
    require: true,
  },

  isSubscribed: { type: Boolean, default: false },
  isRequested: { type: Boolean, default: false },
  isPayable: { type: Boolean, default: true },
});

export const UserSubscriptionModel = mongoose.model(
  "userSubscription",
  userSubscriptionShema
);

export const requestSubscription = (values: Record<string, any>) => {
  new UserSubscriptionModel(values)
    .save()
    .then((subscription) => subscription.toObject());
};

export const checkSubscription = (
  userId: string,
  creatoId: string,
  subscriptionId: string
) => {
  return UserSubscriptionModel.find({
    userId,
    creatoId,
    subscriptionId,
    isSubscribed: true,
  });
};

export const checkSubscriptionRequest = (
  creatoId: string,
  subscriptionId: string
) => {
  return UserSubscriptionModel.find({
    creatoId,
    subscriptionId,
    isRequested: true,
    isSubscribed: false,
  });
};

export const acceptSubscriptionRequest = (
  requestId: string,
  userId: string,
  creatoId: string,
  subscriptionId: string
) => {
  return UserSubscriptionModel.updateOne(
    {
      _id: requestId,
      userId: userId,
      creatorId: creatoId,
      subscriptionId: subscriptionId,
    },
    { $set: { isRequested: false, isSubscribed: true, isPayable: true } },
    { new: true }
  );
};

export const denySubscriptionRequest = (
  requestId: string,
  userId: string,
  creatoId: string,
  subscriptionId: string
) => {
  return UserSubscriptionModel.updateOne(
    {
      _id: requestId,
      userId: userId,
      creatorId: creatoId,
      subscriptionId: subscriptionId,
    },
    { $set: { isRequested: false, isSubscribed: false, isPayable: true } },
    { new: true }
  );
};
//----------------------------------------------------------------------------------------
