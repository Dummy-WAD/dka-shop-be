const express = require("express");
const validate = require("../middlewares/validate");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validations/auth.validation");

const router = express.Router();

router.post(
    "/auth/login",
    validate(authValidation.login),
    authController.login
);

module.exports = router;