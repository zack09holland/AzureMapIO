/******************************************************************************************************************************
 * 
 *  Weather Example Layers 
 * 
 *  - addWeather()
 *      - Creates the title layer and calls updateTileLayer to determine which weather to laod
 * 
 *  - updateTileLayer()
 *      - Creates the weather tile layer 
 * 
 *  - animateWeather() NOT IMPLEMENTED
 *      - Will allow weather tile layers to become animated over a certain time period
 *    
******************************************************************************************************************************/
var tileLayer, animationManager;

//Weather tile url from Iowa Environmental Mesonet (IEM): http://mesonet.agron.iastate.edu/ogc/
var urlTemplate = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-{timestamp}/{z}/{x}/{y}.png';

//The time stamps values for the IEM service for the last 50 minutes broken up into 5 minute increments.
var timestamps = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];

var displayMessages = [];
var weatherTileUrl = 'https://atlas.microsoft.com/map/tile?subscription-key={subscription-key}&api-version=2.0&tilesetId={layerName}&zoom={z}&x={x}&y={y}';


function addWeather() {
    //Initialize the weather tile layer.
    updateTileLayer();
    // Set camera to view map layer
    // map.setCamera({
    //     center: [-99.47, 40.75],
    //     zoom: 3,
    //     view: 'Auto'
    // });
    // map.setStyle({
    //     style: 'grayscale_dark'
    // })
}

function updateTileLayer() {
    var layerName = document.getElementById("layerSelector").value;
    var tileUrl = weatherTileUrl.replace('{subscription-key}', atlas.getSubscriptionKey()).replace('{layerName}', layerName);
    if (!tileLayer) {
        //Create a tile layer and add it to the map below the label layer.
        tileLayer = new atlas.layer.TileLayer({
            tileUrl: tileUrl,
            opacity: 0.9,
            tileSize: 256
        });

    } else {
        tileLayer.setOptions({
            tileUrl: tileUrl
        });
    }
    console.log(tileLayer)
    map.layers.add(tileLayer, 'labels');
    MyLayers.weatherLayer = tileLayer;

}


function animateWeather() {
    var tileLayers = [];
    // Set camera to view map layer
    //  map.setCamera({
    //     center: [-99.47, 40.75],
    //     zoom: 3,
    //     view: 'Auto'
    // });
    // map.setStyle({
    //     style: 'grayscale_dark'
    // })
    //Create a tile layer option for each time stamp.
    for (var i = 0; i < timestamps.length; i++) {
        var layerOptions = {
            tileUrl: urlTemplate.replace('{timestamp}', timestamps[i]),
            tileSize: 256,
            opacity: 0.8
        };
        tileLayers.push(layerOptions);

        //Create a message to display for each frame of the animation based on the time stamp.
        var msg = 'Current';

        if (timestamps[i] != '900913') {
            msg += ' -' + timestamps[i].replace('900913-m', '') + 'in';
        }
        displayMessages.push(msg);
    }

    //Create the animation manager. 
    animationManager = new AnimatedTileLayerManager(map, {
        tileLayerOptions: tileLayers,
        below: 'labels',
        frameRate: 2
    });

    //When an animation frame loads, update the message panel. 
    animationManager.onFrameLoaded = function (e) {
        var msg = displayMessages[e.index];
        document.getElementById('messagePanel').innerText = msg;
    };
}


/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/
// weatherMapItems
// When the entire block is closed. Remove all of those layers and close the child tabs
$("#weatherMapItems").click(function () {
    if ($(this).is(":checked")) {
    
    } else {
        try {
            $("#runWeather").prop('checked', false);
            $('.weatherMap').css({
                display: "none"
            });
            removeLayer(MyLayers.weatherLayer)
        } catch (err) {

        }
    }
});
// runWeather 
$('#runWeather').click(function () {
    if ($(this).is(":checked")) {
        $('.weatherMap').css({
            display: "block"
        });
        addWeather();
    } else {
        $('.weatherMap').css({
            display: "none"
        });
        removeLayer(MyLayers.weatherLayer)
    }
});