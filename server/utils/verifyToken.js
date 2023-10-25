const jwt = require('jsonwebtoken');
require("dotenv").config();

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token verification failed
        reject(err);
      } else {
        // Token verification succeeded, resolve with decoded data
        resolve(decoded);
      }
    });
  });
}

module.exports = {
  verifyToken,
};
