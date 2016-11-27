function initMap() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
  }
  window.points = [];
  navigator.geolocation.getCurrentPosition(function(position){
    var center = {
      // lat: position.coords.latitude,
      // lng: position.coords.longitude
      lat: 30.081763,
      lng: 31.1838253
    }
    var map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      scrollwheel: false,
      zoom: 17
    });
    google.maps.event.addListener(map, 'click', function( event ){
      addPoint(event.latLng.lat(), event.latLng.lng(), map)
    });
  });
}

function addPoint(lat, lng, map) {
  if (!tripId) {
    return;
  }
  $("#begin-trip").html('End')
  window.points.push({
    lat: lat,
    lng: lng
  });
  if (window.points.length == 1) {
    window.marker = new google.maps.Marker({position: window.points[0],map: map,title: 'Start'});
    $.post("/move",{tripId: window.tripId,cost: 0,point: window.points[0]});
    return;
  } else {
    window.marker.setMap(null);
  }

  var directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });
  // Set destination, origin and travel mode.
  var request = {
    destination: window.points[window.points.length - 1],
    origin: window.points[window.points.length - 2],
    travelMode: 'DRIVING',
    waypoints: window.points.map(function(point){
      return {
        location: point,
        stopover: true
      }
    })
  };

  // Pass the directions request to the directions service.
  var directionsService = new google.maps.DirectionsService();
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      // Display the route on the map.
      directionsDisplay.setDirections(response);
      $.post('/move',{
        tripId: window.tripId,
        point: window.points[window.points.length - 1],
        cost: response.routes[0].legs.reduce(function(sum,leg){
          return sum + leg.distance.value;
        },0)
      }).done(function(response){
        $("#cost").html(response.cost + " SAR");
      })
    }
  });
}


$(function(){
  $("#begin-trip").on('click', function(){
    if ($(this).html() == 'End') {
      $(this).html('Trip ended, refresh for a new trip!');
      $.post('/end',{tripId: window.tripId});
      return;
    } else {
      $(this).html('Click on map for initial position');
      $.get('/newTrip').then(function(response){
        window.tripId = response.tripId;
      })
    }
  })
})
