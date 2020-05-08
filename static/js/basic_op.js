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
	
	$('#send_msg').button().click( () => {
		var set_op = ['union', 'intersection', 'symmetric_difference', 'difference', 'identity'];
		var selector = $('<select id=method-sel>').selectmenu();
		for(var i of set_op) {
			selector.append($('<option>', {value: i, text: i}));
		}
		selector.show();
		
		// get all layer ids
		var layer_id = [];
		var list = layerGroup.getLayers();
		for(var i of list) {
			layer_id.push(layerGroup.getLayerId(i))
		}
		console.log(layer_id);
		
		var layerSel1 = $('<select id=layer-sel1>').selectmenu();
		for(var i of layer_id) {
			layerSel1.append($('<option>', {value: i, text: i}));
		}
		layerSel1.show();
		var layerSel2 = $('<select id=layer-sel2>').selectmenu();
		for(var i of layer_id) {
			layerSel2.append($('<option>', {value: i, text: i}));
		}
		layerSel2.show();
		
		var button = $('<button/>').text("OK").click( () => {
			var newLayer = L.featureGroup().addTo(layerGroup);
			var newId = layerGroup.getLayerId(newLayer);
			var data = {
				'method': 'overlay',
				'id': [newId.toString(), $('#layer-sel1').val().toString(), $('#layer-sel2').val().toString()], 
				'how': $('#method-sel').val()
			};
			
			var message = JSON.stringify(data);
			$.ajax({
				type: 'POST',
				contentType: 'application/json',
				url: '/vectors',
				dataType: 'json', 
				data: message,
				success: function(data) {
					L.geoJSON(data, {
						style: function() {
							return {color: 'green'};
						}
					}).addTo(newLayer);
					console.log('Success');
				},
				error: function() {
					layerGroup.removeLayer(newLayer);
					console.log('Error');
				}
			});
			$('#popup-window').hide();
		});
		
		$('#popup-content').html('method')
			.append(selector)
			.append('layer A')
			.append(layerSel1)
			.append('layer B')
			.append(layerSel2)
			.append(button);
		
		$('#popup-window').show();
		
	});

	// popup-window
	$('#close_btn').click( () => {
		$('#popup-window').hide();
	});
}

function clearLayer(layerGroup) {
	console.log(layerGroup.getLayers());
	layerGroup.clearLayers();
	var data = { 'method': 'clear-all' };

	var message = JSON.stringify(data);
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		url: '/vectors',
		dataType: 'json', 
		data: message,
		success: function() {
			console.log('Success');
		},
		error: function() {
			console.log('Error');
		}
	});
}

function buffer(srcLayer, distance) {
	var buffered = turf.buffer(srcLayer.toGeoJSON(), distance, {units: 'meters', steps: 64});
	console.log(buffered);
	return buffered;
}

function newLayerMode(map, layerGroup, type) {
	// Prepare an temporary layer, lock all the other features, and show and "finish" button
	var layer = L.featureGroup().addTo(map);
	$('.tools').each( function(index) {
		$(this).button('option', 'disabled', true);
		});
	$('<button>').text('Finish')
		.button()
		.appendTo($('#toolbar'))
		.addClass('tools')
		.click( function(e) {
			$('.tools').each( function(index) {
				$(this).button('option', 'disabled', false);
			});
			map.off('click keypress editable:drawing:end');
			layer.addTo(layerGroup);
			layer.eachLayer( (item) => {
				item.disableEdit();
				if('isEmpty' in item && item.isEmpty()) {
					layer.removeLayer(item);
				}
			});
			// send data to server
			var data = {
				'method': 'new',
				'id': [layerGroup.getLayerId(layer).toString()],
				'data': layer.toGeoJSON()
			};
			console.log(data);
			var message = JSON.stringify(data);
			$.ajax({
				type: 'POST',
				contentType: 'application/json',
				url: '/vectors',
				dataType: 'json', 
				data: message,
				success: function() {
					console.log('Success');
				},
			});	
		
			$(this).remove();
		});
	
	if(type == 'point') {
		map.on('click', (e) => {
			if(e.originalEvent.button == 0) {
				L.marker(e.latlng).addTo(layer).enableEdit(map);
			}
		});
		
	}
	else if(type == 'polyline') {
		var pline = map.editTools.startPolyline()
		pline.addTo(layer);
		map.on('editable:drawing:end', (e) => {
			pline = map.editTools.startPolyline()
			pline.addTo(layer);
		});
	}
	else if (type == 'polygon') {
		var pgon = map.editTools.startPolygon()
		pgon.addTo(layer);
		map.on('editable:drawing:end', (e) => {
			pgon = map.editTools.startPolygon()
			pgon.addTo(layer);
		});
	}
}
