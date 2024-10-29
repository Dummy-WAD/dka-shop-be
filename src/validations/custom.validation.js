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

export default {
  password,
  phoneNumber,
};