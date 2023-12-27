import {
  requestSubscription,
  updateSubscription,
  getAcceptedRequest,
  checkUserRecord,
} from "../Model/subscriptions";
import {
  alreadySubscribed,
  notSubscribed,
  removedFromSubscription,
} from "./constants";
import { initiatePayment } from "./payPayIntegration";

//==========================================Normal Subscription=======================================
export const subscribe = async (
  userId: string,
  creatorId: string,
  subscriptionId: string
) => {
  const validate = await checkUserRec(userId, creatorId, subscriptionId);
  if (!validate) {
    const payment = initiatePayment(creatorId);
    if (payment) {
      if (await newSubscription(userId, creatorId, subscriptionId)) {
        return "SUBSCRIBED";
      }
    }
  } else {
    return "ALREADYSUBSCRIBED";
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
    return "SUBSCRIBED";
  }
  return;
}

//===============================================================================================

export const checkUserRec = async (
  userId: string,
  creatoId: string,
  subscriptionId: string
) => {
  try {
    const validate = await checkUserRecord(userId, creatoId, subscriptionId);
    if (!validate) {
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
};
//=================================================================================================
// export const checkExistingSubscription = async (
//   userId: string,
//   creatorId: string,
//   subscriptionId: string
// ) => {
//   const Subscribed = await getSubscriptionDetails(
//     userId,
//     creatorId,
//     subscriptionId
//   );

//   const currentDate = new Date();
//   if (Subscribed != null) {
//     if (Subscribed.expiryDate <= currentDate) {
//       const updateValues = await updateSubscription(
//         userId,
//         creatorId,
//         subscriptionId
//       );
//       if (updateValues) {
//         return removedFromSubscription;
//       }
//     }
//     return alreadySubscribed;
//   }
//   return notSubscribed;
// };
//==========================================Custom Subscription==================================

// export const customSubscribed = async (
//   requestId: string,
//   userId: string,
//   creatorId: string,
//   subscriptionId: string
// ) => {
//   const requestStatus = await getAcceptedRequest(
//     requestId,
//     userId,
//     creatorId,
//     subscriptionId
//   );
//   if (requestStatus) {
//     const checkCurrentSubscription = await checkExistingSubscription(
//       userId,
//       creatorId,
//       subscriptionId
//     );

//     switch (checkCurrentSubscription) {
//       case alreadySubscribed:
//         return false;
//       case notSubscribed:
//         if (requestStatus.userQuotation) {
//           if (await newSubscription(userId, creatorId, subscriptionId)) {
//             return true;
//           }
//         }
//       default:
//         return false;
//     }
//   }
//   return false;
// };

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
