var Location = require('../models/location.js');


exports.create = function (location) {
  new Location({
    formatted_address: location.formatted_address,
    position: {
      lat: location.position.lat,
      lng: location.position.lng
    },
    location_cluster: location.location_cluster,
    fbLocation: location.fbLocation
  }).save(function(err) {
    if (err) {
      console.log('Error saving : ', location.location_cluster); 
    } else {
      console.log('Saving location: ', location.location_cluster);
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
