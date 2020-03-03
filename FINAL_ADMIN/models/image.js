const mongoose = require('mongoose'),
      imageSchema     = new mongoose.Schema({
        src: String
    });
module.exports = mongoose.model('image',imageSchema);