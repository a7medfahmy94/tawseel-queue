// Requires
var express = require('express');
var firebase = require('firebase');
var Queue = require('firebase-queue');
// End requires

// Init express
var app = express();
app.set('port', 7000);

app.listen(7000);

var config = {
  apiKey: 'AIzaSyDn_NMUsa9sVsYm19ApwK2U8juSC1PYLfM',
  authDomain: "tawseel-37034.firebaseapp.com",
  databaseURL: "https://tawseel-37034.firebaseio.com",
  storageBucket: "tawseel-37034.appspot.com",
  messagingSenderId: "534910965048"
};
firebase.initializeApp(config);

var database = firebase.database();
var queueRef = database.ref('/queue');

var queue = new Queue(queueRef, function (data, progress, resolve, reject) {
  database.ref('/trips/' + data.tripId).once('value', function(snapshot){
    var trip = snapshot.val();
    console.log(trip.logs);
    var distanceKM = 0;
    var sarPerKM = 10;
    var points = []
    for (var key in trip.logs) {
      var log = trip.logs[key];
      points.push(log.point);
    }
    for (var i = 1; i < points.length; i++) {
      var p1 = points[i-1];
      var p2 = points[i];
      distanceKM += getDistanceFromLatLonInKm(p1.lat, p1.lng, p2.lat, p2.lng);
      console.log(distanceKM);
    }
    var totalTripCost = (sarPerKM * distanceKM).toFixed(2);
    database.ref('/trips/' + data.tripId + '/cost').set(totalTripCost);
    resolve();
  })
})

// see http://stackoverflow.com/a/27943/4077057
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
