import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    validate: {
      validator: async function (_id: string) {
        const user = await mongoose.model("user").findById(_id);
        return user && user.isContentCreator === true;
      },
      message: "The specified user must be a content creator.",
    },
  },

  subscriptionPrice: {
    type: Number,
    required: true,
  },
  payPalEmail: { type: String, required: true },
});

export const creatorSubscriptionModel = mongoose.model(
  "creatorSubscriptionDetails",
  SubscriptionSchema
);

//------------------------------------------------------------------------

export const getCreatorSubscriptionDetails = (creatorId: string) => {
  return creatorSubscriptionModel.findOne({ creatorId: creatorId });
};

export const setCreatorSubscriptionDetails = async (
  values: Record<string, any>
) => {
  const check = await creatorSubscriptionModel.findOne({
    creatorId: values.creatorId,
  });

  if (check) {
    const updateDoc = {
      $set: {
        subscriptionPrice: values.subscriptionPrice,
        payPalEmail: values.payPalEmail,
      },
    };

    await creatorSubscriptionModel.updateOne(
      { creatorId: values.creatorId },
      updateDoc
    );
    return updateDoc;
  } else {
    return creatorSubscriptionModel
      .create(values)
      .then((subscription) => subscription.toObject())
      .catch((error) => {
        throw error;
      });
  }
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
