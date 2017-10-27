//keeps track of step of the process. We start on step "directions"
//steps: directions, place-marker, select-station
var appState= "directions";

//an array to keep track of all the markers
var markerList= [];

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
    	appState= "place-marker"
    });

    //event when user clicks map
	google.maps.event.addListener(map, 'click', function(event) {
		if (appState=="place-marker")
	   placeMarker(event.latLng);
	});

	//adds new markers, give them a click function and adds them to an array
	function placeMarker(location) {
	    var marker = new google.maps.Marker({
	        position: location, 
	        map: map,
	        markerID: markerList.length
	    });

	    console.log(marker.position.lat());

	    marker.addListener("click", function(event){
		});

	    markerList.push(marker);
	    console.log(markerList);
	}

//click event for clearing all markers.
    $("#clear-markers").on("click", function(event){
	    for(i=0; i<markerList.length; i++){
	        markerList[i].setMap(null);
	    }
	    markerList=[];
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