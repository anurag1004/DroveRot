const express=require('express'),
app=express(),
bodyParser=require('body-parser'),
fs = require('fs'), 
https = require('https'),
CryptoJS = require("crypto-js"),
passport   = require('passport'),
LocalStrategy = require('passport-local'),
passportLocalMongoose = require('passport-local-mongoose'),
User=require('./models/user'),
mongoose   = require('mongoose');
mongoose.connect('mongodb+srv://AxDU:152452Anurag@@cluster0-nhs71.mongodb.net/DroveRot?retryWrites=true&w=majority&family=4',{
   useNewUrlParser: true,
   useFindAndModify: false,
   useCreateIndex: true,
   useUnifiedTopology: true
});
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.disable('x-powered-by');
app.use(require('express-session')({
    secret:'igfiqfgvqiyfvqeufgv3r38r78272@$%778', //cookie secret
    name: 'session',
    resave:false,
    path: 'session/',
    cookie: {sameSite: true,maxAge: 12*60*60*60,httpOnly: true},
    saveUninitialized:false,
  }));
  app.use(passport.initialize()); //tell express to use passport
  app.use(passport.session());
  //no-cache should be stored on the browser
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	next();
});
app.get('/',isLoggedIn,(req, res)=>{
    res.render('index',{user:req.user});
})
app.get('/login',(req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }else{
        res.render('login');
    }
});
app.post('/login', passport.authenticate('local',{
	successRedirect: '/',
	failureRedirect: '/login'
    }),(req, res)=>{}
);
app.get('/logout',isLoggedIn,(req, res)=>{
    req.logout();
    res.redirect('/login');
});
app.get('/register',(req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }else{
        res.render('register');
    }
    
});
app.post('/register',(req, res)=>{
    let newUser = new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, (err, user)=>{
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
});
app.get('/passKey',(req, res)=>{
    res.send({key: 'cQfTjWnZr4u7x!A%D*G-KaPdSgUkXp2s'});
})
//Feature//

app.post('/updateLocation',isLoggedIn,(req, res)=>{
    let willSave=false;
    const longitude  = Number((CryptoJS.AES.decrypt(req.body.longitude_string,'cQfTjWnZr4u7x!A%D*G-KaPdSgUkXp2s')).toString(CryptoJS.enc.Utf8));
    const latitude  =  Number((CryptoJS.AES.decrypt(req.body.latitude_string,'cQfTjWnZr4u7x!A%D*G-KaPdSgUkXp2s')).toString(CryptoJS.enc.Utf8));
    req.user.locationhistory.push({longitude,latitude});
    req.user.save((err, saved)=>{
        if(err){
            res.sendStatus('unable to save');
        }else{
            res.sendStatus(200);
        }
    });
    // User.findById(req.user._id,(err, user)=>{
    //     if(err){
    //         console.log('user doesn"t exist');
    //         req.logout();
    //         res.redirect('/login');
    //     }
    //     else{
    //         user.locationhistory.push({longitude,latitude});
    //         user.save((err, saved)=>{
    //             if(err){
    //                 res.sendStatus(501);
    //             }else{
    //                 res.sendStatus(200);
    //             }
    //         });
            
    //     }
    // })
    // if(req.user.locationhistory.length>0){
    //     let last_longitude=req.user.locationhistory[req.user.locationhistory.length-1].longitude;
    //     let last_latitude=req.user.locationhistory[req.user.locationhistory.length-1].latitude;
    //     //console.log(req.user.locationhistory[req.user.locationhistory.length-1]);
    //     var distance = distance_(latitude, longitude, last_latitude, last_longitude, 'K');
    //     let distance_cm=distance*100000;
    //     if((Math.round(distance_cm*1000)/1000)>=50){
    //         willSave=true;
    //     }
    // }else{
    //     willSave=true;
    // }

    // if(willSave){
    //     User.findById(req.user._id,(err, user)=>{
    //         if(err){
    //             console.log('user doesn"t exist');
    //             req.logout();
    //             res.redirect('/login');
    //         }
    //         else{
    //             user.locationhistory.push({longitude,latitude});
    //             user.save((err, saved)=>{
    //                 if(err){
    //                     res.sendStatus(501);
    //                 }else{
    //                     res.sendStatus(200);
    //                 }
    //             });
                
    //         }
    //     })
    // }else{
    //     console.log('User hasn"t moved');
    //     res.send("1001");
    // }

   
});

// app.listen(3000,(req, res)=>{
//     console.log('server started');
// });
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
  .listen(5000, function () {
    console.log('App listening on port 8080! Go to https://localhost:8080/')
  })

  //Middlewares and functions
function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
        return next();
      else{
        res.redirect('/login');
      }
         
  }
        function distance_(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var radlon1 = Math.PI * lon1/180
        var radlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
}
