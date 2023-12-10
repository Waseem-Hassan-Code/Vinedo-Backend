import { getCreatorSubscriptionDetails } from "../Model/creatorSubDetails";
import {
  requestSubscription,
  getSubscriptionDetails,
  updateSubscription,
  getAcceptedRequest,
} from "../Model/subscriptions";
import {
  alreadySubscribed,
  notSubscribed,
  removedFromSubscription,
} from "./constants";

//==========================================Normal Subscription=======================================
export const subscribed = async (
  userId: string,
  creatorId: string,
  subscriptionId: string
) => {
  const subscriptionDetails = await getCreatorSubscriptionDetails(creatorId);
  const checkCurrentSubscription = await checkExistingSubscription(
    userId,
    creatorId,
    subscriptionId
  );

  switch (checkCurrentSubscription) {
    case alreadySubscribed:
      return false;
    case notSubscribed:
      //Integrate Paypal here
      if (subscriptionDetails.subscriptionPrice) {
        if (await newSubscription(userId, creatorId, subscriptionId)) {
          return true;
        }
      }
    default:
      return false;
  }
};
//==========================================Custom Subscription==================================

export const customSubscribed = async (
  requestId: string,
  userId: string,
  creatorId: string,
  subscriptionId: string
) => {
  const requestStatus = await getAcceptedRequest(
    requestId,
    userId,
    creatorId,
    subscriptionId
  );
  const checkCurrentSubscription = await checkExistingSubscription(
    userId,
    creatorId,
    subscriptionId
  );

  switch (checkCurrentSubscription) {
    case alreadySubscribed:
      return false;
    case notSubscribed:
      if (requestStatus.userQuotation) {
        //Integrate Paypal here
        if (await newSubscription(userId, creatorId, subscriptionId)) {
          return true;
        }
      }
    default:
      return false;
  }
};

//===============================================================================================
async function newSubscription(
  userId: string,
  creatorId: string,
  subscriptionId: string
) {
  const expiryDate = calculateExpiryDate();
  const subscriptionValues = {
    userId: userId,
    creatorId: creatorId,
    subscriptionId: subscriptionId,
    expiryDate: expiryDate,
    isSubscribed: true,
    isPayable: false,
  };
  const res = await requestSubscription(subscriptionValues);
  if (res) {
    return true;
  }
  return false;
}

//===============================================================================================
export const checkExistingSubscription = async (
  userId: string,
  creatorId: string,
  subscriptionId: string
) => {
  const Subscribed = await getSubscriptionDetails(
    userId,
    creatorId,
    subscriptionId
  );
  const currentDate = new Date();
  if (Subscribed) {
    if (Subscribed.expiryDate >= currentDate) {
      const updateValues = await updateSubscription(
        userId,
        creatorId,
        subscriptionId
      );
      if (updateValues) {
        return removedFromSubscription;
      }
    }
    return alreadySubscribed;
  }
  return notSubscribed;
};

//===============================================================================================
function calculateExpiryDate() {
  const currentDate = new Date();
  const futureDate = new Date(currentDate);
  futureDate.setDate(currentDate.getDate() + 31);

  const formattedDate = `${futureDate.getFullYear()}-${(
    futureDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${futureDate.getDate().toString().padStart(2, "0")}`;

  return formattedDate;
}
