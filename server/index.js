// server/server.js
require("dotenv").config();
const cors = require('cors');
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
// const initializeSocket = require('./socket');
// const io = initializeSocket(server);

// app.use(cors())
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// Middleware

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Backend Server listening on ${port}`);
});





