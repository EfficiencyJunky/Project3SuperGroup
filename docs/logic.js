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
// GEOJSON WITH ALL THE STOP LOCATIONS
/*
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates":  [ -122.39654,37.7932299 ]
      },
      "properties": {
        "stopId":17217,
        "title":"Embarcadero Station Outbound"
      }
    },
    etc...
  ]
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

function createFeatures(munistopData, paneName) {  
//function createFeatures(earthquakeData, getColor, paneName) {

  // Create a GeoJSON layer containing the features array oF the munistopData object
  // Run the onEachFeature function once for each piece of data in the array
  // and create a marker for each piece of data in the array
  let muniStops = L.geoJSON(munistopData, {
    onEachFeature: onEachFeature,
    pointToLayer: createMarkers,
    filter: filterMUNIStops
  });

  return muniStops;

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the muni stop and the lines it services
  function onEachFeature(feature, layer) {

    //abracadabra
    let stopId = feature.properties.stopId;
    let stopTitle = feature.properties.title;
    // let muniLine = feature.properties.Route;

    let stopInfo =  APICallResponse.filter(function(stop) {
      return stop.stop_point_ref == stopId;
    });

    // console.log(stopInfo.length, feature.properties.Route);
    // console.log("stops being used", stopInfo, feature.properties.Route, stopId);


    // if the stopID was found in the APICallResponse and there were no duplicate stop IDs found, then it will return an array with length 1
    if(stopInfo.length == 1){

      let direction = stopInfo[0].direction_ref;
      let lines = stopInfo[0].lines;

      layer.bindPopup(
        "<h3>" + "Stop ID: " + stopId + "</h3>" +
        "<h3>" + "Direction: " + direction + "</h3>" + 
        "<h3>" + "Title: " + stopTitle + "</h3>" + 
        linesInfo(lines)
      );

      // this function is used to generate the HTML for each line in the lines array
      function linesInfo(linesArray){

        let htmlBlock = "";
        
        linesArray.forEach((line) =>{

          let lineName =  line.line_ref;
          let minLate = line.scores.min_late;
          let shameScore = line.scores.prediction_label;

          if(userSelectedMUNILineList.includes(lineName)){
            htmlBlock +=  "<hr>" +
            "<p>" + 
              "<b>Line: </b>" + lineName + "<br>" +
              "<b>Seconds Late: </b>" + minLate + "<br>" +
              "<b>Shame Score: </b>" + shameScore +                          
            "</p>";

          }

        });
      
        return htmlBlock;
      }


    } else {
      layer.bindPopup(
        "<h3>" + "Stop ID: " + stopId + "</h3>" +
        "<hr>" +
        "<b>" + "Title: " + "</b>" + stopTitle + "</p>"
      );
    }
  }


  function createMarkers(feature, latlng) {

    let radius = muniStopCircleRadius;
    let circleColor = muniStopCircleColor;
    let circleOutlineColor = "#000";
    let circleOutlineWeight = 0.5;

    // grab the stop ID from this feature
    let stopId = feature.properties.stopId;

    // search the APICallResponse for that stop ID
    let stopInfo =  APICallResponse.filter(function(stop) {
      return stop.stop_point_ref == stopId;
    });

    // if the stopID was found in the APICallResponse and there were no duplicate stop IDs found, then it will return an array with length 1
    if(stopInfo.length == 1){

      let direction = stopInfo[0].direction_ref;
      let linesArray = stopInfo[0].lines;
      let lineName = "";

      let shameScores = [0];

      linesArray.forEach((line) =>{

        lineName =  line.line_ref;
        let minLate = line.scores.min_late;
        let shameScoreLabel = line.scores.prediction_label;

        // FIX THIS - use real shame score
        shameScores.push(Math.floor(Math.random() * Math.floor(7)));

      });

      let maxShameScore = Math.max(...shameScores);

      // FIX THIS - use real max shame score
      circleColor = MUNILinesInfo[lineName].color; 
      // circleColor = getColorNormal(maxShameScore);

      if(MUNILinesInfo[lineName].vehicle == "tram") {
        circleOutlineColor = 'white';
        circleOutlineWeight = 1.0;
      }
        
      // TODO -- make logic here to choose the color of the muni stop based on the highest visible shame score
      // getColorNormal(d)


    } else{
      radius = 200;
      circleColor = "black";
    }

    // if( MUNILineNamesList.includes(feature.properties.Route) ){
    //   let name = feature.properties.Route;
    //   circleColor = MUNILinesInfo[name].color;      
    // }

    let geojsonMarkerOptions = {
      // these properties deligate the fill color and opacity
      pane: paneName,
      fillOpacity: 0.8,
      fillColor: circleColor,
      // this properties sets the radius size DUH!
      radius: radius,
      // these properties create the circle outline
      color: circleOutlineColor,
      weight: circleOutlineWeight,
      opacity: 1
    };

    return L.circle(latlng, geojsonMarkerOptions);
  }


  function filterMUNIStops(feature) {

    //abracadabra
    let stopId = feature.properties.stopId;
    let stopTitle = feature.properties.title;

    let stopInfo =  APICallResponse.filter(function(stop) {
      return stop.stop_point_ref == stopId;
    });

    // if the stopID was found in the APICallResponse and there were no duplicate stop IDs found, then it will return an array with length 1
    if(stopInfo.length == 1){

      // now we need to see if the lines at this stop are in our user selected lines array
      // and if the direction is also in the user selected direction array
      let direction = stopInfo[0].direction_ref;
      
      let selectedLines = stopInfo[0].lines.filter(function(line) {
        return userSelectedMUNILineList.includes(line.line_ref);
      });

      if( (selectedLines.length > 0)){
        if(userSelectedDirectionsList.includes(direction)){return true;}
        else{return false;}
      } else{
        return false;
      } 
      

    } else {
        return true;
    }
  }


}


/* ###################################################################
   ****  FUNCTION TO CREATE THE ACTUAL MAP
   ****  AND ADD ALL THE LAYERS AND PANES TO IT
###################################################################### */
// **************** FUNCTION TO CREATE THE FINAL MAP LAYERS ******************
// function createMap2(myMap) {  
// function createMap(earthquakes, tectonicPlates) {

  // *************************************************************
  //     ADD UI ELEMENTS
  // *************************************************************


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

