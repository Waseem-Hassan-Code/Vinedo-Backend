import express from "express";
import { authenticateToken } from "../Middleware";
import {
  accepttSubscription,
  denytSubscription,
  getAcceptedUserRequests,
  payCustomAmount,
  payNormalAmount,
  requestCustomSub,
  search_Creator,
} from "../Controllers/userSubscriptions";
import { isValidUser } from "../Middleware/validateUser";
import { isValidContentCreator } from "../Middleware/validCreator";
import { subscriptionsCount } from "../Model/subscriptions";

export default (router: express.Router) => {
  router.post(
    "/subscription/acceptSubscription/:userIdentity",
    authenticateToken,
    isValidContentCreator,
    accepttSubscription
  );
  router.post(
    "/subscription/denySubscription",
    authenticateToken,
    isValidContentCreator,
    denytSubscription
  );
  router.post(
    "/subscription/requestCustomAmount",
    authenticateToken,
    isValidUser,
    requestCustomSub
  );
  router.post(
    "/subscription/payCustomAmount",
    authenticateToken,
    isValidUser,
    payCustomAmount
  );
  router.post(
    "/subscription/requestNormalAmount",
    authenticateToken,
    isValidUser,
    payNormalAmount
  );
  router.get(
    "/subscription/allUserAcceptedRequests/:userId",
    authenticateToken,
    isValidUser,
    getAcceptedUserRequests
  );

  router.get(
    "/subscription/allUserRequests/:creatorId",
    authenticateToken,
    isValidContentCreator,
    getAcceptedUserRequests
  );

  router.post("/subscription/SearchCreator", authenticateToken, search_Creator);

  router.get(
    "/subscription/SubscriptionsCount/:creatorId",
    authenticateToken,
    subscriptionsCount
  );
};
