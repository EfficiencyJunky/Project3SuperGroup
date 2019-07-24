let selectedRoutes = {
  "2":   {"long_name":"SUTTER/CLEMENT",       "color": "red",       "has_rapid": false,   "has_express": 0,   "has_owl": false},
  "7":   {"long_name":"HAIGHT-NORIEGA",       "color": "blue",      "has_rapid": false,   "has_express": 1,   "has_owl": false},
  "14":  {"long_name":"MISSION",              "color": "yellow",    "has_rapid": false,   "has_express": 1,   "has_owl": false},  
  "38":  {"long_name":"GEARY",                "color": "pink",      "has_rapid": true,    "has_express": 2,   "has_owl": false},     
  "KT":  {"long_name":"INGLESIDE/THIRD",      "color": "purple",    "has_rapid": false,   "has_express": 0,   "has_owl": false},
  "M":   {"long_name":"OCEANVIEW",            "color": "green",     "has_rapid": false,   "has_express": 0,   "has_owl": true},
  "N":   {"long_name":"JUDAH",                "color": "orange",    "has_rapid": false,   "has_express": 1,   "has_owl": true}
};

let selectedRoutesList = ["2", "7", "14", "38", "KT", "M", "N"];
let selectedRoutesListColors = ["red", "blue", "yellow", "pink", "purple", "green", "orange"];

let earthquakes = {};
let significantEarthquakes = {};
let tectonicPlates = L.geoJson(tectonicPlatesGeoJSON, 
                                { 
                                  pane: 'tectonicPlatesPane',
                                  onEachFeature: (function (feature, layer) {
                                    layer.bindPopup(
                                      "<h3>" + feature.properties.PlateName + " Plate</h3>"
                                    );
                                  }),
                                  style: { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'orange' }
                                }
                              );


// let muniRoutesGeoJSONSelected = { 
//   "features": muniRoutesGeoJSON.features.map((feature) => {
//     if( selectedRoutesList.includes(feature.properties.name) ){
//       console.log("feature " + ": " + feature.properties.name);
//       return feature;
//     }
//   })
// }

muniRoutesGeoJSONFeaturesFiltered = muniRoutesGeoJSON.features.filter((feature) => {
  return selectedRoutesList.includes(feature.properties.name);
});


muniRoutesGeoJSONFiltered = muniRoutesGeoJSON;
muniRoutesGeoJSONFiltered.features = muniRoutesGeoJSONFeaturesFiltered;


console.log(muniRoutesGeoJSON);
console.log(muniRoutesGeoJSONFiltered);



// muniRoutesGeoJSONSelected.features.map((feature, i) => {
//   console.log("feature " + i + ": " + feature.properties.name);
// });


let muniRoutes = L.geoJson(muniRoutesGeoJSON, 
                                { 
                                  pane: 'muniRoutesPane',
                                  onEachFeature: (function (feature, layer) {
                                    if( selectedRoutesList.includes(feature.properties.name) ){
                                      layer.bindPopup(
                                        "<h3>" + feature.properties.name + " Muni Line</h3>"
                                      );
                                    }
                                  }),                                  
                                  // onEachFeature: (function (feature, layer) {
                                  //   layer.bindPopup(
                                  //     "<h3>" + feature.properties.name + " Muni Line</h3>"
                                  //   );
                                  // }),
                                  style: [
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'blue' },
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'orange' },
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'green' },
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'pink' },
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'purple' },
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'yellow' },
                                    { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'black' }
                                         ]
                                }
                              );


let numEarthquakeMaps = 2;
var myAsyncCounter = new asyncCounter(numEarthquakeMaps, createMap);



// **************** FUNCTIONS TO GET COLORS FOR CIRCLES BASED ON MAGNITUDE AND LEGEND ******************
function getColorNormal(d) {
  return d > 5.0  ? '#FF0000' :
         d > 4.0  ? '#ff6600' :
         d > 3.0  ? '#FFCC00' :
         d > 2.0   ? '#ccff00' :
         d > 1.0   ? '#66ff00' :
         d > 0.0   ? '#00FF00' :
                    '#00FF00';
}

function getColorSignificant(d) {
  return '#000000';
}

// ************************  API CALL FUNCTIONS TO CREATE THE EARTHQUAKE LAYERS ************************  
// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1989-10-15&endtime=1989-10-20";//&minmagnitude=2.5&minlatitude=20.0&maxlatitude=50.0&minlongitude=220.0&maxlongitude=300.0";
var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + getDateOneWeekAgo();// + "&endtime=" + today;//&minmagnitude=2.5&minlatitude=20.0&maxlatitude=50.0&minlongitude=220.0&maxlongitude=300.0";

