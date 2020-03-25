/*****************************************************
 * 
 * Variables 
 *    
*****************************************************/
//Create a popup.
// var popup = new atlas.Popup();
var previewpopup = new atlas.Popup();
//Add a layers for rendering the data.
var layers, previewlayers, shpWorker;
var polygongonPreviewLayer,linePreviewLayer, pointPreviewLayer;
var defaultPolygonOptions,
    defaultPolygonLineOptions,
    defaultLineOptions,
    defaultPointOptions;
/*****************************************************
 * 
 * createPreviewMap 
 *    
*****************************************************/
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
        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'TfUWvWqVnTGKGMcIvxr5coNt7eiWrKxh6wJe0keVZSs'
        }
    });
    previewMap.events.add('ready', function () {
        //Create a data source to add your data to.
        previewMapDatasource = new atlas.source.DataSource();
        previewMap.sources.add(previewMapDatasource);

        //Create a popup.
        popup = new atlas.Popup();

        // //Add a layers for rendering the data.
        // polygongonPreviewLayer = [new atlas.layer.PolygonLayer(datasource, null, {
        //         filter: ['any', ['==', ['geometry-type'], 'Polygon'],
        //             ['==', ['geometry-type'], 'MultiPolygon']
        //         ] //Only render Polygon or MultiPolygon in this layer.
        //     }),
        //     new atlas.layer.LineLayer(datasource, null, {
        //         strokeColor: 'white',
        //         strokeWidth: 2,
        //         filter: ['any', ['==', ['geometry-type'], 'Polygon'],
        //             ['==', ['geometry-type'], 'MultiPolygon']
        //         ] //Only render Polygon or MultiPolygon in this layer.
        //     })
        // ]
        // linePreviewLayer = [
        //     new atlas.layer.LineLayer(datasource, null, {
        //         strokeColor: 'red',
        //         filter: ['any', ['==', ['geometry-type'], 'LineString'],
        //             ['==', ['geometry-type'], 'MultiLineString']
        //         ] //Only render LineString or MultiLineString in this layer.
        //     })
        // ]
        // pointPreviewLayer = [
        //     new atlas.layer.BubbleLayer(datasource, null, {
        //         filter: ['any', ['==', ['geometry-type'], 'Point'],
        //             ['==', ['geometry-type'], 'MultiPoint']
        //         ] //Only render Point or MultiPoints in this layer.
        //     })
        // ];
        
        // previewMap.layers.add(polygongonPreviewLayer, 'labels');
        // previewMap.layers.add(linePreviewLayer, 'labels');
        // previewMap.layers.add(pointPreviewLayer, 'labels');

        previewlayers = [
            new atlas.layer.PolygonLayer(previewMapDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
            }),
            new atlas.layer.LineLayer(previewMapDatasource, null, {
                strokeColor: 'white',
                strokeWidth: 2,
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
            }),
            new atlas.layer.LineLayer(previewMapDatasource, null, {
                strokeColor: 'red',
                filter: ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'MultiLineString']]	//Only render LineString or MultiLineString in this layer.
            }),
            new atlas.layer.BubbleLayer(previewMapDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
            })
        ];

        previewMap.layers.add(previewlayers, 'labels');

 
        defaultPolygonOptions = previewlayers[0].getOptions();
        defaultPolygonLineOptions = previewlayers[1].getOptions();
        defaultLineOptions = previewlayers[2].getOptions();
        defaultPointOptions = previewlayers[3].getOptions();

        updatePointLayer();
        MyLayers.newLayers = previewlayers
    })
}


/*****************************************************
 * 
 * loadShapeFile functions
 *    
*****************************************************/
function loadShapeFile(ds,mapInput,url) {
    var wfunc = function (base, cb) {
        importScripts('data/scripts/shp.min.js');
        shp(base).then(cb);
    };
    shpWorker = cw({ data: wfunc }, 2);

    popup.close();

    shpWorker.data(cw.makeUrl(url)).then(function (data) {
        //Load the shapefile into the data source.
        ds.add(data);

        //Bring the data into view on the map.
        mapInput.setCamera({
            bounds: atlas.data.BoundingBox.fromData(data),
            padding: 50
        });

        // document.getElementById('loadingIcon').style.display = 'none';
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

        //NOTE: KML/KMZ can contain ground overlays which are returned in the "groundOverlay" property of the data set.
        //Additionally, any images parsed for use as custom icons when rendering points are in the "icons" property of the data set and should be added to the maps resource before adding the data to the data source.
        //See the "Load KML onto map" sample for more complete example for KML/KMZ data sets.
    });
}

