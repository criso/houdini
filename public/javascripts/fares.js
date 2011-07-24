var list = "<% _.each(people, function(name) { %> <li><%= name %></li> <% }); %>";
_.template(list, {people : ['moe', 'curly', 'larry']});





var fares = [
  {
    price:  560,
    trip:   'Flight from Boston to Las Vegas (BOS-LAS)',
    date:   'Sun, Jul 24 - Tue, Jul 26',
    airline: 'American Airlines'
  }
  , {
    price: 561,
    trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
    date:  'Sun, Jul 24 - Thu, Jul 28',
    airline: 'AirTran'
  }
  , {
    price: 574,
    trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
    date: 'Sun, Jul 24 - Fri, Jul 29',
    airline: 'Delta Air Lines'
  }
  , {
    price: 543,
    trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
    date:  'Sun, Jul 24 - Tue, Jul 26',
    airline: 'Delta Air Lines'
  }
  , {
    price: 588,
    trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
    date:  'Sun, Jul 24 - Sat, Jul 30',
    airline: 'American Airlines'
  }
  , {
    price: 599,
    trip: 'Flight from Boston to Las Vegas (BOS-LAS)',
    date: 'Sun, Jul 24 - Sun, Jul 31',
    airline: 'Delta Air Lines'
  }
];


var fare_row = _.template(
  "<tr>" + 
    "<td><%= price %></td>" +
    "<td><%= trip %></td>" +
    "<td<%= date %>></td>" + 
    "<td<%= airline %>></td>" +
  "</tr>");



