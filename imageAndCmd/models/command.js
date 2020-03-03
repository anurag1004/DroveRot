const mongoose = require('mongoose');
      CmdSchema     = new mongoose.Schema({
        move: String,
        stop: Boolean,
        self_distruct: Boolean
      });
module.exports = mongoose.model('Cmd',CmdSchema);