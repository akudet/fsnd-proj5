/**
 * model part of our up, it will model Location, and foursquare venus api get venus info
 * @param map Map class in Bing Maps V8 Map Control
 * @returns {AppModel}
 * @constructor
 */
function AppModel(map) {
    /**
     * location model of our app
     * @param name name of the location
     * @param latitude latitude of the location
     * @param longitude longitude of the location
     * @returns {Location}
     * @constructor
     */
    function Location(name, latitude, longitude) {
        let that = this;

        that.name = name;
        that.latitude = latitude;
        that.longitude = longitude;
        that.venues = null;

        const clientId = "PNQL0ZGB5IRITOMTM1ENVFGAFZJGW40D3CJEIHQYHYRULZEQ";
        const clientSecret = "RWYFSR4MMVHGTURC0V0FWA2NO3GMD1AELILQGTLXALM1XJ3M";
        const param = "?ll=" + this.latitude + "," + this.longitude + "&client_id=" + clientId + "&client_secret=" + clientSecret;
        const foursquareApi = "https://api.foursquare.com/v2/venues/search" + param + "&v=20181010";

        that.getVenues = function (callback) {
            if (that.venues) {
                callback(that.venues);
                return;
            }
            $.getJSON(foursquareApi, function (data) {
                that.venues = data.response.venues;
                callback(that.venues);
            })
        };

        return that;
    }

    const that = this;

    that.map = map;
    that.randomLocations = function () {
        const numOfPts = 7;
        const points = Microsoft.Maps.TestDataGenerator.getLocations(numOfPts, that.map.getBounds());
        let i = 0;
        const names = [
            "Star Park", "Gate to the Heaven", "Dark Portal",
            "Shikuka", "Jokureichi", "Book Store", "Shoe Store",
        ];
        const locations = [];
        points.forEach(function (point) {
            locations.push(new Location(names[i++], point.latitude, point.longitude));
        });
        return locations;
    };

    return that;
}


function AppViewModel(map) {
    const that = this;
    const model = new AppModel(map);

    // the keyword user may want to use to filter locations
    that.keyword = ko.observable("");
    // all locations out model will have
    that.locations = ko.observableArray(model.randomLocations());
    // the location user may interested(which location will show a detailed info box)
    // it will be set to the location that user click in the list location view, or a pushin in map
    that.currLocation = ko.observable(null);
    // subset of all locations which we what to show
    // currently it will be shown using a list view and pushins in map
    that.filteredLocations = ko.computed(function () {
        let keyword = that.keyword().toLowerCase();
        return ko.utils.arrayFilter(that.locations(), function (location) {
            return -1 !== location.name.toLowerCase().indexOf(keyword);
        });
    }, that);

    // infobox used to show location detail
    const infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false
    });
    infobox.setMap(map);

    that.currLocation.subscribe(function (newValue) {
        if (newValue) {
            let pt = new Microsoft.Maps.Location(newValue.latitude, newValue.longitude);
            infobox.setOptions({
                location: pt,
                title: newValue.name,
                description: "loading",
                visible: true
            });
            newValue.getVenues(function (venues) {
                let description = "no venue found";
                if (venues.length > 0) {
                    description = venues[0].name
                }
                infobox.setOptions({
                    description: description,
                });
            });
        }
    });

    that.locationItemClicked = function (loc) {
        that.currLocation(loc);
    };

    function pushpinClicked(e) {
        that.currLocation(e.target.metadata.locationItem);
    }

    // update pushins when filtered locations changed
    let updatePushins = function () {
        map.entities.clear();
        that.filteredLocations().forEach(function (loc) {
            let pushin = new Microsoft.Maps.Pushpin(loc);
            pushin.metadata = {
                locationItem: loc
            };
            map.entities.push(pushin);
            Microsoft.Maps.Events.addHandler(pushin, "click", pushpinClicked);
        })
    };
    that.filteredLocations.subscribe(function () {
        updatePushins();
    });
    updatePushins();
}

function initMap() {
    const map = new Microsoft.Maps.Map(document.getElementById("map"), {});
    ko.applyBindings(new AppViewModel(map));
}



