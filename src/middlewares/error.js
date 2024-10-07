const errorHandler = (err, req, res, next) => {
   
  let { statusCode, message } = err;
  res.locals.errorMessage = err.message;

  const responseStatusCode = statusCode || 500;

  const response = {
    code: responseStatusCode,
    message,
  };
  res.status(responseStatusCode).send(response);
};


export default errorHandler;
