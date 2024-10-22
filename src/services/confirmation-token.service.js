import db from "../models/models/index.js";
import { AccountStatus, ConfirmationTokenStatus } from "../utils/enums.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const createConfirmationToken = async (userId) => {
  const confirmationToken = await db.confirmationToken.create({
    userId: userId,
    confirmationToken: crypto.randomUUID(),
    status: ConfirmationTokenStatus.PENDING,
  });

  return confirmationToken;
}

const confirmRegisterByToken = async (token) => {
  const confirmationToken = await db.confirmationToken.findOne({
    where: {
      confirmationToken: token,
      status: ConfirmationTokenStatus.PENDING,
    },
  });

  if (!confirmationToken) {
    throw new ApiError(httpStatus.NOT_FOUND, "Confirmation token not found");
  }

  const user = await db.user.findByPk(confirmationToken.userId);
  user.status = AccountStatus.ACTIVE;
  await user.save();

  confirmationToken.status = ConfirmationTokenStatus.CONFIRMED;
  await confirmationToken.save();

  return { email: user.email, status: user.status };
}

export default { createConfirmationToken, confirmRegisterByToken };