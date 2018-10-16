function AppModel(map) {
    const that = this;

    const bingMapKey = "Av5vuzFi-90pvKwVNrDHyGne9otjVjmQuy5Cl536IChqdNM7Wg_yO3yj3l1_c5VQ";
    const geoCodeApi = "http://dev.virtualearth.net/REST/v1/Locations/point";

    that.map = map;
    that.randomLocations = function (func) {
        const numOfPts = 7;
        const points = Microsoft.Maps.TestDataGenerator.getLocations(numOfPts, map.getBounds());
        let i = 0;
        const names = [
            "Star Park", "Gate to the Heaven", "Dark Portal",
            "Shikuka", "Jokureichi", "Book Store", "Shoe Store",
        ];
        const locations = [];
        points.forEach(function (point) {
            locations.push({
                name: names[i++],
                latitude: point.latitude,
                longitude: point.longitude,
            });
        });
        console.log(locations);
        func(locations);
    };

    return that;
}


function AppViewModel(map) {
    const that = this;
    const model = new AppModel(map);

    that.keyword = ko.observable("");
    that.locations = ko.observableArray([]);

    const pushins = [];
    model.randomLocations(function (locations) {
        locations.forEach(function (loc) {
            that.locations().push(loc);
            pushin = new Microsoft.Maps.Pushpin(loc);
            // pushin.setOptions({visible: false});
            map.entities.push(pushin);
            pushins.push(pushin);
        });
        console.log(pushins);
        console.log(that.locations());
    });
}

function initMap() {
    const map = new Microsoft.Maps.Map(document.getElementById('map'), {});
    ko.applyBindings(new AppViewModel(map));
}



