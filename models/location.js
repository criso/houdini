var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema;

var LocationSchema = new Schema({
  formatted_address: String,
  position: {
    Ka: Number,
    La: Number
  },
  parsed_location: String,
  grouped_location: String
});

module.exports = mongoose.model('Location', LocationSchema);
