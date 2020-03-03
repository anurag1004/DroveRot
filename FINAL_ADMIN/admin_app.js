const express=require('express'),
admin_app=express(),
io = require('socket.io'),
compression=require('compression'),
bodyParser=require('body-parser'),
fs = require('fs'), 
cookieParser = require('cookie-parser'),
https = require('https'),
CryptoJS = require("crypto-js"),
image_dec_key = require("./image_dec.js");
passport   = require('passport'),
LocalStrategy = require('passport-local'),
//MODELS//
User=require('./models/user'),
Admin=require('./models/admin'),
image=require('./models/image'),
//Cmd=require('./models/command'),
mongoose   = require('mongoose');

mongoose.connect('mongodb+srv://AxDU:152452Anurag@@cluster0-nhs71.mongodb.net/DroveRot?retryWrites=true&w=majority&family=4',{
   useNewUrlParser: true,
   useFindAndModify: false,
   useCreateIndex: true,
   useUnifiedTopology: true
});
admin_app.set('trust proxy', 1);
admin_app.set('view engine', 'ejs');
admin_app.use(compression());
admin_app.use(cookieParser());
admin_app.use(express.static('public'));
admin_app.use(bodyParser.urlencoded({extended:true}));
admin_app.disable('x-powered-by');
admin_app.use(require('express-session')({
    secret:'igfiqfgvqiyfvqeufgv3r38r78272@$%778', //cookie secret
    name: 'session',
    resave:false,
    path: 'session/',
    cookie: {sameSite: true,maxAge: 12*60*60*60,httpOnly: true},
    saveUninitialized:false,
  }));
  admin_app.use(passport.initialize()); //tell express to use passport
  admin_app.use(passport.session());
  //no-cache should be stored on the browser
//   admin_app.use(function (req, res, next) {
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     res.header('Expires', '-1');
//     res.header('Pragma', 'no-cache');
//     next();
// });

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
passport.use(new LocalStrategy(Admin.authenticate()));

admin_app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	next();
});

//Admin Routes for Rover Control//
admin_app.get('/',isLoggedIn,(req, res)=>{
        console.log('Admin logged in');
        //go to home page
        res.render('admin/home');
        //res.render('admin/admin_panel');
});
admin_app.get('/login',(req, res)=>{
    let msg=null;
    if(req.isAuthenticated()) res.redirect('/');
    else
    res.render('login',{msg:msg});
});

admin_app.post('/login', passport.authenticate('local',{
	successRedirect: '/',
	failureRedirect: '/login'
    }),(req, res)=>{}
);

admin_app.get('/register',(req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }else{
        res.render('register');
    }
});

admin_app.post('/register',(req, res)=>{

    Admin
    .estimatedDocumentCount()
    .then(count => {
        console.log(count)
        //and do one super neat trick
        if(count<3){
            let newAdmin = new Admin({username: req.body.username, email: req.body.email, phone_number: req.body.phone_number});
            Admin.register(newAdmin, req.body.password, (err, user)=>{
            if(err){
                console.log(err);
                return res.redirect('/register');
             }
                else{   
                    passport.authenticate('local')(req, res, ()=>{
                    res.redirect('/');
               });
           }
            });
        }else{
            res.render('login',{msg: "Maximum Admins Reached!!!"});
        }
      
    })
    .catch(err => {
        //handle possible errors
    })
           
});

admin_app.get('/rover_manual',isLoggedIn,(req, res)=>{

        res.render('admin/roverManual');

});


admin_app.get('/logout',(req, res)=>{
    res.clearCookie('session');
    res.clearCookie('io');
    req.logout();
    console.log('admin loggedOut')
    res.redirect('/login');

});

admin_app.get('/all_live_coords',isLoggedIn,(req, res)=>{
    class live_coords{
        constructor(name,latitude,longitude){
            this.name=name;
            this.latitude=latitude;
            this.longitude=longitude;
        }
    }
    User.find({},(err, users)=>{
        if(err){
            console.log(err);
            res.send("Something Went wrong ERR: "+err);
        }else{
            let users_=[];
            users.forEach(user=>{
                let length=user.locationhistory.length;
                if(user.locationhistory.length!=0){
                    let obj=new live_coords(user.username,user.locationhistory[length-1].latitude,user.locationhistory[length-1].longitude);
                    users_.push(obj);
                }
            });
            res.send(users_);
        }
    })
});

//TRAINMODE//
admin_app.get('/trainmode',isLoggedIn,(req, res)=>{
    res.render('trainmode/index.ejs');
});
admin_app.get('/trainmode/add',isLoggedIn,(req, res)=>{
    res.render('trainmode/add.ejs');
});
/////////////

