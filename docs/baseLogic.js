// inputs to the model
// line
// direction
// stop
// weekday
// time


/* ##################################################################################
   ****  EXECUTE API CALL, SETUP DEPENDENT VARIABLES AND CREATE INITIAL MAP STATE
##################################################################################### */

// we create an asyncronous counter that only calls the "createMap" function
// once the counter has been incremented enough times to equal the "numAPICalls" integer
// currently we are only doing this once so it's sort of not really useful
// but if we wanted to execute another API call we could update it
let numAPICalls = 1;
let numOtherProcesses = 0;
let myAsyncCounter = new asyncCounter(numAPICalls, createMap);


// ************************  API CALL FUNCTIONS TO GET THE SHAME SCORE DATA ************************  
// Store our API endpoint inside queryUrl
let queryUrl  = "";

let queryTime = parseQueryTime(userSelectedTime);

if(useActualAPIForQueries){
    // queryUrl = "https://muni-db-service.herokuapp.com/scores";
    queryUrl = "https://muni-db-service.herokuapp.com/scores?time=" + queryTime;
}
else{
    queryUrl = "https://jsonplaceholder.typicode.com/posts";
}

let APICallResponse = {};

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

    let uniqueMUNILinesFromAPICall = getUniqueMUNILinesFromAPICall();
    
    console.log("unique lines from API Call", uniqueMUNILinesFromAPICall);

    // replace the global variables we will use for MUNI line filtering with the unique set of muni lines from the API Call
    MUNILineNamesList = uniqueMUNILinesFromAPICall;
    userSelectedMUNILineList = uniqueMUNILinesFromAPICall;
    
    // populate the muniStopsGeoJSONFiltered object with only the stops that are present in the APICall Response 
    muniLinesGeoJSONFiltered = filterMuniLineGeoJSONfromAPICall();
    muniStopsGeoJSONFiltered = filterMuniStopGeoJSONfromAPICall();

    console.log("muniLinesGeoJSONFiltered", muniLinesGeoJSONFiltered.features);
    console.log("muniStopsGeoJSONFiltered", muniStopsGeoJSONFiltered);

    // once this is called, the "createMap()" function will be executed
    //createMap()
    myAsyncCounter.increment();

});

function getUniqueMUNILinesFromAPICall(){
    
    uniqueMUNILinesFromAPICall = [];
    
    APICallResponse.forEach((stop) =>{
        
        stop.lines.forEach((line) => {
            let lineName = line.line_ref;

            if(uniqueMUNILinesFromAPICall.includes(lineName) != true && originalMUNILineNamesList.includes(lineName)) {
                uniqueMUNILinesFromAPICall.push(lineName);
            }
        });

    });

    return uniqueMUNILinesFromAPICall;

}



// ************************ FILTER OUT THE MUNI STOPS WE WILL USE FOR LOCATION DISPLAY ************************  
// since the API call may return only a subset of the complete list of stops we have to choose from
// we want to filter out the list of MUNI Stops (which are in GeoJSON format and therefore allow us to place them on a map)
// from the "munistops.js" object based on what we get back from the API call
function filterMuniStopGeoJSONfromAPICall(){

  let muniStopsGeoJSONFiltered = muniStopsGeoJSON.features.filter((feature) => {
    // for each object in the muniStopsGeoJSON.features array
    // grab the stop ID
    let stopID = feature.properties.stopId;

    // console.log("stopiddddd", feature.properties.stopId);

    // now search through the APICallResponse to see if it contains this stop
    // this effectively acts as a search to find if that stop exists in the 
    // APICallResponse object.
    // There's probably a better way to search the APICallResponse to see
    // if it contains this stop, but this is how we are doing it for now
    let stopInfo =  APICallResponse.filter(function(stop) {
      return stop.stop_point_ref == stopID;
    });

    // since the filtered object is effectively a list with a single item (the stop)
    // then we can just test to see if that list's length is greater than 0
    // in doing so, we have said "this stopID exists in the APICallResponse"
    // so basically if the below statement returns "true", we will keep that
    // muniStop in our filtered list
    return stopInfo.length != 0;

  });

  return muniStopsGeoJSONFiltered;
}



// ************************ FILTER OUT THE MUNI LINES WE WILL USE FOR LOCATION DISPLAY ************************  
// since the API call may return only a subset of the complete list of LINES we have to choose from
// we want to filter out the list of MUNI LINES (which are in GeoJSON format and therefore allow us to place them on a map)
// from the "munilines.js" object based on what we get back from the API call
function filterMuniLineGeoJSONfromAPICall(uniqueMUNILinesFromAPICall){

    let muniLinesGeoJSONFiltered =  {   
        "type": "FeatureCollection",
        "meta": muniLinesGeoJSON.meta,
        "features": muniLinesGeoJSON.features.filter((feature) => {
                        return MUNILineNamesList.includes(feature.properties.name);
                    }) 
    };    
  
    return muniLinesGeoJSONFiltered;
}






