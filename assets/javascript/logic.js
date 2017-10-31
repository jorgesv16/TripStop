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
var appState = "place-marker";
//an array to keep track of all the markers
var markerNum = 0;
var markerList= [];
var ratingArr = [];
var gasStations = {};
var gasList = [];
var waypts = [];
//hide the info tables at the bottom
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
	// displays directions
	directionsDisplay.setMap(map);
	// must be defined for map to work 
	var service = new google.maps.places.PlacesService(map);
	// what happens when you submit you A and B points. Also shows/hides interface
	var onSubmitHandler = function() {
		// to make sure user points are vaid
        if ($("#user-form-pointA").val()!=""&&$("#user-form-pointB").val()!=""){
       		//update UI
       		$("#user-form-group").hide();
        	//Make Map
       		calculateAndDisplayRoute(directionsService, directionsDisplay, $("#user-form-pointA").val(), $("#user-form-pointB").val());
        }
    };
	//click event for making a route.
    $("#calculate-route").on("click", function(event){
    	event.preventDefault();
    	onSubmitHandler();
    	appState = "place-marker"
    });
    //event when user clicks map
	google.maps.event.addListener(map, 'click', function(event) {
		if (appState == "place-marker")
	    placeMarker(event.latLng);
	});
	//adds new markers, give them a click function and adds them to an array
	function placeMarker(location) {
		ratingArr = [];
		markerNum++; 
	    var marker = new google.maps.Marker({
	        position: location, 
	        map: map,
	        label: String(markerNum),
	        markerID: markerList.length
	    });
	    // push marker information to markerList
	    markerList.push(marker);
	    // function to get place info from markers
	    var newLocation = {lat: markerList[markerList.length-1].position.lat(), lng: markerList[markerList.length-1].position.lng()};
	    // gas station search
		service.nearbySearch({
		  	// get info on last pushed point
		    location: newLocation,
		    // radius in meters
		    radius: 3000,
		    // type it looks for are gas stations
		    type: ['gas_station']
		}, callback);
		// restaurant search
		service.nearbySearch({
		  	// get info on last pushed point
		    location: newLocation,
		    // radius in meters
		    radius: 3000,
		    // type it looks for are gas stations
		    type: ['restaurant']
		}, callback2);
	}
	//click event for clearing all markers.
    $("#clear-markers").on("click", function(event) {
	    for(i=0; i<markerList.length; i++){
	        markerList[i].setMap(null);
	    }
	    // waypts are essentially detours that the user can set up
	    waypts = [];
	    // markers are the actual objects that are created when user clicks map
	    markerList = [];
	    $("#gas-station-info").empty();
    });
	// if waypoint is selected, change route
	$(document.body).on('click', '#select', function() {
		var address = $(this).parent().parent().find("button").attr("data-place");
		console.log(address);
		waypts.push({
			location: address,
	        stopover: true
	    });
		// display the route on the map with waypoints
		calculateAndDisplayRoute(directionsService, directionsDisplay, $("#user-form-pointA").val(), $("#user-form-pointB").val(), address);
	})
	// if remove button is clicked, remove body
	$(document.body).on('click', '#remove', function() {
		$(this).parentsUntil("tbody").empty();
	})
	$(document.body).on('click', '.list-of-gas', function() {
		$(this).parent().parent().parent().find("#select").show();
    	$(this).parent().parent().find("button").text($(this).text());
    	$(this).parent().parent().find("button").attr("data-place", $(this).attr("data-place"));
		console.log($(this));
		numberForRestaurants = $(this).data("marker");
		if (restaurantsArr === "") {
			restaurantsArr = "No nearby restaurants"
		}
		else {
			restaurantsArr = restaurantsArr.join(" | ");
			$("#restaurants" + numberForRestaurants).text(restaurantsArr);
			// jQuery UI used
			$("#restaurants" + numberForRestaurants).effect("bounce", "slow");
		}	
	})	
//end of init map
}
//function that takes inputs and updates the map with a route along with waypoints
function calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination, waypoints) {
    directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            console.log('Directions request failed due to ' + status);
        }
    });
}
// appends info of gas station review, location, overall TripStop review, and collapse button including restaurant information
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
        	// results[i] is one gas station 
			address = results[i].vicinity;
			// if its open
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
			// rating func for tripStop overall review
			if (results[i].rating) {
				debugger;
				ratingArr.push(results[i].rating);
			}
			// to get info from gas stations such as names for dropdown button
            gasStations = {};
            gasStations.gasName = results[i].name;
            gasStations.rating = results[i].rating;
            gasStations.place = results[i].vicinity;
            gasList.push(gasStations);  
		}
		var dropDown = $("<div>");
        dropDown.addClass("dropdown");
        var btn = $("<button>");
        btn.attr({
        	"class": "btn btn-primary dropdown-toggle",
        	"type": "button",
        	"data-toggle": "dropdown"
        });
        btn.text("Choose a Gas Station");
        dropDown.append(btn);
        var dropList = $("<ul>");
        dropList.addClass("dropdown-menu scrollable-menu");
        // for the list of gas places, list their rating as well
		for (var i = 0; i < results.length; i++) {
			var listItem = $("<li>");
			listItem.addClass("list-of-gas");
			if (gasList[i].rating == undefined) {
				listItem.append(gasList[i].gasName + " | Rating: No Rating :( ");
			} else {
				listItem.append(gasList[i].gasName + " | Rating: " + gasList[i].rating);
			}
			listItem.attr({
				"data-place": gasList[i].place,
				"data-marker": markerNum
			});
			dropList.append(listItem);
		}
        // the droplist is added to the dropdown button
        dropDown.append(dropList);
        // appends data such as ratings and dropdown to html
		tableTr = $("<tr>");
		tableTr.append("<td>" + markerNum + "</td>");
	    tableTr.append("<td id='tripStopReview" + markerNum + "'></td>");
	    tableTr.append("<td>" + dropDown[0].innerHTML + "</td>");
	    tableTr.append("<td id='restaurants" + markerNum + "'></td>");
	    tableTr.append("<td><button id='select' class='btn btn-info' type='button'>✓</button><button id='remove' class='btn btn-danger' type='button'>X</button></td>");
		tableTr.find("#select").hide();
		// append to html id train table
		$("#gas-station-info").append(tableTr);	 
		// to clear ratingArrLength 
		// ratingArr = []; 
		gasList = []; 
	}
	else {
		console.log("No places found");
	}
}
// to add restaurants to page
function callback2(results, status) {
  	restaurantsArr = [];
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      	for (var i = 0; i < results.length; i++) {
	      	restaurantsArr.push(results[i].name + ": Rating " + results[i].rating);
	      	// to add on to review array
	      	if (results[i].rating) {
	      		ratingArr.push(results[i].rating);
	      	}	
	      	debugger;
	      	$("#restaurants" + markerNum).text("");
	    }
	    // averages ratings for overall review
		if (ratingArr) {
			var ratingArrLength = ratingArr.length;
			ratingArr = ratingArr.reduce((previous, current) => current += previous);
			ratingArr /= ratingArrLength;
			ratingArr = ratingArr.toFixed(2);
			console.log(ratingArr);
			$("#tripStopReview" + markerNum).text(ratingArr);
		}
		else {
			ratingArr = "No reviews";
		}
	}    	
	else {
		console.log("No places found");
	}
}