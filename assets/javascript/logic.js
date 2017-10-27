
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

	var onClickHandler = function() {
        if ($("#user-form-pointA").val()!=""&&$("#user-form-pointB").val()!=""){
       	console.log($("#user-form-pointA").val());
       	calculateAndDisplayRoute(directionsService, directionsDisplay, $("#user-form-pointA").val(), $("#user-form-pointB").val());
        }
    };

    $("#calculate-route").on("click", onClickHandler());
}

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

