import dotenv from 'dotenv';
dotenv.config();

function configCors(app) {
  app.use(function (req, res, next) {
    const reactUrl = process.env.REACT_URL;
    const origin = req.headers.origin;

    if (origin === reactUrl) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, content-type, Authorization"
    );

    res.setHeader("Access-Control-Allow-Credentials", true);

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}

export default configCors;
