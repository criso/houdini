var App = window.App || {};

App.Fares = {

  airportUrl:   'http://awd-fb.dev5.airfarewatchdog.com/airports.php',
  fareUrl:      'http://awd-fb.dev5.airfarewatchdog.com/fares.php',


  // get an airport based on location
  // and return the object to the call back function
  getAirportData: function (location, _fn) {
    var self = this;


    $.getJSON(this.airportUrl, {location: location}, function (resp) {

      if (resp.error) { 
        return _fn({error: 'err'});
      }
      
      var airports = resp.results.airports
        , airport = airports[airports.length-1];

      var airport_location = {
        location_cluster: airport.code,
        position: {
          lat: airport.lat,
          lng: airport.lon
        }
      };

      _fn(airport_location);
    });


  },

  getFareData: function (location, _fn) {
    var self = this;

    $.getJSON(this.fareUrl, {location: location}, function (resp) {

      if (resp.error) { 
        return _fn({error: 'err'});
      }

      _fn(resp.results);

    });
  }

};















































































// var list = "<% _.each(people, function(name) { %> <li><%= name %></li> <% }); %>";
// _.template(list, {people : ['moe', 'curly', 'larry']});
// 
// 
// 
// 
// 
// var fares = [
//   {
//     price:  560,
//     trip:   'Flight from Boston to Las Vegas (BOS-LAS)',
//     date:   'Sun, Jul 24 - Tue, Jul 26',
//     airline: 'American Airlines'
//   }
//   , {
//     price: 561,
//     trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
//     date:  'Sun, Jul 24 - Thu, Jul 28',
//     airline: 'AirTran'
//   }
//   , {
//     price: 574,
//     trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
//     date: 'Sun, Jul 24 - Fri, Jul 29',
//     airline: 'Delta Air Lines'
//   }
//   , {
//     price: 543,
//     trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
//     date:  'Sun, Jul 24 - Tue, Jul 26',
//     airline: 'Delta Air Lines'
//   }
//   , {
//     price: 588,
//     trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
//     date:  'Sun, Jul 24 - Sat, Jul 30',
//     airline: 'American Airlines'
//   }
//   , {
//     price: 599,
//     trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
//     date: 'Sun, Jul 24 - Sun, Jul 31',
//     airline: 'Delta Air Lines'
//   }
// ];
// 
// 
// var fare_row = _.template(
//   "<tr>" + 
//     "<td><%= price %></td>" +
//     "<td><%= trip %></td>" +
//     "<td<%= date %>></td>" + 
//     "<td<%= airline %>></td>" +
//   "</tr>");
// 
// 
// 
