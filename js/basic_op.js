export function setButtonCallback(map, layerGroup) {
	// tools
	$("#clear_btn").button().click( () => clearLayer(layerGroup));
	$("#buffer_btn").button()
		.click( () => {
		let buffered = buffer(layerGroup, 500);
		L.geoJSON(buffered).addTo(layerGroup);
	});
	$('#upload_btn').button()
		.click( () => {
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

	$('#newPT_btn').button()
		.click( () => {
		var selector = $('<select id=sel>').selectmenu()
			.append($('<option>', {value: 'point', text: 'Point'}))
			.append($('<option>', {value: 'polyline', text: 'Polyline'}))
			.append($('<option>', {value: 'polygon', text: 'Polygon'}))
			.show();
		var button = $('<button/>').text("OK").click( () => {
			let text = $('#text').val();
			if(!text) { 
				// empty string
				console.log('text can\'t be empty');
			}
			else {
				newLayerMode(map, layerGroup, $('#sel').val());
				$('#popup-window').hide();
			}
		});
		$('#popup-content').html( 
			'<b>Name </b>' +
			'<input id="text" type="text" />')
			.append(selector)
			.append(button);
		
		$('#popup-window').show();
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

function newLayerMode(map, layerGroup, type) {
	// Prepare an temporary layer, lock all the other features, and show and "finish" button
	var layer = L.layerGroup().addTo(map);
	$('.func').each( function(index) {
		$(this).button('option', 'disabled', true);
		});
	$('<button>').text('Save')
		.button()
		.appendTo($('#functions'))
		.addClass('func')
		.click( function(e) {
			$('.func').each( function(index) {
				$(this).button('option', 'disabled', false);
			});
			map.off('click keypress');
			//map.off('dbclick');
			layer.addTo(layerGroup);
			console.log(layerGroup);
			$(this).remove();
		});
	
	if(type == 'point') {
		map.on('click', (e) => {
			if(e.originalEvent.button == 0) {
				L.circleMarker(e.latlng).addTo(layer);
			}
		});
		
	}
	else if(type == 'polyline') {
		var pline = L.polyline([]).addTo(layer);
		var latlngs = [[]], i = 0;
		map.on('click', (e) => {
			if(e.originalEvent.button == 0) {
				latlngs[i].push(e.latlng);
				pline.setLatLngs(latlngs);
			}
		});
		map.on('keypress', (e) => {
			if(e.originalEvent.keyCode == 32) {
				// keyCode 32 is space
				latlngs.push([]);
				++i;
				console.log(pline.getLatLngs());
			}
		});
	}
	else if (type == 'polygon') {
		
	}
}

function inEditMode() {
	
	
}

