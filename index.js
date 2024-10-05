const express = require("express");
const routes = require("./src/routes/routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cf = require("./src/config/cors");
const passport = require('passport');
const { jwtStrategy } = require('./src/config/passport');
const { errorHandler } = require("./src/middlewares/error");
const app = express();
const config = require('./src/config/config');
const PORT = config.port || 8080;

// CORS configuration
cf.configCors(app);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Passport JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// API routes
app.use("/api", routes);

// handle error
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
