require('dotenv').config();
const express=require("express");
const app=express();
const ejs=require("ejs");
const expressLayout=require("express-ejs-layouts")
const path=require("path");
const mongoose= require("mongoose");
const session=require("express-session");
const flash=require('express-flash');
const MongoDbStore= require('connect-mongo')(session);
const passport=require("passport");
const Emitter=require('events')
mongoose.set('useCreateIndex', true);
//data base connection
const PORT= process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_CONNECTION_URL ,{
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("Database connected...");
}).catch(err =>{
    console.log('connection failed...');
})


//session store
let mongoStore=new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//event emmitter
const eventEmitter=new Emitter()
app.set('eventEmitter',eventEmitter)
//session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {maxAge: 1000*60*60*24}
}))

//passport config
const passportInit=require('./app/config/passport')
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

 app.use(flash());
//assets
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//gloval middlewire
app.use((req,res,next)=>{
    res.locals.session = req.session; //session will act as golval middleware
    res.locals.user=req.user;
    next();
})
//Templet Engine
app.use(expressLayout) 
app.set('views', path.join(__dirname, '/resources/views'));
app.set("view engine","ejs");
require("./routes/web")(app);

app.use((req,res)=>{
    res.status(404).render('errors/404')
})

const server=app.listen(PORT,()=>{ 
    console.log(`Listening On port ${PORT}...`);
}); 
//socket
const io=require('socket.io')(server)
io.on('connection',(socket)=>{
    socket.on('join',(roomName)=>{
        socket.join(roomName)
    })
})
eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})
eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})
