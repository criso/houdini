_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };

var App = window.App || {};

// ===========
// view 
// ===========

/**
 * view for a row containing a  friend
 */
App.FriendRowView = Backbone.View.extend({
  tagName: "li", 

  className: "friend-row",

  template: _.template($('#friend-row-template').html()),

  events: {
    "click .picture":  "open"
  },

  initialize: function () {
    this.model.bind('ui:highlight', this.highlight, this);
    this.model.bind('ui:fadeIn', this.fadeIn, this);
  },
  
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },

  open: function (e) {

    // we set the model to active 
    // to trigure an 'event' on the collection
    // that the model belongs to
    // this.model.set({active: 'active son'});
    // manually triggering change event
    this.model.change();

    this.fadeIn();
    this.highlight();
  },

  // HACKY TODO _FIXME
  fadeIn: function () {
    $(this.el).animate({
      opacity: 1 
    }, 500);
  },


  highlight: function () {
    $(this.el).toggleClass('highlighted');
  }
});

/**
 * Main View holding all friends
 * main element container is #backbone
 */
App.FriendsView = Backbone.View.extend({
  el: $("#friends-section"),

  addCollection: function (collection) {
    collection.each(this.addOne);
    collection.bind('add', this.addOne, this);
  },

  addOne: function (friend) {
    // creating one veiw per friend 
    // attached to the FriendRowView
    var view = new App.FriendRowView({ model: friend });
    this.$('#list').append(view.render().el);
  },

  hideAll: function () {
    // this.$('#list .friend-row').addClass('hide-friends');
    // this.$('#list li').hide();
    this.$('#list li').animate({
      opacity: 0.4 
    });
  },

  clearHighlight: function () {
    this.$('#list').removeClass('highlighted');
  }
});


// ===========
// Model 
// ===========
App.FBFriendModel = Backbone.Model.extend({
  initialize: function () {
    this.bind('change', function (model, active) {
      // console.log('model: ', model.get('name') + ' active: ', active);
    });
  }

});


// ===========
// Collection 
// ===========
App.FBCollection = Backbone.Collection.extend({
  model: App.FBFriendModel,

  location: null,

  infoWindowTemplate: _.template($('#info-window-template').html()),
  friendPictureTemplate: _.template($('#friend-row-template').html()),

  infoWindow: null,

  initialize: function () {

    this.infoWindow = new google.maps.InfoWindow();

    // user clicked on a picture 
    this.bind('change', function (model) {
      // console.log('Collection: ', model.get('name') + ' for location: ', this.location + 
      // ' marker position.lat(): ', this.marker.getPosition().lat());

      // pan to location marker 
      App.world.map.panTo(this.marker.getPosition());

      // bounce marker
      $.publish('bounce:marker', [this.marker]);

      this.showInfoWindow();
    });
  },

  showInfoWindow: function () {
    var self      = this
      , pictures  = ''
      , count     = this.models.length
      , content   = '';

    this.each(function(user) {
      pictures += self.friendPictureTemplate(user.toJSON());
      // user.trigger('ui:highlight');
      // user.trigger('ui:fadeIn');
    });
  
    var tmpl_obj = {
      friend_count: count + ((count > 1) ?  ' friends ' : ' friend '),
      pictures: pictures
    };

    content = self.infoWindowTemplate(tmpl_obj);

    this.infoWindow.setContent('<div>' + content + '</div>');
    this.infoWindow.open(App.world.map, this.marker);
  },

  showFares: function () {

    App.Fares.getFareData(this.location, function (fares) {
      if (!fares.error) {
        var faresCollection = new App.FaresCollection(fares)
          , faresView       = new App.FaresView(faresCollection);
      }
    });
  }
});




// ================================ Fares ==============================

App.FareRowView = Backbone.View.extend({
  tagName: "tr",

  className: "fare-row",

  template: _.template($("#fares-template").html()),

  initialize: function () {
    // body
  },

  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
  
});



App.FaresView = Backbone.View.extend({
  el: $('#fares-section'),

  className: "shadow",

  initialize: function (fares) {
    this.addCollection(fares);
  },

  addCollection: function (collection) {
    collection.each(this.addOne);
    collection.bind('add', this.addOne, this);
  },

  addOne: function (fare) {
    var view = new App.FareRowView({ model: fare });
    this.$('tbody').append(view.render().el);
  }
});

App.FaresCollection = Backbone.Collection;
