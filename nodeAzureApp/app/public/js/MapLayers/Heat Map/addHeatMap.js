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
    clusteredHeatMapLayer = new atlas.layer.HeatMapLayer(datasource, null, {
        //Set the weight to the point_count property of the data points.
        weight: ['get', 'point_count'],

        //Optionally adjust the radius of each heat point.
        radius: 20
    });
    map.layers.add(clusteredHeatMapLayer, 'labels');
    MyLayers.clusteredHeatMapLayer = clusteredHeatMapLayer;

    // Change style and camera if need be
    // map.setStyle({
    //     style: 'grayscale_dark'
    // })
    // map.setCamera({
    //     center: [-97, 39],
    //     zoom: 3,
    // });

    //Load a data set of points, in this case earthquake data from the USGS.
    datasource.importDataFromUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson');
}

function consistentHeatMap() {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Load a data set of points, in this case some sample point of interest data.
    datasource.importDataFromUrl('data/geojson/SamplePoiDataSet.json');

    //Create a heatmap and add it to the map.
    consistentHeatMapLayer = new atlas.layer.HeatMapLayer(datasource, null, {
        radius: [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            //For all zoom levels 10 or lower, set the radius to 2 pixels.
            10, 2,

            //Between zoom level 10 and 22, exponentially scale the radius from 2 pixels to 50000 pixels.
            22, 50000
        ]
    });
    map.layers.add(consistentHeatMapLayer, 'labels');
    MyLayers.consistentHeatMapLayer = consistentHeatMapLayer;
    // map.setCamera({
    //     center: [-97, 39],
    //     zoom: 3,
    // });
};

function weightedHeatMap() {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Load a data set of points, in this case earthquake data from the USGS.
    datasource.importDataFromUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');

    //Create a heatmap and add it to the map.
    weightedHeatMapLayer = new atlas.layer.HeatMapLayer(datasource, null, {
        weight: [
            'interpolate',
            ['exponential', 2], //Using an exponential interpolation since earthquake magnitudes are on an exponential scale.
            ['get', 'mag'],
            0, 0,
            6, 1 //Any earthquake above a magnitude of 6 will have a weight of 1
        ],
        radius: [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            22, 200
        ],
        color: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
        ]
    });
    map.layers.add(weightedHeatMapLayer, 'labels');
    MyLayers.weightedHeatMapLayer = weightedHeatMapLayer;
    // map.setCamera({
    //     center: [-97, 39],
    //     zoom: 3,
    // });
};
