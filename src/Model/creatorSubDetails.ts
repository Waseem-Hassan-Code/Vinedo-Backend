import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  creatoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    validate: {
      validator: async function (creatoId: string) {
        const user = await mongoose.model("user").findById(creatoId);
        return user && user.isContentCreator === true;
      },
      message: "The specified user must be a content creator.",
    },
  },
  subscriptionPrice: {
    type: Number,
    required: true,
  },
});

export const creatorSubscriptionModel = mongoose.model(
  "creatorSubscription",
  SubscriptionSchema
);

//------------------------------------------------------------------------

export const getCreatorSubscriptionDetails = (creatorId: string) => {
  return creatorSubscriptionModel.findOne({ creatorId: creatorId });
};

export const setCreatorSubscriptionDetails = (values: Record<string, any>) => {
  return new creatorSubscriptionModel(values)
    .save()
    .then((subscription) => subscription.toObject());
};

export const upDateSubscriptionDetails = (
  creatorId: string,
  subscriptionPrice: number
) => {
  return creatorSubscriptionModel.updateOne(
    { creatoId: creatorId },
    { $set: { subscriptionPrice: subscriptionPrice } },
    { new: true }
  );
};
