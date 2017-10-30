// Initialize Firebase
var config = {
    apiKey: "AIzaSyDEnV-n5umJb0UsHTXkfWpzeXeozNhi50Y",
    authDomain: "tripstop-c8d7e.firebaseapp.com",
    databaseURL: "https://tripstop-c8d7e.firebaseio.com",
    projectId: "tripstop-c8d7e",
    storageBucket: "tripstop-c8d7e.appspot.com",
    messagingSenderId: "942613125163"
};
firebase.initializeApp(config);
//keeps track of step of the process. We start on step "directions"
//steps: directions, place-marker, select-station
var appState= "place-marker";
var markerNum= 0;
//an array to keep track of all the markers
var markerList= [];
var gasStations = {};
var ratingArr = [];
var gasList = [];
//hide the info tables at the bottom
//$("#map-placement").css("display", "none");
$("#trip-info").hide();
//sets up the map
function initMap() {
    // Instantiate a directions service.
    var directionsService = new google.maps.DirectionsService;
    // Create a renderer for directions and bind it to the map.
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
    // Create a map.
    var map = new google.maps.Map(document.getElementById("map"), {
          zoom: 13,
          center: {lat: 37.872133, lng: -122.271146}
    });
    directionsDisplay.setMap(map);
    var service = new google.maps.places.PlacesService(map);
    // var infowindow = new google.maps.InfoWindow();
    // var geocoder = new google.maps.Geocoder;
    // what happens when you submit you A and B points. Also shows/hides interface
    var onSubmitHandler = function() {
        if ($("#user-form-pointA").val()!=""&&$("#user-form-pointB").val()!=""){
            //update UI
            //$("#map-placement").css("display", "inline");
            $("#user-form-group").hide();
            $("#trip-info").show();
            //Make Map
            calculateAndDisplayRoute(directionsService, directionsDisplay, $("#user-form-pointA").val(), $("#user-form-pointB").val());
        }
    };
    //click event for making a route.
    $("#calculate-route").on("click", function(event){
        event.preventDefault();
        onSubmitHandler();
        appState= "place-marker";
    });
    //event when user clicks map
    google.maps.event.addListener(map, 'click', function(event) {
        if (appState=="place-marker")
       placeMarker(event.latLng);
    });
    //  // string that will show when marker is clicked
    // var contentString = "info about the place";
    //   // infowindow allows a window to appear when marker is placed
    // var infowindow = new google.maps.InfoWindow({
    //     content: contentString
    // });
    
    //adds new markers, give them a click function and adds them to an array
    function placeMarker(location) {
        markerNum++; 
        var marker = new google.maps.Marker({
            position: location, 
            map: map,
            label: String(markerNum),
            markerID: markerList.length
        });

        // when marker is clicked, do this
        marker.addListener("click", function(event){
        // this creates an infowindow when the marker is set
        // infowindow.setContent(place.name);
        // infowindow.open(map, marker);
        });
        
        // geocoder stuff, may not be necessary
        // latitude=marker.getPosition().lat();               
        // longitude=marker.getPosition().lng();
        // var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
        // geocoder.geocode({'location': latlng}, function(results, status) {
        //     if (status === google.maps.GeocoderStatus.OK) {
        //       if (results[1]) {
        //         console.log(results[1].place_id);
        //       } else {
        //         window.alert('No results found');
        //       }
        //     } else {
        //       window.alert('Geocoder failed due to: ' + status);
        //     }
        //   });        
        markerList.push(marker);
        //console.log(markerList);
        // ENTIRE PLACE FUNC
        // function to get place info from markers
        var newLocation = {lat: markerList[markerList.length-1].position.lat(), lng: markerList[markerList.length-1].position.lng()};
        // debugger;
        // gas station search
        service.nearbySearch({
          
            // get info on last pushed point
            location: newLocation,
            // location: {lat: 38.582, lng: -121.482},
            // location: latlng,
            radius: 10000,
            type: ['gas_station']
        }, callback);
        gasStations = {};




          // restaurant search
        // service.nearbySearch({
          
        //     // get info on last pushed point
        //     location: newLocation,
        //     // location: {lat: 38.582, lng: -121.482},
        //     // location: latlng,
        //     radius: 1000,
        //     type: ['restaurant']
        // }, callback2);



    }
//click event for clearing all markers.
    $("#clear-markers").on("click", function(event){
        for(i=0; i<markerList.length; i++){
            markerList[i].setMap(null);
        }
        markerList=[];
        $("#gas-station-info").empty();
    });
//end of init map
}
//function that takes inputs and updates the map with a route
function calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination) {
        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
}
// appends info of gas station review, location, overall TripStop review, and collapse button including restaurant information
function callback(results, status) {

    
    
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            // results[i] is one gas station 
            //debugger;
            //console.log(results[i]);
            
            address = results[i].vicinity;
            if ("opening_hours" in results[i]){
                if (results[i].opening_hours.open_now) {
                    open = "Open Now";
                }
                else {
                    open = "Not Open";
                }
            }
            else {
                open = "Call number to check hours"; 
            }   
            //debugger;
            // distance = results.placeid compares with point A placeid OR us results.geometry.location.lat()
            
            // rating func
            if (results[i].rating) {
                gasStationReviews = results[i].rating;
                ratingArr.push(gasStationReviews);
            }
            // name of gas stations

            //debugger;
            // gasStations = {result[i].name: [results[i].rating, open, results[i].place_id]};

            // gasStations = results[i].name + ", Rating: " + results[i].rating;
            // gasList.push(gasStations);

            // console.log(gasStations);
            // console.log(gasList);
            gasStations = "";

            gasStations = {};

            gasStations.gasName = results[i].name;
            gasStations.rating = results[i].rating;
            gasStations.place = results[i].place_id;

            gasList.push(gasStations);

            

            
        }
        // console.log(gasList);

        // markerList.push({markerID: markerNum, gasList: gasList, markerRef: marker});
        

        // console.log(markerList);

        // rating averages
        var ratingArrLength = ratingArr.length;
        ratingArr = ratingArr.reduce((previous, current) => current += previous);
        ratingArr /= ratingArrLength;
        // for firebase
        // database.ref().push ({
            // stationNameRef: stationNameRef,
            // addressRef: address,
            // distanceRef: distance,
            // ratingRef: rating,
         
        // });  


        // remove = $("<button>");
        // remove.attr({
        //     "type": "button",
        //     "class": "btn btn-danger",
        //     "id": "remove"
        // })  
        // remove.text("X");
        // to make a new row for when place data is retrieved

        var dropDown = $("<div>");
        dropDown.addClass("dropdown");
        var btn = $("<button>");
        btn.attr("class", "btn btn-primary dropdown-toggle");
        btn.attr("type", "button");
        btn.attr("data-toggle", "dropdown");
        btn.text("Choose a Gas Station");
        dropDown.append(btn);
        var dropList = $("<ul>");
        dropList.addClass("dropdown-menu");

        for (var i = 0; i < results.length; i++) {
            var listItem = $("<li>");
            listItem.addClass("list-of-gas");
            listItem.append(gasList[i].gasName + ", Rating: " + gasList[i].rating);
            listItem.attr("data-place", gasList[i].place);
            dropList.append(listItem);
        }

        dropDown.append(dropList);
        //$("#drop").append(dropDown);

        console.log(dropDown);


        tableTr = $("<tr>");
        tableTr.append("<td>" + markerNum + "</td>");
        tableTr.append("<td>" + "distance" + "</td>");
        tableTr.append("<td>" + ratingArr + "</td>");
        tableTr.append("<td>" + dropDown[0].innerHTML + "</td>");
        //tableTr.append("<td>" + remove + "</td>");
        
        // tableTr.data("markerID", marker);
        // append to html id train table
        $("#gas-station-info").append(tableTr);  
        ratingArr = []; 
        gasList = [];
        
        //debugger;    
    }
    else {
        alert:"ugh";
    }
}

function callback2(results, status) {
    
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {

        // console.log(results[i]);
        // rating = results.rating;
          
      }
    }
    else {
        alert:"ugh";
    }
}


$(document).on('click', '.list-of-gas', function() {
    console.log(this);
});