// Perform a GET request to the query URL
d3.json(normalEarthquakesQueryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function along with color seting function and pane name
  earthquakes = createFeatures(data.features, getColorNormal, 'normalEarthquakesPane');
  
  myAsyncCounter.increment();

  console.log("earthquakes created");
  
  // Sending our earthquakes layer to the createMap function
  // createMap(earthquakes, tectonicPlates);
});


// Perform a GET request to the query URL
var significantEarthquakesQueryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";

d3.json(significantEarthquakesQueryURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  significantEarthquakes = createFeatures(data.features, getColorSignificant, 'significantEarthquakesPane');
  
  myAsyncCounter.increment();

  console.log("significant earthquakes created");

  // Sending our earthquakes layer to the createMap function
  // createMap(earthquakes, tectonicPlates);
});



// **************** FUNCTION TO CREATE THE FEATURES FOR EACH API CALL ******************
function createFeatures(earthquakeData, getColor, paneName) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" + feature.properties.place + "</h3>" +
      "<hr>" +
      "<p>" + new Date(feature.properties.time) + //"</p>" +
      "<br>" +
      // "<p>" + "Magnitude: " + feature.properties.mag + "</p>"
      "<b>" + "Magnitude: " + "</b>" + feature.properties.mag + "</p>"
    );
  }

  function createMarkers(feature, latlng) {

    let radius = feature.properties.mag * 3;
    //let color = "#ff7877";
    let color = getColor(feature.properties.mag);

    let geojsonMarkerOptions = {
      // these properties deligate the fill color and opacity
      pane: paneName,
      fillOpacity: 0.8,
      fillColor: color,
      // this properties sets the radius size DUH!
      radius: radius,
      // these properties create the black outline
      color: "#000",
      weight: 1,
      opacity: 1
    };

    return L.circleMarker(latlng, geojsonMarkerOptions);
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createMarkers
  });

  return earthquakes;

}


// **************** FUNCTION TO CREATE THE FINAL MAP LAYERS ******************
function createMap() {  
// function createMap(earthquakes, tectonicPlates) {

  // Define various map layers
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

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
  });  

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });  

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Outdoors": outdoors,
    "Satellite": satellite,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Significant: significantEarthquakes,
    TectonicPlates: tectonicPlates,
    MuniRoutes: muniRoutes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    // layers: [streetmap, earthquakes]
  });

  // set up our panes and zIndex ordering so they layer correctly when added and removed using the UI control layer
  myMap.createPane('normalEarthquakesPane');
  myMap.getPane('normalEarthquakesPane').style.zIndex = 400;

  myMap.createPane('significantEarthquakesPane');
  myMap.getPane('significantEarthquakesPane').style.zIndex = 401;
  
  myMap.createPane('tectonicPlatesPane');
  myMap.getPane('tectonicPlatesPane').style.zIndex = 398;

  myMap.createPane('muniRoutesPane');
  myMap.getPane('muniRoutesPane').style.zIndex = 399;

  streetmap.addTo(myMap);
  earthquakes.addTo(myMap);


  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      let div = L.DomUtil.create('div', 'info legend'),
          grades = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0],
          labels = [];
  
      div.innerHTML += '<b>Magnitude</b><br>';

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColorNormal(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      
      if(numEarthquakeMaps == 2){
        div.innerHTML += '<hr>' + '<i style="background:' + getColorSignificant(1) + '"></i> ' + "Significant";
      }

      return div;
  };
  
  legend.addTo(myMap);



}



// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************

// **************** GET THE DATE 7 DAYS AGO ******************
function getDateOneWeekAgo(){
  let todaysDate = new Date();
  let dd = String(todaysDate.getDate()).padStart(2, '0');
  let mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = todaysDate.getFullYear();
  
  let today = yyyy + '-' + mm + '-' + dd;
  // console.log("date:", today);
  
  let sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(todaysDate.getDate() - 7);
  let dd2 = String(sevenDaysAgoDate.getDate()).padStart(2, '0');
  let mm2 = String(sevenDaysAgoDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy2 = sevenDaysAgoDate.getFullYear();
  
  let sevenDaysAgoString = yyyy2 + '-' + mm2 + '-' + dd2;
  
  console.log("date 7 days:", sevenDaysAgoString);

  return sevenDaysAgoString;
}


// **************** ASYNCRONOUS COUNTER FUNCTIONS TO CONTROL WHEN WE CALL THE "createMap()" FUNCTION ******************
// **************** BECAUSE WE ONLY WANT TO CALL THIS FUNCTION AFTER ALL THE API CALLS HAVE COMPLETED *****************
function asyncCounter(numCalls, callback){
  this.callback = callback;
  this.numCalls = numCalls;
  this.calls = 0;
};

asyncCounter.prototype.increment = function(){

  this.calls += 1;

  if(this.calls === this.numCalls){
      this.callback();
  }
};