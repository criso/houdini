var Location = require('../models/location.js');


exports.create = function (location) {
  new Location({
    formatted_address: location.formatted_address,
    position: {
      Ka: location.position.Ka,
      La: location.position.La
    },
    grouped_location: location.grouped_location,
    fbLocation: location.fbLocation
  }).save(function(err) {
    if (err) {
      console.log('Error saving : ', location.grouped_location); 
    } else {
      console.log('Saving location: ', location.grouped_location);
    }
  });
};

exports.show = function (req, res) {
  Location.findOne({ fbLocation: req.params.name }, function (err, location) {
    if (location) {
      res.send({ success:location });
    } else {
      res.send({ 
        error: 'location not found',
        location: req.params.name 
      });
    }
  });
};
