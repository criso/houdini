var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema;

var LocationSchema = new Schema({
  formatted_address: String,
  position: {
    lat: Number,
    lon: Number
  },
  parsed_location:  String,
  location_cluster: String
});

module.exports = mongoose.model('Location', LocationSchema);