// }



// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************


function parseQueryTime(pickerValue){

  hour = parseFloat(pickerValue.split(":")[0]);
  minutes = parseInt(pickerValue.split(":")[1]);

  if(minutes < 15){
    return hour;
  } 
  else if(minutes >= 15 && minutes < 45 ){
    return hour + 0.5;
  }
  else{
    time = hour + 1.0;
    if(time > 23.5){
      return 0.0;
    }
    return hour + 1.0;
  }
  
}


/*
function getDateOneWeekAgo(){
  return "2019-07-20";
}

var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + getDateOneWeekAgo();
*/





// IF NEW TIME IS CHOSEN CALL THIS FUNCTION
/*
function updateTimeSelectionAndMakeAPICall(){

  // console.log("checkbox chosen");
  
  let choices = [];

  d3.selectAll(".MuniLineCheckbox").each( function(d) {
    
    // console.log("checkbox chosen 2");

    let cb = d3.select(this);

    if(cb.property("checked")){

      let chosenCheckBox = cb.property("value");

      // console.log("checkbox chosen: " + chosenCheckBox);

      choices.push(chosenCheckBox);
    }

  });

  let api_call_base = "/api/v1.0/advertiser_type"
  let item_key = "advertiser"

  let api_call = createAPICallString(api_call_base, item_key, choices);

  // console.log("Api Call == ", api_call);

  d3.json( api_call ).then((data) => {
    // displayData(data[0]);
    chartdata = data[0];
    comparison_data = data[2];
    gc_data = data[3];
    // buildCharts(chartdata, comparison_data);  
    buildCharts();  
    displayTableData(data[1]);

  });   


}
*/


// MUNI CHECKBOX HTML AND EVENT HANDLERS
function createMUNILineCheckboxDivHTML(){

  let HTMLString = '';

  MUNILineNamesList.forEach((line, i) => {

    if(userSelectedMUNILineList.includes(line)){
      //            '<input type="checkbox" class="MuniLineCheckbox" value="N" checked>N Line</br>'
      HTMLString += '<input type="checkbox" class="MuniLineCheckbox" value="' + line + '" checked> ' + line + ' Line</br>';
    } else{
      //            '<input type="checkbox" class="MuniLineCheckbox" value="N">N Line</br>'
      HTMLString += '<input type="checkbox" class="MuniLineCheckbox" value="' + line + '"> ' + line + ' Line</br>';
    }



  });

  return HTMLString;
}



