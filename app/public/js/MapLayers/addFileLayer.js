var datasource, imageLayers = [], layer, dataBounds, statusPanel, dataPanel, imageIcons = [], loadingIcon, fileCount = 0;
var proxyServiceUrl = window.location.origin + '/Common/CorsEnabledProxyService.ashx?url=';


function addFileLayer() {
     //Create a data source to store the data in.
     datasource = new atlas.source.DataSource();
     map.sources.add(datasource);

     //Add a simple data layer for rendering the data.
     layer = new atlas.layer.SimpleDataLayer(datasource);
     map.layers.add(layer);

    //  //Setup the drag & drop listeners on the map.
    //  var dropZone = document.getElementById('myMap');
    //  dropZone.addEventListener('dragover', handleDragOver, false);
    //  dropZone.addEventListener('drop', handleFileSelect, false);
}

function handleDragOver(evt) {
    //Stop the browser from performing its default behavior when a file is dragged and dropped.
    evt.stopPropagation();
    evt.preventDefault();

    evt.dataTransfer.dropEffect = 'copy';
    console.log("test")
}

function handleFileSelect(evt) {
    statusPanel.value = 'Reading from Files\r\n\r\n';

    //Stop the browser from performing its default behavior when a file is dragged and dropped.
    evt.stopPropagation();
    evt.preventDefault();

    clearMap();

    //The list of files that have been dragged and dropped onto the map.
    var files = evt.dataTransfer.files;

    //Loop through and attempt to read each file.
    for (var i = 0; i < files.length; i++) {
        //Read the data blob.
        readData(files[i], files[i].name);
    }
}

function readData(data, fileName) {
    loadingIcon.style.display = '';
    fileCount++;

    //Attempt to parse the file and add the shapes to the map.
    atlas.io.read(data, {
        proxyService: proxyServiceUrl
    }).then(
        //Success
        function (r) {
            //Check to see if there is any icon data. If there is, load them into the map before loading the data.
            if (r.icons) {
                loadIcons(r.icons).then(function () {
                    loadData(r, fileName);
                });
            } else {
                loadData(r, fileName);
            }
        },

        //Error
        function (msg) {
            writeStats(fileName, null, msg);
            alert(msg);
        }
    );
}

function readDataPanel() {
    statusPanel.value = 'Reading from Data panel\r\n\r\n';

    clearMap();
    readData(dataPanel.value);
}

function loadData(r, fileName) {
    //Load all features.
    if (r.features && r.features.length > 0) {
        datasource.add(r.features);
    }

    //Load ground overlays.
    if (r.groundOverlays && r.groundOverlays.length > 0) {
        imageLayers = imageLayers.concat(r.groundOverlays);
        map.layers.add(r.groundOverlays);
    }

    //If there is a bounding box for the data, set the map to it.
    if (r.bbox) {
        if (dataBounds) {
            //If there are multiple files being loaded, there merge their bounding boxes together.
            dataBounds = atlas.data.BoundingBox.merge(dataBounds, r.bbox);
        } else {
            dataBounds = r.bbox;
        }

        //Update the map view.
        map.setCamera({ bounds: dataBounds, padding: 50 });
    }

    //Write stats.
    writeStats(fileName, r.stats);
}

//Load icons into the map image sprite.
function loadIcons(icons) {
    return new Promise(function (resolve, reject) {
        if (!icons) {
            resolve();
            return;
        }

        //The keys are the names of each icon image.
        var keys = Object.keys(icons);

        if (keys.length === 0) {
            resolve();
            return;
        }

        //For each icon image, create a promise to add it to the map, then run the promises in parrallel.
        var imagePromises = [];

        keys.forEach(function (key) {
            imagePromises.push(map.imageSprite.add(key, icons[key]));
        });

        Promise.all(imagePromises).then(function () {
            //Remember all the added icon names so we can remove them later when the map is cleared.
            imageIcons = imageIcons.concat(keys);
            resolve();
        });
    });
}

//Remove any custom loaded icons from the map.
function removeIcons() {
    for (var i = 0; i < imageIcons.length; i++) {
        map.imageSprite.remove(imageIcons[i]);
    }

    imageIcons = [];
}

function clearMap() {
    //Remove any existing data from the map.
    dataBounds = null;
    map.layers.remove(imageLayers);
    imageLayers = [];
    datasource.clear();
    removeIcons();
    layer.closePopup();
}