//WORKINGMODE////////////
admin_app.get('/workingmode',isLoggedIn,(req, res)=>{
    res.render('workingmode/index',{key: image_dec_key.key});
});
admin_app.get('/workingmode/roverManual',isLoggedIn,(req, res)=>{
    res.render('workingmode/roverManual');
});
admin_app.get('/workingmode/gps',isLoggedIn,(req, res)=>{
    res.render('workingmode/rovergps.ejs');
});
admin_app.get('/workingmode/live',isLoggedIn,(req, res)=>{
    res.render('workingmode/live.ejs');
});
admin_app.get('/workingmode/arm',isLoggedIn,(req, res)=>{
    res.render('workingmode/arm.ejs');
});
//////////////////////////


// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
//   }, admin_app)
//   .listen(8000, function () {
//     console.log('Admin App listening on port 8000! Go to https://localhost:8000/');
//   })
const socket_io = io.listen(admin_app.listen(8000,(req, res)=>{
    console.log('Admin app listening on port! Go to http://localhost:8000');
}));
// const socket_io = io.listen(
//     https.createServer({
//         key: fs.readFileSync('server.key'),
//         cert: fs.readFileSync('server.cert')
//       }, admin_app)
//       .listen(8000, function () {
//         console.log('Admin app listening on port 8000! Go to https://localhost:8000/')
//       }));
//////////////////////////SOCKET.IO//////////////////////////
socket_io.sockets.on("connection",(socket)=>{
    console.log("user connected");
        socket.on("disconnect",(socket)=>{
            console.log("disconnected")
        });
        //for image
        socket.on('get-live-footage',()=>{
            //console.log('running');
             image.find({},(err,got_image)=>{
                if(err){
                    console.log(err);
                }else{
                    if(got_image.length!=0){
                        socket.emit('processed-img',{src: got_image[0].src});
                    }
                }
            });
        })

        //rover commands
        socket.on('cmd',cmd=>{
            console.log(cmd);
            socket.broadcast.emit('rov',cmd);

        });
        //arm-control
        socket.on('arm-control',(data)=>{
            //socket.emit('arm',data);
            console.log(data);
            socket.broadcast.emit('arm',data);
        });
        //add soldiers
        socket.on('add-soldier',(data)=>{
            console.log(data);
            socket.broadcast.emit('add',data);
        });
        //handle event of successfull added soldier
        socket.on('added-sucessfully',data=>{
            socket.emit('show-added-to-client',data);
        });
        //train-now event
        socket.on('train_now',data=>{
            console.log(data);
            socket.broadcast.emit('learn_faces','y');
        });
        //handle on training completed
        socket.on('training-completed',data=>{
            console.log(data);
            socket.emit('completed-training',data);
        });
        //get entered gps coordinates
        socket.on('gps',(data)=>{
            console.log(data);
            socket.broadcast.emit('gps-follow',data);
        });

        //stop the auto mode
        socket.on('stop-automode',(data)=>{
            console.log(data);
            socket.broadcast.emit('disable-autonomous',data);
        });

        socket.on('rover-operation',data=>{
            console.log(data);
            socket.broadcast.emit('rover-op',data);
        });
        //stop manual mode
        socket.on('stop-manualmode',data=>{
            console.log(data);
            socket.broadcast.emit('disable-manual',data);
        })
        //start the motor for arm control

        socket.on('start-arm',data=>{
            console.log(data);
            socket.broadcast.emit('execute-arm',data);
        });

        //terminate all modes

        socket.on('terminate-program',data=>{
            console.log(data);
            socket.broadcast.emit('program-terminate',data);
        });

        //confirm that arm file is excuted on the pi
        socket.on('executed-arm',data=>{
            console.log(data);
        });

        //get geo coordinates from compass(rover location)
        socket.on('rov-location',data=>{
            console.log(data);
            socket.broadcast.emit('remitted-rov-coords',data);
        });
   });
//Middlewares and functions
function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
        return next();
      else{
        res.redirect('/login');
      }
  }
// function command(cmd,req,res){
//     let move=req.body.cmd;
//     let stop=false;
//     let self_distruct=false;
//     if(move=='stop'){
//         move=null;
//         stop=true;
//         self_distruct=false;
//     }
//     else if(move=='self_distruct'){
//         move=null;
//         stop=true;
//         self_distruct=true;
//     }else{
//         stop=false;
//         self_distruct=false;
//     }

//     let newCmd = new Cmd({move: move,stop:stop,self_distruct:self_distruct});
//     Cmd.create(newCmd,(err, assignedCmd)=>{
//         if(err){
//             console.log(err);
//             res.send('ERROR communating with Mongo Atlas '+err);
//         }else{
//             res.sendStatus(200);
//         }
//     })
// }
