const jwt = require('jsonwebtoken');
const publicRoutes = [
    /^\/api\/users\/login$/,
    /^\/api\/users\/signup$/,
    /^\/api\/contest\/get-all-contests/,
    /^\/api\/contest-description\/get-contest-description/,
];
require("dotenv").config();

function validateToken(req, res, next) {
    console.log(req.url);

    if (publicRoutes.some(regex => regex.test(req.url))) {
        return next();
    }

    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(469).send("Token not present");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(469).send("Token is invalid");
        }

        req.user = user;
        next();
    });
}

module.exports = validateToken;
