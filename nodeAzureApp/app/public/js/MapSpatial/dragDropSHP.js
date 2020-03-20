function dragDropSHP() {
    //Create a style control and add it to the map.
    map.controls.add(new atlas.control.StyleControl(), {
        position: 'top-right'
    });

    //Setup the drag & drop listeners on the map.
    var dropZone = document.getElementById('myMap');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    //Create a data source to add your data to.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Create a popup.
    popup = new atlas.Popup();

    //Add a layers for rendering the data.
    var layers = [
        new atlas.layer.PolygonLayer(datasource, null, {
            filter: ['any', ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
            ] //Only render Polygon or MultiPolygon in this layer.
        }),
        new atlas.layer.LineLayer(datasource, null, {
            strokeColor: 'white',
            strokeWidth: 2,
            filter: ['any', ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
            ] //Only render Polygon or MultiPolygon in this layer.
        }),
        new atlas.layer.LineLayer(datasource, null, {
            strokeColor: 'red',
            filter: ['any', ['==', ['geometry-type'], 'LineString'],
                ['==', ['geometry-type'], 'MultiLineString']
            ] //Only render LineString or MultiLineString in this layer.
        }),
        new atlas.layer.BubbleLayer(datasource, null, {
            filter: ['any', ['==', ['geometry-type'], 'Point'],
                ['==', ['geometry-type'], 'MultiPoint']
            ] //Only render Point or MultiPoints in this layer.
        })
    ];

    map.layers.add(layers, 'labels');

    //Add a click event to the layers to show a popup of what the user clicked on.
    map.events.add('click', layers, featureClicked);

    //Create a web worker that uses the shapefile-js library.
    var wfunc = function (base, cb) {
        importScripts('../Common/scripts/shp.min.js');
        shp(base).then(cb);
    };

    shpWorker = cw({
        data: wfunc
    }, 2);


function handleDragOver(evt) {
    //Stop the browser from performing its default behavior when a file is dragged and dropped.
    evt.stopPropagation();
    evt.preventDefault();

    evt.dataTransfer.dropEffect = 'copy';
}

function handleFileSelect(evt) {
    //Stop the browser from performing its default behavior when a file is dragged and dropped.
    evt.stopPropagation();
    evt.preventDefault();

    //Remove any existing data from the map.
    datasource.clear();

    //The list of files that have been dragged and dropped onto the map.
    var files = evt.dataTransfer.files;

    //Keep track of the bounding box of all the data from all files dropped into the map.
    var dataBounds = null;

    //Loop through and attempt to read each file. 
    for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();

        reader.onload = function (e) {
            shpWorker.data(e.target.result).then(function (data) {
                //Add the GeoJSON data to the data source.
                datasource.add(data);

                //Calculate the bounding box of the GeoJSON data.
                var bounds = atlas.data.BoundingBox.fromData(data);

                //If data is already loaded from another GeoJSON file, merge the bounding boxes together.
                if (dataBounds) {
                    dataBounds = atlas.data.BoundingBox.merge(dataBounds, bounds);
                } else {
                    dataBounds = bounds;
                }

                //Update the map view to show the data.
                map.setCamera({
                    bounds: dataBounds,
                    padding: 50
                });
            });
        };

        //Read the file as text.
        reader.readAsArrayBuffer(files[i]);
    }
}

function featureClicked(e) {
    //Make sure the event occurred on a shape feature.
    if (e.shapes && e.shapes.length > 0) {
        var properties = e.shapes[0].getProperties();

        //By default, show the popup where the mouse event occurred.
        var pos = e.position;

        //If the shape is a point feature, show the popup at the points coordinate.
        if (e.shapes[0].getType() === 'Point') {
            pos = e.shapes[0].getCoordinates();
        }

        //Update the content and position of the popup.
        popup.setOptions({
            //Create a table from the properties in the feature.
            content: atlas.PopupTemplate.applyTemplate(properties),
            position: pos,
            pixelOffset: [0, 0]
        });

        //Open the popup.
        popup.open(map);
    }
}
}