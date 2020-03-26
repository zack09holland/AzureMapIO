/*****************************************************
 * 
 * createPreviewMap 
 * 
 *  - Function creates a new map to preview the layer
 *    and file being added to the main map
 * 
 *  - Design options added to the preview layers are saved to
 *    the MyLayers object to be accessed when adding them
 *    to the main map
 *      - NOTE: Due to the nature of loading the layers/files
 *              to the preview map, loadShapeFile is called twice.
 *              Once when viewing them in the preview map and again
 *              when adding them to the main map
 *    
*****************************************************/
var defaultPolygonOptions, defaultLineOptions, defaultPointOptions;

function createPreviewMap(){
     //Initialize a map instance.
     previewMap = new atlas.Map('previewMap', {
        // center: [-98.493928, 38.096798],
        // zoom: 4,
        // view: "Auto",
        center: [-94.6, 39.1],
        zoom: 3,
        view: 'Auto',
        style: 'grayscale_light',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'TfUWvWqVnTGKGMcIvxr5coNt7eiWrKxh6wJe0keVZSs'
        }
    });
    previewMap.events.add('ready', function () {
        //Create a data source and add it to the map.
        previewMapDatasource = new atlas.source.DataSource();
        previewMap.sources.add(previewMapDatasource);

        //Create a popup
        popup = new atlas.Popup();

        previewlayers = [
            //Used to configure design options for Polygon layers.
            new atlas.layer.PolygonLayer(previewMapDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	
            }),
            //Used to configure design options for Line layers.
            new atlas.layer.LineLayer(previewMapDatasource, null, {
                strokeColor: 'red',
            }),
            //Used to configure design options for Point layers.
            new atlas.layer.BubbleLayer(previewMapDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] 
            })
        ];
        // Add layers to preview map
        previewMap.layers.add(previewlayers, 'labels');
        // Get the options and set them as the default options for those layers
        defaultPolygonOptions = previewlayers[0].getOptions();
        defaultLineOptions = previewlayers[1].getOptions();
        defaultPointOptions = previewlayers[2].getOptions();

        // Call functions to update the layers
        updatePointLayer();
        updateLineLayer();
        updatePolygonLayer();
        // Add the layers with the options set during the updating processing 
        // to the global MyLayers object so they can be added to the main map
        MyLayers.newLayers = previewlayers
    })
}


/*****************************************************
 * 
 * Load Shapefiles
 * 
 *  loadShapeFile()
 *  - Function is used to add shapefiles of any size
 *    to the map.    
 * 
 *  featureClicked()
 *  - Function is used to determine if a feature of the
 *    data has beem clicked to initiate the popup 
*****************************************************/
function loadShapeFile(ds,mapInput,url) {
    var wfunc = function (base, cb) {
        importScripts('data/scripts/shp.min.js');
        shp(base).then(cb);
    };
    shpWorker = cw({ data: wfunc }, 2);

    popup.close();
    // Check to see which map were loading the files into
    if(mapInput === previewMap){
        document.getElementById('previewLoadingIcon').style.display = '';
    }else{
        document.getElementById('mainLoadingIcon').style.display = '';
    }

    shpWorker.data(cw.makeUrl(url)).then(function (data) {

        //Load the shapefile into the data source.
        ds.add(data);

        //Bring the data into view on the map.
        mapInput.setCamera({
            bounds: atlas.data.BoundingBox.fromData(data),
            padding: 50
        });
        
        // Check to see which map were loading the files into
        if(mapInput === previewMap){
            document.getElementById('previewLoadingIcon').style.display = 'none';
        }else{
            document.getElementById('mainLoadingIcon').style.display = 'none';
        }  
    });
}

