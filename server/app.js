const path = require('path');
const cors = require('cors');
const cookieParser = require("cookie-parser")
require('dotenv').config();
const authRouter = require('./routes/authRouter');
const router = require('./routes/routes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const express = require('express');
const http = require('http');
//const initializeSocket = require('./socket');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const postCommentRoutes = require('./routes/postCommentRoutes')
const friendRequest = require('./routes/friendRequestRoutes')
const messageroute = require('../server/routes/messageroute')
const problemRoutes = require('../server/routes/problemRoutes')
const inputOutputRoutes = require('../server/routes/problemSolverQueryRoutes')
const promptRoutes = require('../server/routes/promptRoutes')
const reactionsRoutes = require('../server/routes/reactionsRoutes')
const teamRoutes = require('../server/routes/teamRoutes')
const inviteRoutes = require('../server/routes/inviteRoutes')
const contestRoutes = require('../server/routes/contestRoutes')
const contestDescriptionRoutes = require('../server/routes/contestDescriptionRoutes')
const contestSubmissionRoutes = require('../server/routes/submissionRoutes')
const notificationRoutes = require('../server/routes/notificationRoutes')
const planRoutes = require('../server/routes/planRoutes')
const emailSubRoutes = require('../server/routes/emailSubRoutes')
const friend = require('./models/FriendSchema')
const app = express();
const server = http.createServer(app);
const feed = require('./routes/feedRoutes');
const validateToken = require('./utils/validateToken');
// const io = initializeSocket(server);

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));



// // MIDLEWARES ->>
// app.use(cors()); // <- CORS configuration, in case if you wanted to implemented authorization
// //app.options(process.env.REMOTE, cors());


app.use((req, res, next) => {	// <- Serves req time and cookies
	
	req.requestTime = new Date().toISOString();
	if (req.cookies) console.log(req.cookies);
	next();
});

app.use((req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	next();
});

app.use(express.json({ limit: '100mb' })); // <- Parses Json data
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // <- Parses URLencoded data




  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use('/client/public/upload', express.static('/client/public/upload'));
  
  
  // Connect to MongoDB
  connectDB();

  
  app.use("/files", express.static("files"));
  
  app.use(validateToken)
  app.use('/api/users', userRoutes);
  // API Routes

  app.use('/api/v1/auth/', authRouter); 
  console.log("App Started")
  app.use('/api/v1/', router); // <- Calling the router
 
  app.use('/api/posts', postRoutes);
  app.use('/api/comments',postCommentRoutes);
  app.use('/api/reaction',reactionsRoutes)
  
  app.use('/api/problems',problemRoutes);
  app.use('/api/query',inputOutputRoutes);
  app.use('/api/prompt',promptRoutes);

  app.use('/api/friendRequest',friendRequest)
  app.use('/api/friend' , friend)
  app.use('/api/post' , feed)
  app.use('/api/messageroute' , messageroute)
  
  app.use('/api/team', teamRoutes)
  app.use('/api/invite',inviteRoutes)
  app.use('/api/notification',notificationRoutes)

  app.use('/api/contest', contestRoutes)
  app.use('/api/contest-description', contestDescriptionRoutes)
  app.use('/api/contest-submission', contestSubmissionRoutes)
  app.use('/api/contest-plan', planRoutes)
  app.use('/api/landing-page',emailSubRoutes)

app.use(errorController); // <- Error Handling Middleware

module.exports = app;
