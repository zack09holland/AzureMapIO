
function clusteredHeatMap() {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource(null, {
        //Tell the data source to cluster point data.
        cluster: true,

        //The radius in pixels to cluster points together.
        clusterRadius: 15
    });
    map.sources.add(datasource);

    //Create a heatmap and add it to the map.
    heatMapLayer = new atlas.layer.HeatMapLayer(datasource, null, {
        //Set the weight to the point_count property of the data points.
        weight: ['get', 'point_count'],

        //Optionally adjust the radius of each heat point.
        radius: 20
    });
    map.layers.add(heatMapLayer, 'labels');
    MyLayers.remove = heatMapLayer;
    console.log(MyLayers.remove)

    // Change style and camera if need be
    map.setStyle({
        style: 'grayscale_dark'
    })
    map.setCamera({
        center: [-97, 39],
        zoom: 3,
    });

    //Load a data set of points, in this case earthquake data from the USGS.
    datasource.importDataFromUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson');
}

function consistenntHeatMap() {
     //Create a data source and add it to the map.
     datasource = new atlas.source.DataSource();
     map.sources.add(datasource);
     
     //Load a data set of points, in this case some sample point of interest data.
     datasource.importDataFromUrl('/Common/data/geojson/SamplePoiDataSet.json');

     //Create a heatmap and add it to the map.
     map.layers.add(new atlas.layer.HeatMapLayer(datasource, null, {
         radius: [
             'interpolate',
             ['exponential', 2],
             ['zoom'],
             //For all zoom levels 10 or lower, set the radius to 2 pixels.
             10, 2,

             //Between zoom level 10 and 22, exponentially scale the radius from 2 pixels to 50000 pixels.
             22, 50000
         ]
     }), 'labels');
}