/* ##################################################################################
   ****  CREATE INITIAL MAP STATE
##################################################################################### */
function createMap(){


    // *************************************************************
    //     FIRST DEFINE THE "TILE LAYERS" TO USE AS  
    //     THE ACTUAL MAPS WE WILL DRAW FEATURES ON TOP OF 
    // *************************************************************
    let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    let satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });  

    let outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: maximumZoom,
        minZoom: minimumZoom,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // *************************************************************
    // Define a baseMaps object to hold our base layers
    // *************************************************************
    let baseMaps = {
        "Street Map": streetmap,
        "Outdoors": outdoors,
        "Satellite": satellite,
        "Dark Map": darkmap
    };

    
    // *************************************************************
    //     SECOND DEFINE THE "DATA LAYERS" TO USE AS THE VISUAL 
    //     INFORMATION/DATA WE WILL DRAW ON TOP OF THE TILE LAYER 
    // *************************************************************
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
            let muniLineLineColor = MUNILinesInfo[muniLineName].color;
            return { fillOpacity: 0.0, weight: 2, opacity: 1, color: muniLineLineColor };
          }),
          filter: (function (feature) {
            let lineName = feature.properties.name;
            // let fakelines = ["2", "7", "14", "38", "KT", "J", "M"];
            return userSelectedMUNILineList.includes(lineName);
          })

        }
    );

    let muniStops = createFeatures(muniStopsGeoJSONFiltered, 'muniStopsPane');

    // *************************************************************
    // set up our panes and zIndex ordering so they layer correctly 
    // when added and removed using the UI control layer
    // the zIndex number will make sure they stack on eachother 
    // in the order we want them to
    // *************************************************************    
    myMap.createPane('muniLinesPane');
    myMap.getPane('muniLinesPane').style.zIndex = 399;

    myMap.createPane('muniStopsPane');
    myMap.getPane('muniStopsPane').style.zIndex = 400;
    
    
    // *************************************************************
    // Define the overlayMaps object to hold our overlay layers
    // *************************************************************
    let overlayMaps = {
        MuniLines: muniLines,
        MuniStops: muniStops
    };
    
    // *************************************************************
    //     ADD THE INITIALLY DISPALYED LAYERS TO THE MAP

    // *************************************************************
    // tile layer
    baseMaps["Street Map"].addTo(myMap);

    // muni data layers
    overlayMaps.MuniLines.addTo(myMap);
    overlayMaps.MuniStops.addTo(myMap);


    createUIElements(myMap, baseMaps, overlayMaps);
}



/* ##################################################################################
   ****  BUILD CONTROL LAYER UI ELEMENTS AND ADD TO MAP
##################################################################################### */

function createUIElements(myMap, baseMaps, overlayMaps){
  
    // *************************************************************
    //  ADD GENERIC CONTROL LAYER - Bottom Left
    //      Pass in our baseMaps and overlayMaps
    //      Add the control layer to the map on bottom left
    // *************************************************************

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        position: 'bottomleft'
    }).addTo(myMap);


    // *************************************************************
    //  ADD CONTROL ELEMENT TO ACT AS A LEGEND - Bottom right
    //      set the "onAdd" function to create some HTML to display
    // *************************************************************
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        let div = L.DomUtil.create('div', 'info legend');
        let grades = shameScoreInfoKeys.map((key) => {
            return shameScoreInfo[key].score;
        });
        //let grades = [1.0, 2.0, 3.0, 4.0, 5.0]
    
        div.innerHTML += '<b>SHAME SCORE</b><br>';
  
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColorNormal(grades[i]) + '"></i> ' +
                // grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                shameScoreInfoKeys[i] + (grades[i + 1] ? '<br>' : '');

        }
        
        if(showSignificantColor === true){
          div.innerHTML += '<hr>' + '<i style="background:' + getColorSignificant(1) + '"></i> ' + "Significant";
        }
  
        return div;
    };
    
    legend.addTo(myMap);

    // *************************************************************
    //  ADD CONTROL ELEMENTS WITH CHECKBOXES - Top right
    //      set the "onAdd" function to create the HTML
    //      that adds the checkboxes
    // *************************************************************
    // MUNI LINE CHECKBOX SELECTIONS
    let muniLineCheckBoxes = L.control({position: 'topright'});

    muniLineCheckBoxes.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');

        div.innerHTML = createMUNILineCheckboxDivHTML();
        return div;
    };

    muniLineCheckBoxes.addTo(myMap);      

    // INBOUND / OUTBOUND CHECKBOX SELECTIONS
    var directionCheckBoxes = L.control({position: 'topright'});

    directionCheckBoxes.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');

        div.innerHTML = createDirectionCheckboxDivHTML();
        return div;
    };

    directionCheckBoxes.addTo(myMap);


    //TIME OF DAY PICKER
    var timePickerElement = L.control({position: 'topleft'});

    timePickerElement.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');

        // div.innerHTML = 'Time Picker<br><input type="text" class="form-control js-time-picker" value="02:56">';
        div.innerHTML = 'Time Picker<br><input type="text" class="form-control js-time-picker" value="' + userSelectedTime + '">' ;
        return div;
    };

    timePickerElement.addTo(myMap);
    
    let timePicker = new Picker(document.querySelector('.js-time-picker'), {
        format: 'HH:mm',
        headers: true,
        text: {
          title: 'Pick a time',
        },
      });


    createEventHandlers();
}





/* ##################################################################################
   ****  SPECIFY EVENT HANDLERS
##################################################################################### */

function createEventHandlers(){
    d3.selectAll(".MuniLineCheckbox").on("change", updateMuniLineSelection);
    d3.selectAll(".MuniDirectionCheckbox").on("change", updateMuniDirectionSelection);
    d3.selectAll(".js-time-picker").on("change", timePickerEventHandler);
}
