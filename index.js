// Requires
var Firebase = require("firebase");
var Queue = require("firebase-queue");
var bodyParser = require('body-parser')
var express = require('express');
// End requires

// Init express
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));
/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
// End init express


// Init firebase
var initFirebase = function() {
  var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.PROJECT_ID + ".firebaseapp.com",
    databaseURL: "https://" + process.env.DATABASE_NAME + ".firebaseio.com",
    storageBucket: process.env.BUCKET + ".appspot.com",
    messagingSenderId: process.env.MESSAGING_SENDER_ID
  };
  Firebase.initializeApp(config);
}
initFirebase();
// End init firebase


// Firebase queue
//Database ref
var Database = Firebase.database();
var tripsRef = Database.ref('/trips');

// var queue = new Queue(queueRef, function (data, progress, resolve, reject) {
//   console.log(data);
//   // Database.ref(data.ref)
//   resolve();
// })
// End firebase queue

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/move', function(request, response) {
  var body = request.body;
  var tripRef = tripsRef.child(body.tripId);
  tripRef.once('value').then(function(tripSnapshot){
    var trip = tripSnapshot.val();
    if (!trip.points) {
      trip.points = [];
    }
    trip.points.push(body.point);
    var cost = Math.round((body.cost/1000.0) * 10 * 100) / 100
    trip.cost = cost;
    tripRef.update(trip);
    response.json({cost: cost});
  })
});

app.get('/newTrip', function(request, response){
  var key = tripsRef.push().key;
  tripsRef.child(key).update({
    startAt: new Date()
  })
  response.json({tripId: key});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


//Begin
//
//
//
//
// queueRef.child('tasks').push({
//   startPoint: 10,
//   endPoint: 20,
//   tripId: 1
// })
