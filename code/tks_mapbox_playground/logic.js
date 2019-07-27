/* ###################################################################
   ****  ALL OF OUR GLOBAL VARIABLES
###################################################################### */

// ************************  API CALL FUNCTIONS TO DOWNLOAD ALL THE SHAME SCORE DATA ************************  
// Store our API endpoint inside queryUrl
let queryUrl = "https://muni-db-service.herokuapp.com/scores";
let APICallResponse = {};
APICallResponse = shameScoreAPIResponse.results;
console.log(APICallResponse);

// now we create an asyncronous counter that only calls the "createMap" function
// once the counter has been incremented enough times to equal the "numAPICalls" integer
// currently we are only doing this once so it's sort of not really useful
// but if we wanted to execute another API call we could update it
let numAPICalls = 1;
let myAsyncCounter = new asyncCounter(numAPICalls, createMap);

// muni stop circle default parameters
let muniStopCircleRadius = 20;
let muniStopCircleColor = "#ff7877";

// DEFINE WHICH LINES WE WANT TO ADD TO THE MAP AND SOME METADATA FOR EACH OF THEM
let selectedMUNILines = {
  "2":   {"long_name":"SUTTER/CLEMENT",       "color": "red",       "has_rapid": false,   "has_express": 0,   "has_owl": false},
  "7":   {"long_name":"HAIGHT-NORIEGA",       "color": "purple",      "has_rapid": false,   "has_express": 1,   "has_owl": false},
  "14":  {"long_name":"MISSION",              "color": "yellow",    "has_rapid": false,   "has_express": 1,   "has_owl": false},  
  "38":  {"long_name":"GEARY",                "color": "pink",      "has_rapid": true,    "has_express": 2,   "has_owl": false},     
  "KT":  {"long_name":"INGLESIDE/THIRD",      "color": "cyan",    "has_rapid": false,   "has_express": 0,   "has_owl": false},
  "J":   {"long_name":"CHURCH",               "color": "orange",    "has_rapid": false,   "has_express": 0,   "has_owl": false},  
  "M":   {"long_name":"OCEANVIEW",            "color": "green",     "has_rapid": false,   "has_express": 0,   "has_owl": true},
  "N":   {"long_name":"JUDAH",                "color": "blue",    "has_rapid": false,   "has_express": 1,   "has_owl": true}
};

// CREATE A LIST OF JUST THE MUNI LINE NUMBERS FROM THE KEYS OF THE 'selectedMUNILines' OBJECT ABOVE
const selectedMUNILineNamesList = Object.keys(selectedMUNILines);



// the GeoJSON object only has 3 key value pairs at the top level. it's structure looks like this
// you can fiew the full object here: https://transit.land/api/v1/routes.geojson?operated_by=o-9q8y-sfmta&per_page=false
/*
    {
      "features": [],
      "meta": {
        "sort_key": "id",
        "sort_order": "asc",
        "per_page": "false"
      },
      "type": "FeatureCollection"
    }
*/

// we need to create a version of the muniLinesGeoJSON object that only contains the 
// MUNI lines we care about as defined in the 'selectedMUNILines' object above
// but we only want to replace the value of the "features" key and keep the other two keys values in tact
let muniLinesGeoJSONFiltered = {};

muniLinesGeoJSONFiltered.features = muniLinesGeoJSON.features.filter((feature) => {
  return selectedMUNILineNamesList.includes(feature.properties.name);
});
muniLinesGeoJSONFiltered.meta = muniLinesGeoJSON.meta;
muniLinesGeoJSONFiltered.type = muniLinesGeoJSON.type;


let showSignificantColor = false;


/* ###################################################################
   ****  HELPER FUNCTIONS
###################################################################### */

// **************** FUNCTIONS TO GET COLORS FOR CIRCLES BASED ON SHAME SCORE AND LEGEND ******************
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



