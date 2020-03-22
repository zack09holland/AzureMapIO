var popup, datasource;

function addSHPFiles() {

    //Create a data source to add your data to.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Create a popup.
    popup = new atlas.Popup();

    //Add a layers for rendering the data.
    var shpFileLayers = [
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

    map.layers.add(shpFileLayers, 'labels');
    MyLayers.shpFileLayers = shpFileLayers;

    //Add a click event to the layers to show a popup of what the user clicked on.
    map.events.add('click', shpFileLayers, featureClicked);
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

function loadShapeFile(url) {
    popup.close();

    shp(url).then(function (data) {
        //Load the shapefile into the data source and overwrite any existing data. 
        datasource.setShapes(data);

        //Bring the data into view on the map.
        map.setCamera({
            bounds: atlas.data.BoundingBox.fromData(data),
            padding: 50
        });
    });
    console.log(map)
}















// JQUERY ONCLICK EVENTS

// bubbleItems
// When the entire block is closed. Remove all of those layers and close the child tabs
$("#geospatialItems").click(function () {
    if ($(this).is(":checked")) {

    } else {
        try {
            $("#shpFiles").prop('checked', false);
            $('.shpFileInfo').css({
                display: "none"
            });
            // removeLayer(MyLayers.bubbleLayer)
        } catch (err) {

        }
    }
});

// citiesSHP
$("#citiesSHP").click(function () {
    if ($(this).is(":checked")) {
        loadShapeFile('data/shp/cities')
    } else {
        // removeLayer(MyLayers.shpFileLayers)
    }
});
// chicagoBikeRacksSHP
$("#chicagoBikeRacksSHP").click(function () {
    if ($(this).is(":checked")) {
        loadShapeFile('data/shp/BikeRacks.zip')
    } else {

        // removeLayer(MyLayers.bubbleLayer)
    }
});
// usInterstatesSHP
$("#usInterstatesSHP").click(function () {
    if ($(this).is(":checked")) {
        loadShapeFile('data/shp/US_Interstates')
    } else {

        // removeLayer(MyLayers.bubbleLayer)
    }
});
// londonUKRegionsSHP
$("#londonUKRegionsSHP").click(function () {
    if ($(this).is(":checked")) {
        loadShapeFile('data/shp/greater_london_const_region')
    } else {

        // removeLayer(MyLayers.bubbleLayer)
    }
});
// polishAdminDivisionSHP
$("#polishAdminDivisionSHP").click(function () {
    if ($(this).is(":checked")) {
        loadShapeFile('data/shp/POL_adm.zip')
    } else {

        // removeLayer(MyLayers.bubbleLayer)
    }
});
// germanPostalCodesSHP
$("#germanPostalCodesSHP").click(function () {
    if ($(this).is(":checked")) {
        loadShapeFile('data/shp/plzzip5.zip')
    } else {

        // removeLayer(MyLayers.bubbleLayer)
    }
});
