/* ###################################################################
   ****  ALL OF OUR GLOBAL VARIABLES
###################################################################### */

let useActualAPIForQueries = false;


// DEFINE WHICH LINES WE WANT TO ADD TO THE MAP AND SOME METADATA FOR EACH OF THEM
let MUNILinesInfo = {
    "2":   {"long_name":"SUTTER/CLEMENT",       "color": "red",       "has_rapid": false,   "has_express": 0,   "has_owl": false},
    "7":   {"long_name":"HAIGHT-NORIEGA",       "color": "purple",      "has_rapid": false,   "has_express": 1,   "has_owl": false},
    "14":  {"long_name":"MISSION",              "color": "yellow",    "has_rapid": false,   "has_express": 1,   "has_owl": false},  
    "38":  {"long_name":"GEARY",                "color": "pink",      "has_rapid": true,    "has_express": 2,   "has_owl": false},     
    "KT":  {"long_name":"INGLESIDE/THIRD",      "color": "cyan",    "has_rapid": false,   "has_express": 0,   "has_owl": false},
    "J":   {"long_name":"CHURCH",               "color": "orange",    "has_rapid": false,   "has_express": 0,   "has_owl": false},  
    "M":   {"long_name":"OCEANVIEW",            "color": "green",     "has_rapid": false,   "has_express": 0,   "has_owl": true},
    "N":   {"long_name":"JUDAH",                "color": "blue",    "has_rapid": false,   "has_express": 1,   "has_owl": true}
  };

// CREATE A LIST OF JUST THE MUNI LINE NUMBERS FROM THE KEYS OF THE 'MUNILinesInfo' OBJECT ABOVE
let originalMUNILineNamesList = Object.keys(MUNILinesInfo);

let MUNILineNamesList = originalMUNILineNamesList;
let userSelectedMUNILineList = originalMUNILineNamesList;

console.log("MUNILineNamesList", MUNILineNamesList);

let MUNIDirectionsList = ["Inbound", "Outbound"];
let userSelectedDirectionsList = MUNIDirectionsList;

// ************************ FILTER THE MUNI LINES WE WANT TO DISPLAY BASED ON SELECTED MUNI LINES ************************  
// we need to create a version of the muniLinesGeoJSON object that only contains the 
// MUNI lines we care about as defined in the 'MUNILinesInfo' object above
// but we only want to replace the value of the "features" key and keep the other two keys values in tact
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


// FILTER THE "muniLinesGeoJSON" OBJECT TO ONLY GIVE US THE ONES WE HAVE SPECIFIED ABOVE
let muniLinesGeoJSONFiltered =  {};
// let muniLinesGeoJSONFiltered =  {   
//                                     "type": "FeatureCollection",
//                                     "meta": muniLinesGeoJSON.meta,
//                                     "features": muniLinesGeoJSON.features.filter((feature) => {
//                                                     return MUNILineNamesList.includes(feature.properties.name);
//                                                 }) 
//                                 };

// SETUP OTHER GLOBAL VARIABLES
let muniStopsGeoJSONFiltered = {}; // this will be filled out when the API Call returns

// muni stop circle default parameters
let muniStopCircleRadius = 20;
let muniStopCircleColor = "#ff7877";
// let muniStopCircleColor = "#ffffff";

// map parameters
let maximumZoom = 18;
let minimumZoom = 10;

// boolean that tells the legend to add a divider that shows a different color for "significant delays"
let showSignificantColor = false;


// Create our map using the div with id="map"
let myMap = L.map("map", {
    center: [37.75, -122.45], // san francisco
    zoom: 12
});