/* #################################################################################
   ****  FUNCTION TO CREATE THE FEATURES (popups and markers) FOR EACH MUNISTOP
#################################################################################### */
function createFeatures(munistopData, paneName) {  
//function createFeatures(earthquakeData, getColor, paneName) {


// GEOJSON WITH ALL THE STOP LOCATIONS
/*
  "features": {
    "type": string;
    "geometry": {
        "type": string;
        "coordinates": number[];
    };
    "properties": {
        "Route": string;
        "stopId": number;
        "title": string;
    };
  }[]
*/


// ARRAY OF STOP INFORMATION FROM API CALL
/*
{
  "direction_ref": "Inbound",
  "lines": [
    {
      "line_ref": "38",
      "scores": {
          "min_late": -42.5,
          "prediction_label": "tisk tisk"
      }
    },
    {
      "line_ref": "7",
      "scores": {
          "min_late": 45.705882352941174,
          "prediction_label": "tisk tisk"
      }
    }
  ],
  "stop_point_ref": 13089
}
*/

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the muni stop and the lines it services
  function onEachFeature(feature, layer) {

    let stopID = feature.properties.stopId;
    let muniLine = feature.properties.Route;

    let stopInfo =  APICallResponse.filter(function(stop) {
      return stop.stop_point_ref == stopID;
    });

    // console.log(stopInfo.length, feature.properties.Route);
    console.log(stopInfo, feature.properties.Route, stopID);

    if(stopInfo.length == 0){
      layer.bindPopup(
        "<h3>" + "Stop ID: " + stopID + "</h3>" +
        "<hr>" +
        // "<p>" + new Date(feature.properties.time) + //"</p>" +
        "<br>" +
        // "<p>" + "Magnitude: " + feature.properties.mag + "</p>"
        "<b>" + "Line: " + "</b>" + muniLine + "</p>"
      );
    }
    else {
      let stopInfoObj = stopInfo[0];

      let direction = stopInfoObj.direction_ref;
      let lines = stopInfoObj.lines;

      function linesInfo(linesArray){

        let htmlBlock = "";
      
        // let keys = Object.keys(linesArray[0]);

        // console.log("linesArray keys", keys);
        
        for(let i = 0; i < linesArray.length; i++){

          let lineName =  linesArray[i].line_ref;
          let minLate = linesArray[i].scores.min_late;
          // console.log("minLate", minLate);

          let predictionLabel = linesArray[i].scores.prediction_label;
          // console.log("predictionLabel", predictionLabel);
      
          htmlBlock +=  "<hr>" +
                        "<p>" + 
                          "<b>Line: </b>" + lineName + "<br>" +
                          "<b>Seconds Late: </b>" + minLate + "<br>" +
                          "<b>Shame Score: </b>" + predictionLabel +                          
                        "</p>";
          
        }
      
        return htmlBlock;
      }

      layer.bindPopup(
        "<h3>" + "Stop ID: " + stopID + "</h3>" +
        "<h3>" + "Direction: " + direction + "</h3>" + 
        linesInfo(lines)
      );
    }
  }


  function createMarkers(feature, latlng) {

    let radius = muniStopCircleRadius;
    let circleColor = muniStopCircleColor;

    if( selectedMUNILineNamesList.includes(feature.properties.Route) ){
      let name = feature.properties.Route;
      circleColor = selectedMUNILines[name].color;      
    }

    let geojsonMarkerOptions = {
      // these properties deligate the fill color and opacity
      pane: paneName,
      fillOpacity: 0.8,
      fillColor: circleColor,
      // this properties sets the radius size DUH!
      radius: radius,
      // these properties create the black outline
      color: "#000",
      weight: 0.5,
      opacity: 1
    };

    return L.circle(latlng, geojsonMarkerOptions);
  }


  // Create a GeoJSON layer containing the features array oF the munistopData object
  // Run the onEachFeature function once for each piece of data in the array
  // and create a marker for each piece of data in the array
  let muniStops = L.geoJSON(munistopData, {
    onEachFeature: onEachFeature,
    pointToLayer: createMarkers
  });

  return muniStops;

}


