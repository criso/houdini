var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema;


var ChatSchema = new Schema({
  room: String,
  creator: String
});

module.exports = mongoos.model('Chat', ChatSchema);
