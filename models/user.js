var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema;


var UserSchema = new Schema({
  username: String,
  type: Number,
  facebookID: String,
  email: String,
  date: Date
});

module.exports = mongoose.model('User', UserSchema);