/* ###################################################################
   ****  FUNCTION TO CREATE THE ACTUAL MAP
   ****  AND ADD ALL THE LAYERS AND PANES TO IT
###################################################################### */
// **************** FUNCTION TO CREATE THE FINAL MAP LAYERS ******************
function createMap() {  
// function createMap(earthquakes, tectonicPlates) {

  // *************************************************************
  //     FIRST DEFINE THE "TILE LAYERS" TO USE AS  
  //     THE ACTUAL MAPS WE WILL DRAW FEATURES ON TOP OF 
  // *************************************************************
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

  // *************************************************************
  // Define a baseMaps object to hold our base layers
  // *************************************************************
  var baseMaps = {
    "Street Map": streetmap,
    "Outdoors": outdoors,
    "Satellite": satellite,
    "Dark Map": darkmap
  };

  // *************************************************************
  //     NOW CREATE OUR geoJson LAYERS FOR THE
  //     MUNI STOPS AND MUNILINES
  // *************************************************************  
  let muniStops = createFeatures(muniStopsGeoJSON.features, 'muniStopsPane');

  console.log(muniStopsGeoJSON.features);

  let muniLines = L.geoJson(muniLinesGeoJSONFiltered, 
    { 
      pane: 'muniLinesPane',
      onEachFeature: (function (feature, layer) {
          layer.bindPopup(
            "<h3>" + feature.properties.name + " Muni Line</h3>"
          );
      }),
      style:  (function (feature) {
        let muniLineName = feature.properties.name;
        let muniLineLineColor = selectedMUNILines[muniLineName].color;
        return { fillOpacity: 0.0, weight: 2, opacity: 1, color: muniLineLineColor };
      })
    }
  );



  // Create overlay object to hold our overlay layers
  var overlayMaps = {
    MuniStops: muniStops,
    MuniLines: muniLines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.75, -122.45
    ],
    zoom: 12,
    // layers: [streetmap, earthquakes]
  });

  // set up our panes and zIndex ordering so they layer correctly when added and removed using the UI control layer
  myMap.createPane('muniStopsPane');
  myMap.getPane('muniStopsPane').style.zIndex = 400;

  myMap.createPane('muniLinesPane');
  myMap.getPane('muniLinesPane').style.zIndex = 399;


  // add the initial tile layer
  streetmap.addTo(myMap);
  muniStops.addTo(myMap);
  muniLines.addTo(myMap);


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
  
      div.innerHTML += '<b>SHAME SCORE</b><br>';

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColorNormal(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      
      if(showSignificantColor === true){
        div.innerHTML += '<hr>' + '<i style="background:' + getColorSignificant(1) + '"></i> ' + "Significant";
      }

      return div;
  };
  
  legend.addTo(myMap);

  // map.on('zoomend', function() {
  //   var currentZoom = map.getZoom();

  //   if (currentZoom > 15) {
  //       muniStops.eachLayer(function(layer) {
  //         layer.set
  //         return layer.setIcon(ar_icon_2);
  //       });
  //   } 
  //   // else {
  //   //     muniStops.eachLayer(function(layer) {
  //   //         if (layer.feature.properties.num < 0.5)
  //   //             return layer.setIcon(ar_icon_1_double_size);
  //   //         else if (feature.properties.num < 1.0)
  //   //             return layer.setIcon(ar_icon_2_double_size);
  //   //     });
  //   // }
  // }  

  

}



// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************

// **************** GET THE DATE 7 DAYS AGO ******************
// function getDateOneWeekAgo(){
//   let todaysDate = new Date();
//   let dd = String(todaysDate.getDate()).padStart(2, '0');
//   let mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
//   let yyyy = todaysDate.getFullYear();
  
//   let today = yyyy + '-' + mm + '-' + dd;
//   // console.log("date:", today);
  
//   let sevenDaysAgoDate = new Date();
//   sevenDaysAgoDate.setDate(todaysDate.getDate() - 7);
//   let dd2 = String(sevenDaysAgoDate.getDate()).padStart(2, '0');
//   let mm2 = String(sevenDaysAgoDate.getMonth() + 1).padStart(2, '0'); //January is 0!
//   let yyyy2 = sevenDaysAgoDate.getFullYear();
  
//   let sevenDaysAgoString = yyyy2 + '-' + mm2 + '-' + dd2;
  
//   console.log("date 7 days:", sevenDaysAgoString);

//   return sevenDaysAgoString;
// }


// // **************** ASYNCRONOUS COUNTER FUNCTIONS TO CONTROL WHEN WE CALL THE "createMap()" FUNCTION ******************
// // **************** BECAUSE WE ONLY WANT TO CALL THIS FUNCTION AFTER ALL THE API CALLS HAVE COMPLETED *****************
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

/*
function getDateOneWeekAgo(){
  return "2019-07-20";
}

var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + getDateOneWeekAgo();
*/

// Perform a GET request to the query URL
// d3.json(queryUrl, function(data) {
// // d3.json(normalEarthquakesQueryUrl, function(data) {

//   // Once we get a response, send the data.features object to the createFeatures function along with color seting function and pane name
//   // earthquakes = createFeatures(data.features, getColorNormal, 'normalEarthquakesPane');
//   APICallResponse = data.results;
  
//   console.log(APICallResponse);

//   myAsyncCounter.increment();
//   console.log("finished API call");

// });


createMap();