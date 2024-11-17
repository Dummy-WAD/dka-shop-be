import { DiscountType } from "../utils/enums.js";

const phoneNumberPattern = new RegExp(/(0[3|5|7|8|9])+([0-9]{8})\b/);
const passwordPattern = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?~`-])(?=.*[a-z])(?=.*[A-Z])\S{8,}$/);

const password = (value, helpers) => {
  if (!value.match(passwordPattern)) {
    return helpers.message(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }
  return value;
};

const phoneNumber = (value, helpers) => {
  if (!value.match(phoneNumberPattern)) {
    return helpers.message(
      "Phone number must start with 03, 05, 07, 08, or 09 and be followed by 8 digits."
    );
  }
  return value;
};

const validateStartDate = (value, helpers) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (new Date(value) < currentDate) {
    return helpers.message('Start Date must be greater than or equal to the Current Date');
  }
  return value;
};


const validateExpirationDate = (value, helpers) => {
  const startDate = helpers.state.ancestors[0]?.startDate;
  
  if (startDate && new Date(value) < new Date(startDate)) {
    return helpers.message('Expiration Date must be greater than or equal to the Start Date');
  }
  return value;
};

const validateDiscountValue = (value, helpers) => {
  const discountType = helpers.state.ancestors[0]?.discountType;
  
  if (discountType === DiscountType.PERCENTAGE && value > 100) {
    return helpers.message('Discount value cannot exceed 100 when discount type is PERCENTAGE');
  }
  return value;
};

export default {
  password,
  phoneNumber,
  validateStartDate,
  validateExpirationDate,
  validateDiscountValue
};