var esClientHandler = require('./es_client');

var findPoi  = function (client, lat, lng, radius, callback) {
    client.search({
        index: 'search',
        type: 'szpoi',
        requestTimeout: 50000000,
        body: {
            query: {
                filtered: {
                    query: {
                        match_all: {}
                    },
                    filter: {
                        geo_distance_range: {
                            from: "0km",
                            to: "5km",
                            location : {
                                lat: lat,
                                lon: lng
                            }
                        }
                    }
                }
            }
        }
    }, function (error, response) {
        if (error) {
            console.log(error);
            callback(error, []);
        }
        else {
            console.dir(response);
            callback(null, response);
        }
    });
    return;
};
var getUserPoi = function (req, res) {
    var esClient = esClientHandler.get();
    var lat = req.query.lat;
    var lng = req.query.lng;
    var radius = req.query.radius;

    findPoi(esClient, lat, lng, radius, function (err, response) {
        if (err) {
            res.send(500, {error: err.message});
        }
        else {
            res.send(200, {
                "stays": response.hits.hits
            })
        }
    });
};
exports.getUserPoi = getUserPoi;