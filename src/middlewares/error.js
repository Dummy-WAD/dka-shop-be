const errorHandler = (err, req, res, next) => {
   
  let { statusCode, message } = err;
  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
  };
  res.status(statusCode).send(response);
};


export default errorHandler;
