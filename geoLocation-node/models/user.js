const mongoose = require('mongoose'),
	  passportLocalMongoose = require('passport-local-mongoose'),
      UserSchema     = new mongoose.Schema({
      email    : String,
      username : String,
      password : String,
      locationhistory: [{
          longitude: Number,
          latitude: Number,
          created_at: {type: Date, default: Date.now}
      }]
    });
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',UserSchema);