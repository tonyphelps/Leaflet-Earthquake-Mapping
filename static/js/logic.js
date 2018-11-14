  // Store our API endpoint inside queryUrl
  var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  var boundaryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(queryUrl, function(edata) {
  
  d3.json(boundaryUrl, function(bdata) {
    var earthquakeData = edata.features
    var boundryData = bdata.features

    createFeatures(earthquakeData, boundryData)
  })

});

//create color ramp
function getColor(y) {
    return y < 1.0 ? '#87ff00' :
    y < 2.0 ? '#f0ff00' : 
    y < 3.0 ? '#ffce00' : 
    y < 4.0 ? '#ff9a00' : 
    y < 5.0 ? '#ff5a00':
    y < 6.0 ? '#fe1500':
    y < 7.0 ? '#8B0000':
        'black'
  
}

//calculate radius so that resulting circles will be proportional by area
function getRadius(y) {
    r = y * 5
    return r;
}

function style(feature) {
    return {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 0,
        fillOpacity: 0.8
    };
}

function createFeatures(earthquakeData, boundryData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" +  "Magnitude: " + feature.properties.mag + "</p>" +
      "<p>" + new Date(feature.properties.time) + "<p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, style(feature));
    }});
  
   // Create a GeoJSON layer containing the features array on the boundryData object
  var boundaries = L.geoJSON(boundryData, {
    pointToLayer: function (latlng){
      return L.polyline(latlng)
    }
  });

  boundaries.setStyle({
    color: 'red'
  });


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, boundaries);
};

function createMap(earthquakes, boundaries) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": boundaries
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      40, -95
    ],
    zoom: 4,
    layers: [streetmap, boundaries,  earthquakes]
  });


  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Set up the legend
  var legend = L.control({ position: "topright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [1,2,3,4,5,6,"7+"]
    var colors = ['#87ff00', '#f0ff00','#ffce00', '#ff9a00', '#ff5a00', '#fe1500','#8B0000']
    var labels = []
    var bgcolors = [];

    // Add min & max
    var legendInfo = "<h4>Magnitude</h4>"

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      bgcolors.push("<li style=\"background-color: " + colors[index] + "\"></li>")
    //   labels.push(`<li class=\"number\">${limits[index]}</li>`);
    });

    div.innerHTML += "<ul>" + bgcolors.join("") + "</ul>";
    div.innerHTML += "<ul class=\"num\">" + labels.join("") + "</ul>";

    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
}