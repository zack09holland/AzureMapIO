// Globally scoped variables
var map, previewMap;
var MyLayers = {}; // Holds layers added to the map
var MyFiles = {};  // Holds the file information for files added to the map
/*************************************************************************************
 *  GetMap
 * 
 *  - Initializes the main mapping interface and when
 *    ready loads the map tools
 *      - mapControls
 *      - drawingTools
 *      - mapSearch() 
 *    
****************************************************************************************/
function GetMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [-94.6, 39.1],
        zoom: 3,
        view: 'Auto',
        style: 'grayscale_light',

        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'fxg6dMtNQQ3zqgzk_loQeMxznejQj5swKZF9Vcj5rQ0'
        }
    });
    
    // Wait until the map resources are ready.
    // (Other Map layer functions are controlled via onclick events)
    map.events.add('ready', function () {
        mapControls()
        drawingTools();
        mapSearch();
    });
}