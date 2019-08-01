/* ###################################################################
   ****  ALL OF OUR GLOBAL VARIABLES
###################################################################### */

let useActualAPIForQueries = true;

let shameScoreInfo = {
  "On time or early":       {"score":"1", "color":"#00FF00", "short_description": "No shame here!",       "description": "No shame here! Your bus is likely to be on time."},
  "0-5 min late":           {"score":"2", "color":"#66ff00", "short_description": "Mild shame.",          "description": "Mild shame. Your bus will be a little late, but you can probably make up the time with a brisk walk from the stop to your destination."},
  "5-10 min late":          {"score":"3", "color":"#ccff00", "short_description": "Medium shame.",        "description": "Medium shame. Better build some buffer, your bus will be late."},
  "10-20 min late":         {"score":"4", "color":"#FFCC00", "short_description": "High shame.",          "description": "High shame. Your bus will be pretty late. Hunker down and give up any hope of a timely arrival"},  
  "more than 20 min late":  {"score":"5", "color":"#FF0000", "short_description": "Maximum muni shame.",  "description": "Maximum muni shame. Your bus will be significantly late, better send out a preemptive apology that you’ll be late and start walking."}
};

let shameScoreInfoKeys = Object.keys(shameScoreInfo);

// DEFINE WHICH LINES WE WANT TO ADD TO THE MAP AND SOME METADATA FOR EACH OF THEM
let MUNILinesInfo = {
    "2":   {"long_name":"SUTTER/CLEMENT",       "vehicle": "bus",   "color": "rgba(144, 252, 249, 1)",       "has_rapid": false,   "has_express": 0,   "has_owl": false},
    "7":   {"long_name":"HAIGHT-NORIEGA",       "vehicle": "bus",   "color": "rgba(62, 146, 204, 1)",      "has_rapid": false,   "has_express": 1,   "has_owl": false},
    "14":  {"long_name":"MISSION",              "vehicle": "bus",   "color": "rgba(56, 145, 166, 1)",    "has_rapid": false,   "has_express": 1,   "has_owl": false},  
    "38":  {"long_name":"GEARY",                "vehicle": "bus",   "color": "rgba(42, 98, 143, 1)",      "has_rapid": true,    "has_express": 2,   "has_owl": false},     
    "KT":  {"long_name":"INGLESIDE/THIRD",      "vehicle": "tram",   "color": "rgba(218, 191, 255, 1)",    "has_rapid": false,   "has_express": 0,   "has_owl": false},
    "J":   {"long_name":"CHURCH",               "vehicle": "tram",   "color": "orange",    "has_rapid": false,   "has_express": 0,   "has_owl": false},  
    "M":   {"long_name":"OCEANVIEW",            "vehicle": "tram",   "color": "rgba(115, 113, 252, 1)",     "has_rapid": false,   "has_express": 0,   "has_owl": true},
    "N":   {"long_name":"JUDAH",                "vehicle": "tram",   "color": "rgba(189, 64, 137, 1)",    "has_rapid": false,   "has_express": 1,   "has_owl": true}
};

// CREATE A LIST OF JUST THE MUNI LINE NUMBERS FROM THE KEYS OF THE 'MUNILinesInfo' OBJECT ABOVE
let originalMUNILineNamesList = Object.keys(MUNILinesInfo);

let MUNILineNamesList = originalMUNILineNamesList;
let userSelectedMUNILineList = originalMUNILineNamesList;

// console.log("MUNILineNamesList", MUNILineNamesList);

let MUNIDirectionsList = ["Inbound", "Outbound"];
let userSelectedDirectionsList = MUNIDirectionsList;

let isNight = false;
let userSelectedTime = getCurrentTime();

// **************** GET THE DATE 7 DAYS AGO ******************
function getCurrentTime(){
  let todaysDate = new Date();

  let HH = String(todaysDate.getHours()).padStart(2, '0');
  let MM = String(todaysDate.getMinutes()).padStart(2, '0');
  
  let time = HH + ':' + MM;

  // console.log("hours", HH);

  // if the current hour is between 8pm and 6am, set isNight to true
  isNight = (HH <= 6 || HH >= 20);

  // console.log("isnight", isNight);
  // console.log("time", time);

  return time;
}

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

let selectedBaseMap = isNight ? "Dark Map" : "Street Map";

let muniLinesControlIsChecked = true;
let muniStopsControlIsChecked = true;

// Create our map using the div with id="map"
let myMap = L.map("map", {
    center: [37.75, -122.45], // san francisco
    zoom: 12
});