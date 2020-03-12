const express = require('express'),
      bodyParser= require('body-parser'),
      fs=require('fs-extra'),
      multer=require('multer'),
      mongoose=require('mongoose');
      key = require('./key'),
      Cmd = require('./models/command'),
      bcrypt=require('bcrypt'),
      cookieParser = require('cookie-parser');
const app=express(),

storage = multer.diskStorage({
    filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });
mongoose.connect('mongodb+srv://Username:PWD@cluster0-nhs71.mongodb.net/DroveRot?retryWrites=true&w=majority&family=4',{
   useNewUrlParser: true,
   useFindAndModify: false,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

const imageSchema=new mongoose.Schema({
    src: String
});
const image = mongoose.model('images', imageSchema);
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.render('index');
});
app.post('/upload/base64',(req,res)=>{
    // console.log(key.hash);
    if(typeof req.body.base64Img != 'undefined'){
        bcrypt.compare(req.body.key,key.hash,(err, result)=>{
            if(err){ console.log(err);}
            else{
                if(result){ //if true
                    const finalImg = {
                        src: req.body.base64Img
                     };
                     image.deleteMany({},()=>{
                        image.create(finalImg, (err, uploaded)=>{
                            if(err) console.log(`Error:${err}`);
                            else{
                                console.log('uploaded');
                                res.send({msg: 'ok'});
                                //res.redirect('/');
                            }
                                
                           });
                       })
                }else{
                    console.log("invalid key!!");
                    res.send({msg:'invalid key!'});
                }
            }
        })
    }else{
        console.log("No image data!!");
        res.send({msg:'no image data'});
    }
   
});
app.post('/upload/photo', upload.single('myImage'), (req, res) => {
 const img = fs.readFileSync(req.file.path);
 console.log(JSON.stringify(req.headers));
 const encode_image = img.toString('base64');
 const finalImg = {
      src: encode_image
   };
   image.deleteMany({},()=>{
    image.create(finalImg, (err, uploaded)=>{
        if(err) console.log(`Error:${err}`);
        else
            res.redirect('/');
       });
   })
  
});
app.get('/photo/:id', (req, res) => {
    const photo_id = req.params.id;
    image.findById(photo_id,(err, found)=>{
        if (err){
            console.log(err);
            res.redirect('/');
        }
        console.log(found.src)
        var src = 'data:image/jpeg;base64,'+found.src;
        res.render('pic',{src: src})
    });
});
//FOR GETTING COMMANDS//
app.get('/getcmds',(req, res)=>{
    //req.cookies= {key: ''};
	console.log(req.cookies);
 if(typeof req.cookies!='undefined'){
        bcrypt.compare(req.cookies.key,key.cmd_hash,(err, result)=>{
            if(err) console.log(err);
            else{
                if(result){
    
                    Cmd.find({},(err, got_cmd)=>{
                        if(err){
                            console.log(err);
                        }else{
                            if(got_cmd.length!=0){
                                console.log(got_cmd)
                                res.send({
                                    move: got_cmd[0].move,
                                    stop: got_cmd[0].stop,
                                    self_distruct: got_cmd[0].self_distruct
                                });
                            }else{
                                console.log("no object found!");
                                res.send({msg: '007'});
                            }
                        }
                    })
    
                }else{
                    console.log('invalid key!!');
                    res.send({msg:'invalid key'});
                }
            }
        })
    }else{
        console.log('cookie is undefined');
        res.send({msg:'please add cookie! or cookie is undefined'});
    }
   
});
app.listen(3000, (req, res) => console.log('Server started on port 3000'));