//Writes data as a string an adds to data panel.
function writeData() {
    dataPanel.value = '';

    var fileTypeDD = document.getElementById('fileType');
    var fileType = fileTypeDD.options[fileTypeDD.selectedIndex].innerText;

    var s = performance.now();

    atlas.io.write(imageLayers.concat(datasource.toJson().features), {
        format: fileType,
        indentChars: '    ' //Use 4 spaces instead of \t for indenting as it looks better in the textarea.
    }).then(function (dataString) {
        var e = performance.now();
        statusPanel.value = 'Data written in: ' + (e - s) + 'ms';
        dataPanel.value = dataString;
        openTab(null, 'Data');
    });
}

//Downloads the data as a compressed file (KMZ or ZIP).
function downloadZip() {
    dataPanel.value = '';

    var fileTypeDD = document.getElementById('fileType');
    var fileType = fileTypeDD.options[fileTypeDD.selectedIndex].innerText;

    atlas.io.writeCompressed(imageLayers.concat(datasource.toJson().features), 'Blob', {
        format: fileType,
        indentChars: '    ' //Use 4 spaces instead of \t for indenting as it looks better in the textarea.
    }).then(function (compressedData) {
        if (fileType === 'KML') {
            saveAs(compressedData, 'MapData.kmz');
        } else {
            saveAs(compressedData, 'MapData.zip');
        }
    });
}

//Write reading stats and errors for each file read.
function writeStats(fileName, stats, error) {
    var result = [];

    if (fileName) {
        result.push('File name: ', fileName);
    }

    if (error) {
        result.push('\r\nError: ', error);
    }

    if (stats) {

        if (stats.numCharecters) {
            result.push('\r\nFile size: ', Math.ceil(stats.numCharecters / 1024), ' KB');
        }

        if (stats.numPoints) {
            result.push('\r\n# of Points: ', stats.numPoints);
        }

        if (stats.numLineStrings) {
            result.push('\r\n# of LineStrings: ', stats.numLineStrings);
        }

        if (stats.numPolygons) {
            result.push('\r\n# of Polygons: ', stats.numPolygons);
        }

        if (stats.numPositions) {
            result.push('\r\n# of Positions: ', stats.numPositions);
        }

        if (stats.numNetworkLinks) {
            result.push('\r\n# of Network Links: ', stats.numNetworkLinks);
        }

        if (stats.numGroundOverlays) {
            result.push('\r\n# of Ground Overlays ', stats.numGroundOverlays);
        }

        result.push('\r\nProcessing time (ms): ', stats.processingTime, '\r\n\r\n');
    }

    statusPanel.value += result.join('');

    fileCount--;

    if (fileCount === 0) {
        loadingIcon.style.display = 'none';
    }

    openTab(null, 'Status');
}

function openTab(elm, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";

    if (!elm) {
        if (tabName === 'Status') {
            elm = document.getElementById('StatusBtn');
        } else if (tabName === 'Data') {
            elm = document.getElementById('DataBtn');
        }
    }

    elm.className += " active";
}














// function addFileLayer(fileName) {
//     //Create a data source and add it to the map.
//     datasource = new atlas.source.DataSource();
//     map.sources.add(datasource);

//     //Add a simple data layer for rendering the data.
//     filelayer = new atlas.layer.SimpleDataLayer(datasource);
//     map.layers.add(filelayer);

//     //Read an XML file from a URL or pass in a raw XML string.
//     atlas.io.read('data/Gpx/Route66Attractions.xml').then(r => {
//         if (r) {
//             //Add the feature data to the data source.
//             datasource.add(r);

//             //If bounding box information is known for data, set the map view to it.
//             if (r.bbox) {
//                 map.setCamera({
//                     bounds: r.bbox,
//                     padding: 50
//                 });
//             }
//         }

//         //NOTE: KML/KMZ can contain ground overlays which are returned in the "groundOverlay" property of the data set.
//         //Additionally, any images parsed for use as custom icons when rendering points are in the "icons" property of the data set and should be added to the maps resource before adding the data to the data source.
//         //See the "Load KML onto map" sample for more complete example for KML/KMZ data sets.
//     });
// }



// var fileupload = $("#fileUpload");
// var button = $("#btnFileUpload");

// // citiesSHP
// $("#addFileBtn").click(function () {
//         // addFileLayer()
//         fileupload.click();
//         fileupload.change(function () {
//         var fileName = $("#fileUpload")
//         fileName = document.getElementById("fileUpload").files[0].path

//             console.log(fileName)
//         })
// });
