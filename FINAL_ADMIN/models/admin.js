const mongoose = require('mongoose'),
	  passportLocalMongoose = require('passport-local-mongoose'),
      AdminSchema     = new mongoose.Schema({
      email    : String,
      phone_number: Number,
      username : String,
      password : String,
    });
AdminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Admin',AdminSchema);