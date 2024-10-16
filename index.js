import express from "express";
import routes from './src/routes/routes.js';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cf from "./src/config/cors.js";
import passport from 'passport';
import jwtStrategy from './src/config/passport.js';
import errorHandler from "./src/middlewares/error.js";
const app = express();
import config from './src/config/config.js';
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
