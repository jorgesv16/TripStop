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
    	appState = "place-marker"
    });

    //event when user clicks map
	google.maps.event.addListener(map, 'click', function(event) {
		if (appState == "place-marker")
	   placeMarker(event.latLng);
	});


	//adds new markers, give them a click function and adds them to an array
	function placeMarker(location) {
		markerNum++; 
	    var marker = new google.maps.Marker({
	        position: location, 
	        map: map,
	        label: String(markerNum),
	        markerID: markerList.length
	    });

	    console.log(marker.position.lat());

	    markerList.push(marker);
	    console.log(markerList);

	    // function to get place info from markers
	    var newLocation = {lat: markerList[markerList.length-1].position.lat(), lng: markerList[markerList.length-1].position.lng()};
	    debugger;
	    // gas station search
		service.nearbySearch({
		  
		  	// get info on last pushed point
		    location: newLocation,
		    // location: {lat: 38.582, lng: -121.482},
		    // location: latlng,
		    radius: 5000,
		    type: ['gas_station']
		}, callback);
		// restaurant search
		// service.nearbySearch({
		  
		//   	// get info on last pushed point
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
	    markerList = [];
	    $("#gas-station-info").empty();
    });


	// if waypoint is selected, change route
	$(document.body).on('click', '#select', function() {
		debugger;
		waypts.push({
			location: address,
	        stopover: true
	    });
		
		calculateAndDisplayRoute(directionsService, directionsDisplay, $("#user-form-pointA").val(), $("#user-form-pointB").val(), address);
	})

	// if remove button is clicked, remove body
	$(document.body).on('click', '#remove', function() {
		
		// to remove marker on map
		// eval($(this).parent().data("markerID")).setMap(null);
		// to empty table row
		$(this).parentsUntil("tbody").empty();
		
	})
//end of init map
}

//function that takes inputs and updates the map with a route along with waypoints
function calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination, waypoints) {
	debugger;
	    directionsService.route({
	        origin: origin,
	        destination: destination,
	        waypoints: waypts,
	        optimizeWaypoints: true,
	        travelMode: 'DRIVING'
	        }, function(response, status) {
		        if (status === 'OK') {
		        	debugger;
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
	   		debugger;
	      	console.log(results[i]);
			
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
			debugger;
			// distance = results.placeid compares with point A placeid OR us results.geometry.location.lat()
			
			// rating func
			if (results[i].rating) {
				gasStationReviews = results[i].rating;
				ratingArr.push(gasStationReviews);
			}
			gasStations = "";

            gasStations = {};

            gasStations.gasName = results[i].name;
            gasStations.rating = results[i].rating;
            gasStations.place = results[i].place_id;

            gasList.push(gasStations);  
		}

		// rating averages
		var ratingArrLength = ratingArr.length;
		ratingArr = ratingArr.reduce((previous, current) => current += previous);
		ratingArr /= ratingArrLength;

		// dynamic dropdown creation
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

		tableTr = $("<tr>");
		tableTr.append("<td>" + markerNum + "</td>");
	    tableTr.append("<td>" + "distance" + "</td>");
	    tableTr.append("<td>" + ratingArr + "</td>");
	    tableTr.append("<td>" + dropDown[0].innerHTML + "</td>");
	    tableTr.append("<td id='restaurants'" + markerNum + "></td>");
	    tableTr.append("<td><button id='select' class='btn btn-info' type='button'>" + "select" + "</button><button id='remove' class='btn btn-danger' type='button'>" + "remove" + "</button></td>");
		
		// tableTr.data("markerID", marker);
		// append to html id train table
		$("#gas-station-info").append(tableTr);	
		debugger; 
		// to clear ratingArrLength 
		ratingArr = []; 
		gasList = []; 
	}
	else {
		alert:"ugh";
	}
}

// to add restaurants to page
// function callback2(results, status) {
//   	restaurantsArr = [];
//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//       	for (var i = 0; i < results.length; i++) {
//    		debugger;
//       	console.log(results[i]);
//       	restaurantsArr.push(results[i].name);
// 	else {
// 		alert:"ugh";
// 	}
// }

$(document.body).on('click', '.list-of-gas', function() {
	console.log(this);

	$("#restaurants" + markerNum + "").show();
	// service.nearbySearch({
	//    	// get info on last pushed point
	//     location: newLocation,
	//     // location: {lat: 38.582, lng: -121.482},
	//     // location: latlng,
	//     radius: 5000,
	//     type: ['restaurant']
	// }, callback2);	
})	