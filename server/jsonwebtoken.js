const crypto = require('crypto');
const fs = require('fs');

// Generate a random JWT secret (base64 encoded)
const jwtSecret = crypto.randomBytes(32).toString('base64');

// Output the secret to the console
console.log(`Generated JWT Secret: ${jwtSecret}`);

// Write the secret to a .env file
fs.writeFileSync('.env', `JWT_SECRET=${jwtSecret}\n`, { flag: 'a' });