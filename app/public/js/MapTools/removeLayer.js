/**********************************************************************************************************************
 * 
 *  Remove Layer
 *  
 *  - removeLayer(input)
 *      - Takes in a layer object and removes it from the map via its id
 *    
**********************************************************************************************************************/
function removeLayer(input) {
    // console.log(map.layers.layers)
    // console.log(MyLayers.polygonLayer.id)
    map.layers.remove(input.id)
    // map.setStyle({
    //     style: 'light'
    // })
}
