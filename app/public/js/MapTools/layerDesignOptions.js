/*****************************************************
 * 
 * updatePointLayer 
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
        color: getPointPropertyValue('color', document.getElementById('pointColor').value),
        strokeColor: getPointPropertyValue('strokeColor', document.getElementById('pointStrokeColor').value),
        blur: getPointPropertyValue('blur', parseFloat(document.getElementById('pointBlur').value)),
        opacity: getPointPropertyValue('opacity', parseFloat(document.getElementById('pointOpacity').value)),
        strokeOpacity: getPointPropertyValue('strokeOpacity', parseFloat(document.getElementById('pointStrokeOpacity').value)),
        strokeWidth: getPointPropertyValue('strokeWidth', parseFloat(document.getElementById('pointStrokeWidth').value)),
        radius: getPointPropertyValue('radius', parseFloat(document.getElementById('pointRadius').value)),
        minZoom: getPointPropertyValue('minZoom', parseFloat(document.getElementById('pointMinZoom').value)),
        maxZoom: getPointPropertyValue('maxZoom', parseFloat(document.getElementById('pointMaxZoom').value)),
        visible: getPointPropertyValue('visible', document.getElementById('pointVisible').checked),
        pitchAlignment: getPointPropertyValue('pitchAlignment', getSelectValue('PitchAlignment'))
    };
}

function getPointPropertyValue(propertyName, value) {
    // console.log(propertyName)
    // console.log(value)
    if (removeDefaults && defaultPointOptions[propertyName] === value) {
        return undefined;
    }
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
/*****************************************************
 * 
 * updateLineLayer 
 *    
*****************************************************/
var defaultOptions, removeDefaults;
function updateLineLayer() {
    var options = getLineInputOptions();

    //Update all the options in the bubble layer.
    previewlayers[2].setOptions(options);

    document.getElementById('designCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getLineInputOptions() {
    removeDefaults = document.getElementById('pointRemoveDefaults').checked;
    return {
        color: getLinePropertyValue('color', document.getElementById('lineColor').value),
        strokeColor: getLinePropertyValue('strokeColor', document.getElementById('lineStrokeColor').value),
        blur: getLinePropertyValue('blur', parseFloat(document.getElementById('lineBlur').value)),
        opacity: getLinePropertyValue('opacity', parseFloat(document.getElementById('lineOpacity').value)),
        strokeOpacity: getLinePropertyValue('strokeOpacity', parseFloat(document.getElementById('lineStrokeOpacity').value)),
        strokeWidth: getLinePropertyValue('strokeWidth', parseFloat(document.getElementById('lineStrokeWidth').value)),
        radius: getLinePropertyValue('radius', parseFloat(document.getElementById('lineRadius').value)),
        minZoom: getLinePropertyValue('minZoom', parseFloat(document.getElementById('lineMinZoom').value)),
        maxZoom: getLinePropertyValue('maxZoom', parseFloat(document.getElementById('lineMaxZoom').value)),
        visible: getLinePropertyValue('visible', document.getElementById('lineVisible').checked),
        pitchAlignment: getLinePropertyValue('pitchAlignment', getSelectValue('PitchAlignment'))
    };
}

function getLinePropertyValue(propertyName, value) {
    // console.log(propertyName)
    // console.log(value)
    if (removeDefaults && defaultPointOptions[propertyName] === value) {
        return undefined;
    }
    return value;
}


function getSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}

function openLineTab(elm, tabName) {
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
