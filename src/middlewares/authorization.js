import jwt from "jsonwebtoken";

const isTokenValid = (req, res, next) => {
    console.log("CHECKING IF TOKEN IS VALID");
    // Check if the user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

const isTokenExpired = (req, res, next) => {
    console.log("CHECKING IF TOKEN IS EXPIRED");
    // Check if the token is expired
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    });
}

const isAdmin = (req, res, next) => {
    console.log("CHECKING IF USER IS AN ADMIN");
 if (req.user.dataValues.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
    next();
}

const isCustomer = (req, res, next) => {
    console.log("CHECKING IF USER IS A CUSTOMER");
    if (req.user.dataValues.role !== "CUSTOMER") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
}


export {
    isTokenValid,
    isTokenExpired,
    isAdmin,
    isCustomer
};