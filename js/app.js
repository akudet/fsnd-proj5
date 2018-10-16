function AppModel(map) {
    function Location(name, latitude, longitude) {
        let that = this;

        that.name = name;
        that.latitude = latitude;
        that.longitude = longitude;

        return that;
    }

    const that = this;

    that.map = map;
    that.randomLocations = function (func) {
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
        func(locations);
    };

    return that;
}


function AppViewModel(map) {
    const that = this;
    const model = new AppModel(map);

    that.keyword = ko.observable("");
    that.locations = ko.observableArray([]);

    model.randomLocations(function (locations) {
        locations.forEach(function (loc) {
            that.locations().push(loc);
        });
    });

    that.filteredLocations = ko.computed(function () {
        let keyword = that.keyword().toLowerCase();
        return ko.utils.arrayFilter(that.locations(), function (location) {
            return -1 !== location.name.toLowerCase().indexOf(keyword);
        });
    }, that);

    let updatePushins = function () {
        map.entities.clear();
        that.filteredLocations().forEach(function (loc) {
            let pushin = new Microsoft.Maps.Pushpin(loc);
            map.entities.push(pushin);
        })
    };

    that.filteredLocations.subscribe(function () {
        updatePushins();
    });

    updatePushins();
}

function initMap() {
    const map = new Microsoft.Maps.Map(document.getElementById('map'), {});
    ko.applyBindings(new AppViewModel(map));
}



