import { sendToServer } from './data_sender.js'
import { sidPointer, layerList, focusLayerSid } from './layers.js'
import { getLayerBySid, addToLayerList, clearLayer,
		layerMove, getNextColor} from './layers.js'

export function setButtonCallback(map, layerGroup) {
	// tools
	$("#save_all_btn").button().click(() => {
		
		// get all layer ids
		$('#popup-footbar').empty();
		
		for(let obj of layerList) {
			let file_name = obj.name;
			let data =JSON.stringify(obj.layer.toGeoJSON());
			
			let data_fin ="data:text/json;charset=utf-8," + encodeURIComponent(data);
			let url = $('<a/>').text("download JSON")
			.attr({'href':data_fin,'download':file_name+".geojson",'id':'urll'})
			.appendTo('#map-wrapper').click(function() { $(this).remove() })[0].click();
		}
	});
    
	$("#save_btn").button().click(() => {
		// get all layer ids
		$('#popup-footbar').empty();
		var layerSel1 = $('<select id=layer-sel1>').selectmenu();
		for(let obj of layerList) {

			let data =JSON.stringify(obj.layer.toGeoJSON());
			layerSel1.append($('<option>', {value: data, text: obj.name}));
		}
		layerSel1.show();
		
		var button = $('<button/>').text("OK").click( () => {
			let data2=$('#layer-sel1').val();
			let data3=$('#layer-sel1').find("option:selected").text();
			let data_fin ="data:text/json;charset=utf-8," + encodeURIComponent(data2);
			let url = $('<a/>').text("download JSON")
			.attr({'href':data_fin,'download':data3+".geojson"})
			.appendTo('#popup-window').click(function() { $(this).remove() })[0].click();
			$('#popup-window').hide();
		}).appendTo('#popup-footbar');
		$('#popup-content').html('layer')
			.append(layerSel1)
		$('#popup-window').css({'display': 'flex'});
	});

	$("#clear_btn").button().click(clearLayer);
	$("#buffer_btn").button().click( () => {
		// get all layer ids
		let layerSel = $('<select id=layer-sel>').selectmenu();
		for(let obj of layerList) {
			layerSel.append($('<option>', {value: obj.sid, text: obj.name}));
		}
		layerSel.show();
		$('#popup-content').html('Layer ')
			.append(layerSel)
			.append('<br>' + '<b>Buffer range </b>')
			.append('<input id="number" type="number" />')
			.append(' meters');
		$('#popup-footbar').empty();
		$('<button>').text('OK').click( () => {
			buffer(layerGroup);
		}).appendTo('#popup-footbar');

		$('#popup-window').css({'display': 'flex'});
	});
    
	$('#upload_btn').button()
		.click( () => {
		$('#popup-content').html( 
			'<h2>Choose your own GeoJSON file</h2>' +
			'<input id="file" type="file" accept=".json, .geojson" />');
		$('#popup-window').css({'display': 'flex'});
		$('#popup-footbar').empty();
		$('#file').change( (event) => {
			var reader = new FileReader();
			var onReaderLoad = (e) => {
				try {
					var obj = JSON.parse(e.target.result);
					var layer = L.geoJSON(obj, {
						color: getNextColor(),
						fillOpacity: 0.9
					}).addTo(layerGroup);
					console.log(layer);
					// send data to server
					var data = {
						'method': 'new',
						'id': [layerGroup.getLayerId(layer).toString()],
						'data': layer.toGeoJSON()
					};
					sendToServer(data, 'new');
					$('#popup-window').hide();
					
					var input ={
						'name': 'layer ' + sidPointer,
						'layer': layer
					}
					addToLayerList(input);
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
		new_layer(map,layerGroup);
	});
	
	$('#overlay').button().click( () => {
		var set_op = ['union', 'intersection', 'symmetric_difference', 'difference', 'identity'];
		var selector = $('<select id=method-sel>').selectmenu();
		for(var i of set_op) {
			selector.append($('<option>', {value: i, text: i}));
		}
		selector.show();
		
		// get all layer ids
		var layerSel1 = $('<select id=layer-sel1>').selectmenu();
		for(let obj of layerList) {
			let id = layerGroup.getLayerId(obj.layer);
			layerSel1.append($('<option>', {value: id, text: obj.name}));
		}
		layerSel1.show();
		var layerSel2 = $('<select id=layer-sel2>').selectmenu();
		for(let obj of layerList) {
			let id = layerGroup.getLayerId(obj.layer);
			layerSel2.append($('<option>', {value: id, text: obj.name}));
		}
		layerSel2.show();
		
		$('#popup-footbar').empty();
		var button = $('<button/>').text("OK").click( () => {
			var newLayer = L.featureGroup().addTo(layerGroup);
			var newId = layerGroup.getLayerId(newLayer);
			var data = {
				'method': 'overlay',
				'id': [newId.toString(), $('#layer-sel1').val().toString(), $('#layer-sel2').val().toString()], 
				'how': $('#method-sel').val()
			};
			sendToServer(data, 'overlay', [layerGroup, newLayer]);
			$('#popup-window').hide();
			
			var input ={
				'name': 'layer ' + sidPointer,
				'layer': newLayer
			}
			addToLayerList(input);
		}).appendTo('#popup-footbar');
		
		$('#popup-content').html('<b>Overlay method </b>')
			.append(selector)
			.append('<br> <b>Layer A </b>')
			.append(layerSel1)
			.append('<br> <b>Layer B </b>')
			.append(layerSel2)
		
		$('#popup-window').css({'display': 'flex'});
		
	});
	
	$('#feat_attr').button().click( () => {
		if(layerList.length == 0) { return; }
		$('#popup-content').html('<div id="df_container"></div>');
		create_df_view(layerGroup);
		$('#popup-window').css({'display': 'flex'});
	});

	// popup-window
	$('#close_btn').click( () => {
		$('#popup-window').hide();
		$('#popup-footbar').empty();
	});

	// sidebar
	$('#new_layer').button().click(() => {
		new_layer(map,layerGroup);
	});
	
	$('#layer-up').button().click(() => {
		layerMove('up');
	});
	
	$('#layer-down').button().click(() => {
		layerMove('down');
	});

}

function buffer(layerGroup) {
	if(layerList.length == 0) { return; }
	
	console.log($('#layer-sel').val());
	let srcLayer = getLayerBySid($('#layer-sel').val()).layer;
	let range = $('#number').val();
	if(!range) {
		alert('Enter a number!');
		return;
	}
	let buffered = turf.buffer(srcLayer.toGeoJSON(), range, {units: 'meters'});
	let layer = L.geoJSON(buffered, {
		color: getNextColor(),
		fillOpacity: 0.9
	}).addTo(layerGroup);
	console.log(layer);
	
	// send data to server
	var data = {
		'method': 'new',
		'id': [layerGroup.getLayerId(layer).toString()],
		'data': layer.toGeoJSON()
	};
	sendToServer(data, 'new');
	$('#popup-window').hide();

	var input ={
		'name': 'layer ' + sidPointer,
		'layer': layer
	}
	addToLayerList(input);
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
        		var feature = item.feature = {}; // Initialize feature
    			feature.type = "Feature"; // Initialize feature.type
    			feature.properties = {};
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
			sendToServer(data, 'new');
		
			var input ={
				'name': $('#text').val(),
				'layer': layer
			}
			addToLayerList(input);
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
		let pline = map.editTools.startPolyline();
		let color = getNextColor();
		pline.setStyle({color: color});
		pline.addTo(layer);
		map.on('editable:drawing:end', (e) => {
			pline = map.editTools.startPolyline();
			pline.setStyle({color: color});
			pline.addTo(layer);
		});
	}
	else if (type == 'polygon') {
		let pgon = map.editTools.startPolygon();
		let color = getNextColor();
		pgon.setStyle({
			color: color,
			fillOpacity: 0.9
		});
		pgon.addTo(layer);
		map.on('editable:drawing:end', (e) => {
			pgon = map.editTools.startPolygon();
			pgon.setStyle({
				color: color,
				fillOpacity: 0.9
			});
			pgon.addTo(layer);
		});
	}
}

function create_df_view(layerGroup) {
	let thisLayer = getLayerBySid(focusLayerSid).layer;
	let layer = thisLayer.toGeoJSON();
	console.log(layerGroup);
	let prop_name_div = $('<div id="prop_name">').addClass('feature_title').appendTo('#df_container');
	
	for(let i=0; i<layer.features.length; i++) {
		let feature_div = $('<div>').addClass('feature_div').appendTo('#df_container');
		let props = layer.features[i].properties;
		Object.keys(props).forEach( (ckey, cindex) => {
			$('<input>').attr({
				class: 'df_entry',
				value: props[ckey], 
				'data-dtype': 'str'
			}).appendTo(feature_div);
			if(i == 0) {
				createPropNameDiv(ckey);
			}
		});
	};
	$('<button id="new_col">').text('New').click(function() {
		var new_name = prompt('New name for the column');
		if(new_name != null) {
			$(this).detach();
			new_name = new_name || 'New Attr.';
			createPropNameDiv(new_name);
			$(this).appendTo(prop_name_div);
			$('.feature_div').each(function(i) {
				let props = layer.features[i].properties; 
				props[new_name] = '';
				$('<input>').attr({
					class: 'df_entry',
					value: props[new_name], 
					'data-dtype': 'str'
				}).appendTo(this);
			});
			let column = $('.feature_title').children().length;
			$('.feature_div').each(function() {
				$(this).show();
			});
			let str = 'repeat(' + column + ',100px)';
			$('.feature_div').css({'grid-template-columns': str});
			$('.feature_title').css({'grid-template-columns': str});
		}
		
	}).appendTo(prop_name_div);
	
	let column = $('.feature_title').children().length;
	var str = 'repeat(' + column + ',100px)';
	if(column <= 1) {
		// remove empty div if no feature
		$('.feature_div').each(function() {
			$(this).hide();
		});
	}
	$('.feature_div').css({'grid-template-columns': str});
	$('.feature_title').css({'grid-template-columns': str});
	
	$('#popup-footbar').empty();
	$('<button>').text('OK').click( () => {
		var keys = [];
		$('.feature_title').children().each(function() {
			keys.push($(this).children('#text').text());
		});
		// console.log(keys);

		var i = 0;
		$('.feature_div').each(function() {
			var j = 0;
			var feature = layer.features[i++];
			feature.properties = {};
			var props = feature.properties;
			$(this).children().each(function() {
				props[keys[j++]] = $(this).val();
			});
		});
		// remove old layer
		var data = {
			'method': 'clear',
			'id': [layerGroup.getLayerId(thisLayer).toString()],
		};
		layerGroup.removeLayer(thisLayer);
		sendToServer(data, 'clear');
		// put on new layer
		let selfColor = thisLayer._layers[Object.keys(thisLayer._layers)[0]].options.color;
		console.log(selfColor);
		layer = L.geoJSON(layer, {
			color: selfColor,
			fillOpacity: 0.9
		});
		layerGroup.addLayer(layer);
		getLayerBySid(focusLayerSid).layer = layer;
		var data = {
			'method': 'new',
			'id': [layerGroup.getLayerId(layer).toString()],
			'data': layerGroup.toGeoJSON()
		};
		sendToServer(data, 'new');
		$('#popup-window').hide();

	}).css({'width': '70px'}).appendTo('#popup-footbar');
	
	$('<button>').text('Cancel').click( () => {
		$('#popup-window').hide();
	}).css({'width': '70px'}).appendTo('#popup-footbar');
}

function attrRename() {
	let key = $(this).parent().children('#text').text();
	let new_key = prompt('Rename for column "' + key + '"?');
	$(this).parent().children('#text').text(new_key);
}

function attrDelete() {
	let key = $(this).parent().children('#text').text();
	if(confirm('Delete column "' + key + '"?')) {
		let index = $(this).parent().index();
		$(this).parent().remove();
		$('.feature_div').each(function() {
			$(this).children().each(function(i) {
				if(i == index) {
					$(this).remove();
				}
			});
		});
		let column = $('.feature_title').children().length;
		let str = 'repeat(' + column + ',100px)';
		$('.feature_div').css({'grid-template-columns': str});
		$('.feature_title').css({'grid-template-columns': str});
	}
}

function createPropNameDiv(key) {
	let text = $('<div id="text">').text(key).css({'grid-row': '1 / 3'});
	let rename_btn = $('<button>').text('R').click(attrRename);
	let del_btn = $('<button>').text('D').click(attrDelete);
	let title_div = $('<div>').css({
		'display': 'grid',
		'grid-template-rows': '50% 50%',
		'grid-template-columns': '80% 20%'
	}).appendTo('#prop_name');
	title_div.append(del_btn).append(rename_btn).append(text);	
}

function new_layer(map, layerGroup){
	var selector = $('<select id=sel>').selectmenu()
			.append($('<option>', {value: 'point', text: 'Point'}))
			.append($('<option>', {value: 'polyline', text: 'Polyline'}))
			.append($('<option>', {value: 'polygon', text: 'Polygon'}))
			.show();
		$('#popup-footbar').empty();
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
		}).appendTo('#popup-footbar');

		$('#popup-content').html( 
			'<b>Name </b>' +
			'<input id="text" type="text" />')
			.append(selector)			
		$('#popup-window').css({'display': 'flex'});
}