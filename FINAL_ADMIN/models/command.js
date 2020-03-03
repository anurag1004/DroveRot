const mongoose = require('mongoose'),
	  passportLocalMongoose = require('passport-local-mongoose'),
      CmdSchema     = new mongoose.Schema({
        move: String,
        stop: Boolean,
        self_distruct: Boolean
    });
CmdSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Cmd',CmdSchema);