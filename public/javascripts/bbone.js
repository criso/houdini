_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };

var App = window.App || {};

// ===========
// view 
// ===========

/**
 * view for a row containing a  friend
 */
var FriendRowView = Backbone.View.extend({
  tagName: "li", 

  className: "friend-row",

  template: _.template($('#friend-row-template').html()),

  events: {
    "click .picture":  "open"
  },
  
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },

  open: function (e) {
    console.log('clicked:', this.model.get('name'));

    // we set the model to active 
    // to trigure an 'event' on the collection
    // that the model belongs to
    this.model.set({active: 'active son'});
  }
});

/**
 * Main View holding all friends
 * main element container is #backbone
 */
var FriendsView = Backbone.View.extend({
  el: $("#friends-section"),

  initialize: function (friends) {

    // adding collections
    // this would would be collections based on locations
    this.addCollection(new FBCollection(friends.slice(0,20), 'BOS'));
    this.addCollection(new FBCollection(friends.slice(22,50), 'FLO'));
  },

  addCollection: function (collection) {
    collection.each(this.addOne);
  },

  addOne: function (friend) {
    // creating one veiw per friend 
    // attached to the FriendRowView
    var view = new FriendRowView({ model: friend });
    this.$("#list").append(view.render().el);
  }
});


// ===========
// Model 
// ===========
var FBFriend = Backbone.Model.extend({
  initialize: function () {
    this.bind('change:active', function (model, active) {
      console.log('model: ', model.get('name') + ' active: ', active);
    });
  }
});


// ===========
// Collection 
// ===========
var FBCollection = Backbone.Collection.extend({
  model: FBFriend,

  location: null,

  initialize: function (collection, location) {
    this.location = location;
    this.bind('change:active', function (model, active) {
      console.log('Collection: ', model.get('name') + ' active: ', active + ' for location: ', this.location);
    });
  }
});



$.subscribe('/FB/Friends/loaded', function() {
  var FBFriends = App.Facebook.FBFriends;
  var friendsView  = new FriendsView(FBFriends);
});
