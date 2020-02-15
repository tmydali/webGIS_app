export function setButtonCallback(map, layerGroup) {
	// tools
	$("#clear_btn").click( () => clearLayer(layerGroup));
	$("#buffer_btn").click( () => {
		let buffered = buffer(layerGroup, 500);
		L.geoJSON(buffered).addTo(layerGroup);
	});
	$('#upload_btn').click( () => {
		$('#popup-content').html( 
			'<h2>Choose your own GeoJSON file</h2>' +
			'<input id="file" type="file" accept=".json, .geojson" />');
		$('#popup-window').show();
		$('#file').change( (event) => {
			var reader = new FileReader();
			var onReaderLoad = (e) => {
				try {
					var obj = JSON.parse(e.target.result);
					$('#popup-window').hide();
					L.geoJSON(obj).addTo(layerGroup);
					console.log(obj);
				}
				catch(err) {
					console.log(err);
				}
			}
			reader.onload = onReaderLoad;
			reader.readAsText(event.target.files[0]);
		});
		console.log($('#file'));
	});

	$('#newPT_btn').click( () => {
		var button = $('<button/>').text("OK").click( () => {
			let text = $('#text').val();
			if(!text) { 
				// empty string
				console.log('text can\'t be empty');
			}
			else {
				console.log(text);
			}
		});
		$('#popup-content').html( 
			'<b>Name </b>' +
			'<input id="text" type="text" />').append(button);
		
		$('#popup-window').show();
		console.log($('#file'));
	});

	// popup-window
	$('#close_btn').click( () => {
		$('#popup-window').hide();
	});
}

function clearLayer(layerGroup) {
	// layerGroup is an array
	console.log(layerGroup.getLayers());
	layerGroup.clearLayers();
	/*layerGroup.forEach( item => {
		item.clearLayers();
	});*/
}

function buffer(srcLayer, distance) {
	var buffered = turf.buffer(srcLayer.toGeoJSON(), distance, {units: 'meters', steps: 64});
	console.log(buffered);
	return buffered;
}

export function addPointListener(map, layerGroup) {
	map.on('click', (e) => {
		if(e.originalEvent.button == 0) {
			//alert("You clicked the map at " + e.latlng);
			L.marker(e.latlng).addTo(layerGroup);
		}
	});
}