function featureClicked(e) {
    //Make sure the event occurred on a shape feature.
    if (e.shapes && e.shapes.length > 0) {
        //By default, show the popup where the mouse event occurred.
        var pos = e.position;
        var offset = [0, 0];
        var properties;

        if (e.shapes[0] instanceof atlas.Shape) {
            properties = e.shapes[0].getProperties();

            //If the shape is a point feature, show the popup at the points coordinate.
            if (e.shapes[0].getType() === 'Point') {
                pos = e.shapes[0].getCoordinates();
                offset = [0, -18];
            }
        } else {
            properties = e.shapes[0].properties;

            //If the shape is a point feature, show the popup at the points coordinate.
            if (e.shapes[0].type === 'Point') {
                pos = e.shapes[0].geometry.coordinates;
                offset = [0, -18];
            }
        }

        //Update the content and position of the popup.
        popup.setOptions({
            //Create a table from the properties in the feature.
            content: atlas.PopupTemplate.applyTemplate(properties),
            position: pos,
            pixelOffset: offset
        });

        //Open the popup.
        popup.open(map);
    }
}

/*********************************************
 * 
 * addFileLayer
 *
 * -Used to add basic spatial files
 *  -function supports reading:
 *      - KML 
 *      - KMZ 
 *      - GPX
 *      - GeoRSS
 *      - GML
 *      - GeoJSON
 *      - CSV (with spatial columns).
 *     
*********************************************/
function addFileLayer(fileName) {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Add a simple data layer for rendering the data.
    filelayer = new atlas.layer.SimpleDataLayer(datasource);
    map.layers.add(filelayer);
    console.log(filelayer)
    //Read an XML file from a URL or pass in a raw XML string.
    atlas.io.read(fileName).then(r => {
        if (r) {
            //Add the feature data to the data source.
            datasource.add(r);
            //If bounding box information is known for data, set the map view to it.
            if (r.bbox) {
                map.setCamera({
                    bounds: r.bbox,
                    padding: 50
                });
            }
        }
        // NOTE: KML/KMZ can contain ground overlays which are returned in the "groundOverlay" property of the data set.
        //       Additionally, any images parsed for use as custom icons when rendering points are in the "icons" property of 
        //       the data set and should be added to the maps resource before adding the data to the data source.
        //       See the "Load KML onto map" sample for more complete example for KML/KMZ data sets.
    });
}

/*****************************************************
 * 
 *  Add and Upload Files Functions
 * 
 *  - These functions allow the user to add files from
 *    their local drive onto the map by first uploading
 *    the file to the web server allowing the azure maps
 *    to access the file 
 *    
 *    
*****************************************************/
var fileNameURL;
var JSONFile
function stopDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}

function addFilesAndSubmit(event) {
    var files = event.target.files || event.dataTransfer.files;
    document.getElementById("filesfld").files = files;
    submitFilesForm(document.getElementById("filesfrm"));
}

function submitFilesForm(form) {
    var fd = new FormData();
    for (var i = 0; i < form.filesfld.files.length; i++) {
        var field = form.filesfld;
        fd.append(field.name, field.files[i], field.files[i].name);
    }
    var progress = document.getElementById("progress");
    var x = new XMLHttpRequest();
    if (x.upload) {
        x.upload.addEventListener("progress", function (event) {
            var percentage = parseInt(event.loaded / event.total * 100);
            progress.innerText = progress.style.width = percentage + "%";
        });
    }
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            progress.innerText = progress.style.width = "";
            // form.filesfld.value = "";
            // console.log(x)
            if (x.status == 200) {
                JSONFile = JSON.parse(x.responseText);
                console.log(JSONFile[0])

                // Added files are moved via the web server to 'app/public/data/File Uploads'
                // Create a file name URL to pass into other functions to load the data
                fileNameURL = '/data/File Uploads' + JSONFile[0]
                console.log(fileNameURL)

                // Get and set the file information to the MyFiles object
                fileName = fileNameURL.split('.')[0]
                fileExtension = fileNameURL.split('.')[1]
                console.log(fileName)
                console.log(fileExtension)
                MyFiles.newFileURL = fileNameURL
                MyFiles.newFileName = fileName
                MyFiles.newFileExt = fileExtension

                //Check the file extensions for the file being uploaded
                try {
                    if(fileExtension === 'shp' || fileExtension === 'prj' || fileExtension === 'dbf' || fileExtension === 'cpg'){
                        console.log(fileName)
                        loadShapeFile(previewMapDatasource,previewMap,fileName)
                    }
                    else if(fileExtension === 'zip'){
                        loadShapeFile(previewMapDatasource,previewMap,fileNameURL)
                    }
                    else{
    
                    }    
                } catch (error) {
                    console.log(error)

                }
            
            } else {
                // failed - TODO: Add code to handle server errors
            }
        }
    };
    x.open("post", form.action, true);
    x.send(fd);
    return false;
}

