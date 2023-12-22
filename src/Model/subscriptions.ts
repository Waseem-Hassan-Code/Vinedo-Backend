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
    require: false,
  },

  isSubscribed: { type: Boolean, default: false },
  isRequested: { type: Boolean, default: false },
  isPayable: { type: Boolean, default: true },
});

export const UserSubscriptionModel = mongoose.model(
  "userSubscription",
  userSubscriptionShema
);

export const subscriptionsCount = async (creatorId: string) => {
  return await UserSubscriptionModel.countDocuments({
    creatorId: creatorId,
    isSubscribed: true,
    isPayable: false,
  });
};

export const checkUserSubscription = async (
  userId: string,
  creatorId: string
) => {
  return await UserSubscriptionModel.findOne({
    userId: userId,
    creatorId: creatorId,
    isSubscribed: true,
    isRequested: false,
    isPayable: false,
  });
};

export const getUserSubscriptions = async (userId: string) => {
  return await UserSubscriptionModel.find({
    userId: userId,
    isSubscribed: true,
    isRequested: false,
    isPayable: false,
  });
};

export const getAcceptedRequest = async (
  requestId: string,
  userId: string,
  creatorId: string,
  subscriptionId: string
) => {
  return await UserSubscriptionModel.findOne({
    _id: requestId,
    userId: userId,
    creatorId: creatorId,
    subscriptionId: subscriptionId,
    isRequested: false,
    isSubscribed: true,
    isPayable: true,
  });
};

export const getAllAcceptedRequest = async (userId: string) => {
  return await UserSubscriptionModel.find({
    userId: userId,
    isRequested: false,
    isSubscribed: true,
    isPayable: true,
  });
};

export const getAllUserRequests = async (creatorId: string) => {
  return await UserSubscriptionModel.find({
    creatorId: creatorId,
    isRequested: true,
    isSubscribed: false,
    isPayable: true,
  });
};

export const updateSubscription = async (
  userId: string,
  creatorId: string,
  subscriptionId: string
) => {
  const result = await UserSubscriptionModel.updateOne(
    { userId, creatorId, subscriptionId },
    { $set: { isSubscribed: false, isPayable: true, userQuotation: 0 } }
  );
  if (result.modifiedCount > 0) {
    return true;
  }
  return false;
};

export const requestSubscription = (values: Record<string, any>) => {
  return new UserSubscriptionModel(values)
    .save()
    .then((subscription) => subscription.toObject());
};

export const getSubscriptionDetails = (
  userId: string,
  creatoId: string,
  subscriptionId: string
) => {
  return UserSubscriptionModel.findOne({
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
