const jwt = require('jsonwebtoken');
const publicRoutes = ['/api/users/login','/api/users/signup']
require("dotenv").config();

function validateToken(req, res, next) {
    console.log(req.url)
    if(publicRoutes.includes(req.url)){
       next();
    }
    else{
        const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1]  
    if (!Boolean(req.headers["authorization"])) {
        res.status(401).send("Token not present")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) { 
            res.status(401).send("Token is invalid")
        } else {
            req.user = user;
            next();
        }
    });
    }
}

module.exports = validateToken;
 