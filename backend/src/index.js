const express = require('express')
const app = express();
require('dotenv').config();      
const main =  require('./config/db.js')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth.js");
const redisClient = require('./config/redis.js');
const problemRouter = require("./routes/problemCreator.js");
const submitRouter = require("./routes/submit.js")
const aiRouter = require("./routes/aiChatting.js")
const videoRouter = require("./routes/videoCreator.js");
const paymentRouter = require("./routes/payment.js");
const dashboardRouter = require("./routes/dashboard.js");
const notesRouter = require("./routes/notes.js");
const favoriteRouter = require("./routes/favorites.js");
const complexityRouter = require("./routes/complexityAnalysis.js");
const companyRouter = require("./routes/companies.js");
const streakRouter = require("./routes/streak.js");
const assessmentRouter = require("./routes/assessment.js");
const storeRouter = require('./routes/store.js');
const contestRouter = require("./routes/contest.js");
const settingsRouter = require("./routes/settings.js");
const dailyTaskRouter = require("./routes/dailyTasks.js");
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('./config/passport');

// console.log("Hello")

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, // set to true for HTTPS
        sameSite: 'none',
        httpOnly: true
    },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use("/payment",paymentRouter);
app.use("/dashboard",dashboardRouter);
app.use("/notes",notesRouter);
app.use("/favorites",favoriteRouter);
app.use("/complexity",complexityRouter);
app.use("/api",companyRouter);
app.use("/streak",streakRouter);
app.use("/assessment",assessmentRouter);
app.use('/store', storeRouter);
app.use("/contest", contestRouter);
app.use("/settings", settingsRouter);
app.use("/daily-tasks", dailyTaskRouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

app.set('io', io); // Make io accessible via app

io.on('connection', (socket) => {
    // Expect userId as a query param for simplicity
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
    }
    // Optionally: handle disconnect, etc.
});

const InitalizeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        server.listen(process.env.PORT, ()=>{             
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();
module.exports = { app, io };