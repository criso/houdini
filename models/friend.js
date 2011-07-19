var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema;

var FriendSchema = new Schema({
  facebookID: String,
  name: String,
  picture: String
});

module.exports = mongoose.model('Friend', FriendSchema);
