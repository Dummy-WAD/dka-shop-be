import db from "../models/models/index.js";
import { ConfirmationTokenStatus } from "../utils/enums.js";

const createConfirmationToken = async (userId) => {
  const confirmationToken = await db.confirmationToken.create({
    userId: userId,
    confirmationToken: crypto.randomUUID(),
    status: ConfirmationTokenStatus.PENDING,
  });

  return confirmationToken;
}

const invalidateConfirmationTokenOfUser = async (userId) => {
  await db.confirmationToken.update(
    { status: ConfirmationTokenStatus.CANCELLED },
    { where: { userId: userId, status: ConfirmationTokenStatus.PENDING } }
  );
}

export default { createConfirmationToken, invalidateConfirmationTokenOfUser };