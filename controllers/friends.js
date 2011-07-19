// Maybe not
var Friend = require('../models/friend.js');

exports.create = function (friends) {

  Friend.findOne({facebookID: friend.id}, function (err, friend) {
    if (!friend) {
      // create one 
    }
  })

  new Friend({
    facebookID: id,
    name: name,
    picture: picture
  }).save();

};