/***************************************************
 * 
 * createLayers
 * 
 *  -Function acts as the catalyst to add the layers
 *   to the main map by creating a new datasource
 *   and new layers associated with the main map
 *   and setting the options of the preview layers
 *   to the newly added layers
 *    
/***************************************************/
function createLayers(){
    map.events.add('ready', function () {
        //Create a data source and add it to the map.
        var newLayerDatasource = new atlas.source.DataSource();
        map.sources.add(newLayerDatasource);
        
        // Create new layers with a new datasource associated with the main map
        newlyAddedLayers = [
            new atlas.layer.PolygonLayer(newLayerDatasource, null, {}),
            new atlas.layer.LineLayer(newLayerDatasource, null, {}),
            new atlas.layer.BubbleLayer(newLayerDatasource, null, {})
        ];
        
        // Get the options from the newlayers object
        polygonOptions = MyLayers.newLayers[0].options
        lineOptions = MyLayers.newLayers[1].options
        pointOptions = MyLayers.newLayers[2].options

        // Set the options for all the newlyAddedLayers
        newlyAddedLayers[0].setOptions(polygonOptions);
        newlyAddedLayers[1].setOptions(lineOptions);
        newlyAddedLayers[2].setOptions(pointOptions);

        // Set the datasource of the added layers to the new
        // datasource so it can be added to the main map
        newlyAddedLayers[0].options.source = newLayerDatasource
        newlyAddedLayers[1].options.source = newLayerDatasource
        newlyAddedLayers[2].options.source = newLayerDatasource

        // Add them to the map and reload the shapefile function
        map.layers.add(newlyAddedLayers, 'labels');
        
        //Add a click event to the layers to show a popup of what the user clicked on.
        map.events.add('click', newlyAddedLayers, featureClicked);

        // Check the file type of the new layer, files are loaded in differently
        // based on their extension type
        if (MyFiles.newFileExt === 'zip') {
            loadShapeFile(newLayerDatasource,map,MyFiles.newFileURL)
        }
        else if (MyFiles.newFileExt === 'shp' || MyFiles.newFileExt === 'prj' || MyFiles.newFileExt === 'dbf' || MyFiles.newFileExt === 'cpg' ){
            loadShapeFile(newLayerDatasource,map,MyFiles.newFileName)
        }       
    })
}




/*********************************************
 * 
 * Jquery Onclick events
 *    
*********************************************/
// Create the layers when they click save changes
$("#saveFileBtn").click(function () { 
    createLayers()    
});
// Add the files and initiate the upload process
var fileupload = $("#filesfld");
$("#addFileBtn").click(function () {
    fileupload.click();
    // fileupload.change(function () {
    //     var fileName = MyFiles
    //     // fileName = document.getElementById("fileUpload").files[0].path
    //     console.log(fileName)
    // })
});

// simpleSpatial
$("#simpleSpatial").click(function () {
    if ($(this).is(":checked")) {
        $('.simpleSpatialInfo').css({
            display: "block"
        });
        
    } else {
        $('.simpleSpatialInfo').css({
            display: "none"
        });
    }
});