/*****************************************************
 * 
 * Functions to add and upload file(s) to the server
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
                fileNameURL = '/data/File Uploads' + JSONFile[0]
                console.log(fileNameURL)

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
 *  created in the design modal to the map
 *    
/***************************************************/
function createLayers(){
    
    map.events.add('ready', function () {
        var newLayerDatasource = new atlas.source.DataSource();
        map.sources.add(newLayerDatasource);
        
        newlyAddedLayers = [
            new atlas.layer.PolygonLayer(newLayerDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
            }),
            new atlas.layer.LineLayer(newLayerDatasource, null, {
                strokeColor: 'white',
                strokeWidth: 2,
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
            }),
            new atlas.layer.LineLayer(newLayerDatasource, null, {
                strokeColor: 'red',
                filter: ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'MultiLineString']]	//Only render LineString or MultiLineString in this layer.
            }),
            new atlas.layer.BubbleLayer(newLayerDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
            })
        ];
        
      
        // Get the options from the newlayer created and set
        // them to the new layer  
        polygonOptions = MyLayers.newLayers[0].options
        polygonLineOptions = MyLayers.newLayers[1].options
        lineOptions = MyLayers.newLayers[2].options
        pointOptions = MyLayers.newLayers[3].options
        // Set the options for all the newlyAddedLayers
        // - All of them are set to ensure the layer that
        //  had its options changed are set.
        newlyAddedLayers[0].setOptions(polygonOptions);
        newlyAddedLayers[1].setOptions(polygonLineOptions);
        newlyAddedLayers[2].setOptions(lineOptions);
        newlyAddedLayers[3].setOptions(pointOptions);
        // Set the datasource of the added layers to the new
        // datasource so it can be added to the main map
        newlyAddedLayers[0].options.source = newLayerDatasource
        newlyAddedLayers[1].options.source = newLayerDatasource
        newlyAddedLayers[2].options.source = newLayerDatasource
        newlyAddedLayers[3].options.source = newLayerDatasource

        
        //Change the source back to the newly created layer
        // Add them to the map and reload the shapefile function
        map.layers.add(newlyAddedLayers, 'labels');
        
        //Add a click event to the layers to show a popup of what the user clicked on.
        map.events.add('click', newlyAddedLayers, featureClicked);

        // Check the file type to load it, files are loaded in differently
        // based on their extension type
        if (MyFiles.newFileExt === 'zip') {
            loadShapeFile(newLayerDatasource,map,MyFiles.newFileURL)
        }
        else if (MyFiles.newFileExt === 'shp' || MyFiles.newFileExt === 'prj' || MyFiles.newFileExt === 'dbf' || MyFiles.newFileExt === 'cpg' ){
            console.log(MyFiles.newFileName)
            loadShapeFile(newLayerDatasource,map,MyFiles.newFileName)
        }
        
    })

}




/*********************************************
 * 
 * Jquery Onclick events
 *    
*********************************************/

$("#saveFileBtn").click(function () {
    
    createLayers()    
});



$("#lineStringSelect").select(function () {
    console.log("its a line")
});

// Layer Design Selections
$('[name="layerDesignSelections"]').change(function() {
    if ($('[name="layerDesignSelections"]').val() === "LineString") {
        // Show the layer design options
        $('.pointDesignOptions').css({
            display: "none"
        });
        $('.polygonDesignOptions').css({
            display: "none"
        });
        $('.lineDesignOptions').css({
            display: "block"
        });
    }
    else if($('[name="layerDesignSelections"]').val() === "PolygonLayer"){
        $('.pointDesignOptions').css({
            display: "none"
        });
        $('.polygonDesignOptions').css({
            display: "block"
        });
        $('.lineDesignOptions').css({
            display: "none"
        });
    }
    else if($('[name="layerDesignSelections"]').val() === "Point"){
        $('.pointDesignOptions').css({
            display: "block"
        });
        $('.polygonDesignOptions').css({
            display: "none"
        });
        $('.lineDesignOptions').css({
            display: "none"
        });
    }
})

var fileupload = $("#filesfld");
// // addFiles
$("#addFileBtn").click(function () {
    createPreviewMap()
    // addFileLayer()
    fileupload.click();
    fileupload.change(function () {
        var fileName = MyFiles
        // fileName = document.getElementById("fileUpload").files[0].path
        console.log(fileName)
    })
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


