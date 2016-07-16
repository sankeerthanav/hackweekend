var request = require('request');
var async = require('async');
var searchStays = require('./search_stays');
var polyline = require('polyline');

var findStaysFromLegs = function (req, res) {
    var stays = [];
    var params = [];

    var legs = req.body.legs;
    for (var leg in legs) {
        var steps = legs[leg].steps;
        for (var index in steps) {
            var step = steps[index];
            var distance = step.distance.value;
            var polylineEncoded = step.polyline.points;
            var latLngss = polyline.decode(polylineEncoded);
            for(var i in latLngss){
                var latLng = latLngss[i];
                params.push({lat: latLng[0], lng: latLng[1]});
            }
            var end_location = step.end_location;
            var lat = end_location.lat;
            var lng = end_location.lng;
            params.push({lat: lat, lng: lng});
        }
    }

    async.forEachOf(params, function (value, key, callback) {
        var lat = params[key].lat;
        var lng = params[key].lng;
        searchStays.findStays(lat, lng, 200, function (err, response) {
            if (!err) {
                stays.push(response.hits.hits);
                callback();
            }
        });
    }, function (err) {
        if (err) {
            console.error(err.message);
        } else {
            res.send(200, {"stays": stays});
        }
    })
};


var findRoute = function (req, res) {

    var baseUrl = "https://maps.googleapis.com/maps/api/directions/json";
    var API_KEY = "AIzaSyCV4F7s1JuDChWLGFG-2S5rmSbdGnOM2CI";

    var origin_place_id = req.query.origin;
    var destination_place_id = req.query.destination;

    request(baseUrl + '?origin=place_id:' + origin_place_id + '&destination=place_id:' + destination_place_id + '&key=' + API_KEY, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(JSON.parse(response.body));
        } else {
            res.send(500);
        }
    });
};

exports.findStaysFromLegs = findStaysFromLegs;
exports.findRoute = findRoute;