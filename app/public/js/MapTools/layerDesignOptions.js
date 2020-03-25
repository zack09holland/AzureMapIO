/*****************************************************
 * 
 * updateBubbleLayer 
 *    
*****************************************************/
var defaultOptions, removeDefaults;
function updatePointLayer() {
    var options = getPointInputOptions();

    //Update all the options in the bubble layer.
    previewlayers[3].setOptions(options);
    console.log(previewlayers)

    document.getElementById('designCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getPointInputOptions() {
    removeDefaults = document.getElementById('pointRemoveDefaults').checked;
    return {
        color: getPropertyValue('color', document.getElementById('pointColor').value),
        strokeColor: getPropertyValue('strokeColor', document.getElementById('pointStrokeColor').value),
        blur: getPropertyValue('blur', parseFloat(document.getElementById('pointBlur').value)),
        opacity: getPropertyValue('opacity', parseFloat(document.getElementById('pointOpacity').value)),
        strokeOpacity: getPropertyValue('strokeOpacity', parseFloat(document.getElementById('pointStrokeOpacity').value)),
        strokeWidth: getPropertyValue('strokeWidth', parseFloat(document.getElementById('pointStrokeWidth').value)),
        radius: getPropertyValue('radius', parseFloat(document.getElementById('pointRadius').value)),
        minZoom: getPropertyValue('minZoom', parseFloat(document.getElementById('pointMinZoom').value)),
        maxZoom: getPropertyValue('maxZoom', parseFloat(document.getElementById('pointMaxZoom').value)),
        visible: getPropertyValue('visible', document.getElementById('pointVisible').checked),
        pitchAlignment: getPropertyValue('pitchAlignment', getSelectValue('PitchAlignment'))
    };
}

function getPropertyValue(propertyName, value) {
    // console.log(propertyName)
    // console.log(value)
    // if (removeDefaults && defaultOptions[propertyName] === value) {
    //     return undefined;
    // }
    return value;
}

function generateRandomPoints(cnt) {
    var layerData = [];

    for (var i = 0; i < cnt; i++) {
        layerData.push(new atlas.data.Feature(new atlas.data.Point([Math.random() * 360 - 180, Math.random() * 170 - 85]), {
            title: 'Pin_' + i
        }));
    }

    return layerData;
}

function getSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}

function openPointTab(elm, tabName) {
    console.log(tabName)
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
    elm.className += " active";
}


/*********************************************
 * 
 * Jquery Onclick events
 *    
*********************************************/
// Save file
// $("#saveFileBtn").click(function () {
//     console.log("MyFiles.newFile: ", MyFiles.newFile)
//     console.log("MyLayers.newLayer: ", MyLayers.newLayer)
//     console.log("MyLayers.newLayer.options: ", MyLayers.newLayer.options)
    
//     console.log("MyLayers: ", MyLayers)

//     createLayers()    
// });