const jwt = require('jsonwebtoken');
const publicRoutes = ['/api/users/login','/api/users/signup']
require("dotenv").config();

function validateToken(req, res, next) {

    if(publicRoutes.includes(req.url)){
       next();
    }
    else{
        const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1]  
    if (!Boolean(req.headers["authorization"])) {
        res.send("Token not present")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) { 
            res.send("Token is invalid")
        } else {
            req.user = user;
            next();
        }
    });
    }
}

module.exports = validateToken;
 