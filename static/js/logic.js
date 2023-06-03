let basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
        attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

var themap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// create map object
let myMap = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3,
    layers: [basemap]
});

basemap.addTo(myMap);

var baseMaps = {
    "Global Map": basemap,
    "Global Blue": themap,

};

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
};

L.control.layers(baseMaps, overlays, {
    collapsed: false
}).addTo(myMap);

// store the api query variables
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// get the data with d3
d3.json(url).then(function (response) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    L.geoJson(response, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: styleInfo,
        // We create a popup for each marker to display the magnitude and location of

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature.properties.mag
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Location: "
                + feature.properties.place
            );
        }

    }).addTo(earthquakes);


    earthquakes.addTo(myMap)

    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: "
                + colors[i]
                + "'></i> "
                + grades[i]
                + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    legend.addTo(myMap)

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
       L.geoJson(platedata, {
      color: "orange",
      weight: 2
    }).addTo(tectonicplates);

   
    tectonicplates.addTo(myMap);
  });

});