function updateMuniLineSelection(){

  // console.log("checkbox chosen");
  
  let choices = [];

  d3.selectAll(".MuniLineCheckbox").each( function(d) {
    
    // console.log("checkbox chosen 2");

    let cb = d3.select(this);

    if(cb.property("checked")){

      let chosenCheckBox = cb.property("value");

      // console.log("checkbox chosen: " + chosenCheckBox);

      choices.push(chosenCheckBox);
    }

  });

  userSelectedMUNILineList = choices;

  // console.log("checkboxes chosen", MUNILineNamesList);



  //delete and re-create this map
  reCreateMap();

}

// DIRECTION CHECKBOX HTML AND EVENT HANDLERS
function createDirectionCheckboxDivHTML(){

  let HTMLString = '';

  MUNIDirectionsList.forEach((direction, i) => {

    if(userSelectedDirectionsList.includes(direction)){
      //            '<input type="checkbox" class="MuniLineCheckbox" value="N" checked>N Line</br>'
      HTMLString += '<input type="checkbox" class="MuniDirectionCheckbox" value="' + direction + '" checked> ' + direction + '</br>';
    } else{
      //            '<input type="checkbox" class="MuniLineCheckbox" value="N">N Line</br>'
      HTMLString += '<input type="checkbox" class="MuniDirectionCheckbox" value="' + direction + '"> ' + direction + '</br>';
    }

  });

  return HTMLString;
}


// abracadabra
function updateMuniDirectionSelection(){

  // console.log("checkbox chosen");
  
  let choices = [];

  d3.selectAll(".MuniDirectionCheckbox").each( function(d) {
    
    // console.log("checkbox chosen 2");

    let cb = d3.select(this);

    if(cb.property("checked")){

      let chosenCheckBox = cb.property("value");

      // console.log("checkbox chosen: " + chosenCheckBox);

      choices.push(chosenCheckBox);
    }

  });

  userSelectedDirectionsList = choices;

  // console.log("checkboxes chosen", userSelectedDirectionsList);



  reCreateMap();

}

// // **************** TIME PICKER EVENT HANDLER ******************
// // **************** TIME PICKER EVENT HANDLER *****************
function timePickerEventHandler(){

  pickerValue = this.value;
  userSelectedTime = pickerValue;

  queryTime = parseQueryTime(pickerValue);

  console.log("queryTime", queryTime);


  // let queryUrl = "https://muni-db-service.herokuapp.com/scores/" + pickerValue;
  let queryUrl  = "";

  if(useActualAPIForQueries){
      queryUrl = "https://muni-db-service.herokuapp.com/scores";
  }
  else{
      queryUrl = "https://jsonplaceholder.typicode.com/posts";
  }


  // Perform a GET request to the query URL
  d3.json(queryUrl, function(data) {
  // d3.json(normalEarthquakesQueryUrl, function(data) {
  
      // Once we get a response, send the data.features object to the createFeatures function along with color seting function and pane name
      if(useActualAPIForQueries){
        APICallResponse = data.results;
      }
      else{
        APICallResponse = shameScoreAPIResponse.results;
      }
  
      console.log("APICallResponse", APICallResponse);
  
      // populate the muniStopsGeoJSONFiltered object with only the stops that are present in the APICall Response 
      muniStopsGeoJSONFiltered = filterMuniStopGeoJSONfromAPICall();
  
      console.log("muniStopsGeoJSONFiltered", muniStopsGeoJSONFiltered);
  
      // once this is called, the "createMap()" function will be executed
      reCreateMap();
      // myAsyncCounter.increment();
  
  });

}








function reCreateMap(){

  let centerPosition = myMap.getCenter();
  let zoomLevel = myMap.getZoom();

  myMap.remove();

  myMap = L.map("map", {
    center: centerPosition, // san francisco
    zoom: zoomLevel
  });

  createMap();

}









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