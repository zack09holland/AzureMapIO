//Create a popup.
var popup = new atlas.Popup();
var previewpopup = new atlas.Popup();
//Add a layers for rendering the data.
var layers, previewlayers, shpWorker;
var polygongonPreviewLayer,linePreviewLayer, pointPreviewLayer;
////////////////////////////////////////////

// loadShapeFile

////////////////////////////////////////////
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
        datasource = new atlas.source.DataSource();
        previewMap.sources.add(datasource);

        //Create a popup.
        previewpopup = new atlas.Popup();

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
            new atlas.layer.PolygonLayer(datasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
            }),
            new atlas.layer.LineLayer(datasource, null, {
                strokeColor: 'white',
                strokeWidth: 2,
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
            }),
            new atlas.layer.LineLayer(datasource, null, {
                strokeColor: 'red',
                filter: ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'MultiLineString']]	//Only render LineString or MultiLineString in this layer.
            }),
            new atlas.layer.BubbleLayer(datasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
            })
        ];
        previewMap.layers.add(previewlayers, 'labels');

        var wfunc = function (base, cb) {
            importScripts('data/scripts/shp.min.js');
            shp(base).then(cb);
        };

        shpWorker = cw({ data: wfunc }, 2);

    })
}
function createLayers(){
    layers = [
        new atlas.layer.PolygonLayer(datasource, null, {
            filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
        }),
        new atlas.layer.LineLayer(datasource, null, {
            strokeColor: 'white',
            strokeWidth: 2,
            filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	//Only render Polygon or MultiPolygon in this layer.
        }),
        new atlas.layer.LineLayer(datasource, null, {
            strokeColor: 'red',
            filter: ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'MultiLineString']]	//Only render LineString or MultiLineString in this layer.
        }),
        new atlas.layer.BubbleLayer(datasource, null, {
            filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
        })
    ];
    map.layers.add(layers, 'labels');
    //Add a click event to the layers to show a popup of what the user clicked on.
    map.events.add('click', layers, featureClicked);

}
////////////////////////////////////////////

// loadShapeFile functions

////////////////////////////////////////////
function loadShapeFile(url) {
    popup.close();
    // OLD SHAPEFILE LOADER
    // CHANGED TO WORK WITH LARGER FILES AS WELL

    // shp(url).then(function (data) {
    //     //Load the shapefile into the data source and overwrite any existing data. 
    //     datasource.setShapes(data);

    //     //Bring the data into view on the map.
    //     previewMap.setCamera({
    //         bounds: atlas.data.BoundingBox.fromData(data),
    //         padding: 50
    //     });
    // });

    shpWorker.data(cw.makeUrl(url)).then(function (data) {
        //Load the shapefile into the data source.
        datasource.add(data);
        //Bring the data into view on the map.
        previewMap.setCamera({
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
////////////////////////////////////////////

// addFileLayer
//  -Used to add basic spatial files
//  -function supports reading:
//      - KML 
//      - KMZ 
//      - GPX
//      - GeoRSS
//      - GML
//      - GeoJSON
//      - CSV (with spatial columns).

////////////////////////////////////////////

function addFileLayer(fileName) {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Add a simple data layer for rendering the data.
    filelayer = new atlas.layer.SimpleDataLayer(datasource);
    map.layers.add(filelayer);

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

/////////////////////////////////////////////////////

// Functions to add and upload file(s) to the server

/////////////////////////////////////////////////////

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
    console.log(form)
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
            console.log(x)
            if (x.status == 200) {
                JSONFile = JSON.parse(x.responseText);
                console.log(JSONFile[0])
                fileNameURL = '/data/File Uploads' + JSONFile[0]
                MyFiles.newFile = fileNameURL
                fileName = fileNameURL.split('.')[0]
                fileExtension = fileNameURL.split('.')[1]
                //Check the file extensions for the file being uploaded
                try {
                    if(fileExtension === 'shp' || fileExtension === 'prj' || fileExtension === 'dbf' || fileExtension === 'cpg'){
                        console.log(fileName)
                        loadShapeFile(fileName)
                    }
                    else if(fileExtension === 'zip'){
                        loadShapeFile(fileNameURL)
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

/////////////////////////////////////////////////////

// Jquwey Onclick events

/////////////////////////////////////////////////////

// Save file
$("#saveFileBtn").click(function () {
    console.log(MyFiles.newFile)
});
$("#lineStringSelect").select(function () {
    console.log("its a line")
});


var fileupload = $("#filesfld");
// // addFiles
$("#addFileBtn").click(function () {
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


