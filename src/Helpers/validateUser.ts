import { getUserById } from "../Model/users";

const user = async (userId: string) => {
  const checkCreator = await getUserById(userId);
  if (!checkCreator || !checkCreator.isContentCreator) {
    return false;
  } else {
    return true;
  }
};

export const authorizedUser = user;
