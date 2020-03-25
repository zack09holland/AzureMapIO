/*********************************************
 * 
 * removeLayer
 *    
*********************************************/
function removeLayer(input) {
    // console.log(map.layers.layers)
    // console.log(MyLayers.polygonLayer.id)
    map.layers.remove(input.id)
    // map.setStyle({
    //     style: 'light'
    // })
}
