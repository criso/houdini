
client side 
============
  //- get user's current location
  /*- plot user on map*/
  /*- get user's friends*/
  /*- plot friends on map*/

  - on click display users under that pin
    - display which logged-in users are online
      (if there are 5 users under the same pin,
       we need to show which of the five is online)
      * The pin should still change color

  - fake initial location through the query string

  - on click on the map 
    - set a pin and create a overlay box
    - with input 
  - During this the other user should see the pin
    on their end


------------ when we place the icons on the map - they are set as offline



server side
============
  /*- mvc structure*/
    /*- controller*/

  

TDD
===============
- login with facebook

- Map
  - On Load 
    - we should get the _users_ location (browser)
    - a marker denoting the users location should be placed  
    - all _online_ users should have markers placed 
    - user disconnects 
      -if friend
        pin icon should change to offline
      -else
        pin should be removed 



    - Friends on Map
      - place a marker cluster denoting the region/state with quantity of friends
        - Boston, would have a marker showing 5 friends in Boston

  - Map Marker
    - on click 
      - should show info about users in that location





================
code
================
//- load FB
//- get user's location
//- plot user's home location
- store user's friends

=================
thoughts
================
annoucing the users let's me know of everyone who is connected
which solves the "who's online" problem 
- on client side and check the ids of my friends
  and compare it to the annouced ids to know who's 
  online


- UserA and UserB are online
  - when userA places a pin (UserB can see the pin being placed)
    - show a box with: "What would you like to do here?"
      - this box is essentially a chat room now
        - UserA types a message (userB can see) 
      
when users come online
  - Place pin on map
    - Grow notifications on top right 

- On infoWindow - use:
  http://docs.jquery.com/UI/Effects/Drop
  open
    $(this.div_).show("drop", { direction: "down" }, 300);
  close
		$(this.div_).hide("drop", { direction: "up" }, dropTime);




=================================
TODO --- in order of priority


  #click on the map
    - drop a pin

        - other users can comment on the input box
        - inline images
        - inline ref of TA urls using @hotel

  - clicking on a pin from a friend (different color)
    - should show a box with the friends and fares

  - grouping of pins made based on Locs
    


  
  - lose conception of online users vs. friends for now!
  - DON'T worry about disconnect
    - on disconnect remove pin (the end)



=========================================
test out collections (backbone js)


FB app data - Heroku
=======================
http://stormy-autumn-563.herokuapp.com/
http://localhost:3000





Chat on the Right
=================

client user                                                         |       server user
===========                                                         |       ============
- user click on the map
  - drop orange pin
    - Ask (what would like to do here?)
    - onEnter
      - attach infoBubble (permanent infowindow)                    |   - bounce marker and attach infoBubble
        with topic-title

  - Orange pin OnClick
    - show chat tab                                                     - show chat tab
    - chat is focused

  - Friend Pin OnClick
    - show info window with friends
    - chat is focused

  - user connects
    - show notification
