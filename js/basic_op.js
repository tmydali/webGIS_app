export function clearLayer(layerGroup) {
	// layerGroup is an array
	console.log(layerGroup);
	layerGroup.clearLayers();
	/*layerGroup.forEach( item => {
		item.clearLayers();
	});*/
}

export function buffer(srcLayer, distance) {
	var buffered = turf.buffer(srcLayer.toGeoJSON(), distance, {units: 'meters', steps: 64});
	console.log(buffered);
	return buffered;
}

function addPoint(e, layer) {
	if(e.originalEvent.button == 0) {
		//alert("You clicked the map at " + e.latlng);
		L.marker(e.latlng).addTo(layer);
	}
}

export function addPointListener(map, layer) {
	map.on('click', function (e) {
		if(e.originalEvent.button == 0) {
			//alert("You clicked the map at " + e.latlng);
			L.marker(e.latlng).addTo(layer);
		}
	});
}
