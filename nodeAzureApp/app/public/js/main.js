
var map
var MyLayers = {}; // Globally scoped object
//Note that the typeahead parameter is set to true.
var geocodeServiceUrlTemplate = 'https://atlas.microsoft.com/search/{searchType}/json?typeahead=true&subscription-key={subscription-key}&api-version=1&query={query}&language={language}&lon={lon}&lat={lat}&countrySet={countrySet}&view=Auto';
// Use SubscriptionKeyCredential with a subscription key
var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

// Use subscriptionKeyCredential to create a pipeline
var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);

// Construct the SearchURL object
var searchURL = new atlas.service.SearchURL(pipeline);

function GetMap() {
    console.log("we made it")
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        // center: [-98.493928, 38.096798],
        // zoom: 4,
        // view: "Auto",
        center: [-94.6, 39.1],
        zoom: 3,
        view: 'Auto',
        style: 'grayscale_dark',
        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'TfUWvWqVnTGKGMcIvxr5coNt7eiWrKxh6wJe0keVZSs'
        }
    });
    

    //Wait until the map resources are ready.

    map.events.add('ready', function () {
        mapControls()
        drawingTools();
        mapSearch();
        // simpleChoropleth
        $("#simpleChoropleth").click(function () {
          var x = document.getElementsByClassName("choroplethInfo")[0].style.display;
          if ($(this).is(":checked")) {
            $('.choroplethInfo').css({ display: "block" });
            addChoropleth();
            createLegend('legend');
          } else {
            $('.choroplethInfo').css({ display: "none" });
            $("#legendItem").remove();
            removeLayer(MyLayers.choroplethLayer)          }
        });
        // extrudedChoropleth
        $("#extrudedChoropleth").click(function () {
          var x = document.getElementsByClassName("extrudedChoroplethInfo")[0].style.display;
          if ($(this).is(":checked")) {
            $('.extrudedChoroplethInfo').css({ display: "block" });
            addExtrudedChoropleth();
            createLegend('extrudedLegend');
          } else {
            $('.extrudedChoroplethInfo').css({ display: "none" });
            $("#extrudedLegendItem").remove();
            removeLayer(MyLayers.extrudedChoroplethLayer)
          }
        });

        // runClusteredHM
        $('#runClusteredHM').click(function() {  
            var x = document.getElementById("clusteredHM");
            if ($(this).is(":checked")) {
              $('.clusteredHM').css({ display: "block" });
              clusteredHeatMap();
            } else {
              $('.clusteredHM').css({ display: "none" });
              removeLayer(MyLayers.clusteredHeatMapLayer)
            }
        });

        // runConsistentHM
        $('#runConsistentHM').click(function() {  
            var x = document.getElementById("consistentHM");
            if ($(this).is(":checked")) {
              $('.consistentHM').css({ display: "block" });
              consistentHeatMap();
            } else {
              $('.consistentHM').css({ display: "none" });
              removeLayer(MyLayers.consistentHeatMapLayer)
            }
        });

        // runWeightedHM 
        $('#runWeightedHM').click(function() {  
            var x = document.getElementById("weightedHM");
            if ($(this).is(":checked")) {
              $('.weightedHM').css({ display: "block" });
              weightedHeatMap();
            } else {
              $('.weightedHM').css({ display: "none" });
              removeLayer(MyLayers.weightedHeatMapLayer)
            }
        });

        // runWeather 
        $('#runWeather').click(function() {  
            var x = document.getElementById("weatherMap");
            if ($(this).is(":checked")) {
              $('.weatherMap').css({ display: "block" });
              addWeather();
            } else {
              $('.weatherMap').css({ display: "none" });
              removeLayer(MyLayers.weatherLayer)
            }
        });
    });
}
