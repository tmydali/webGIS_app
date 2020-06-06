import { layerGroup } from './main.js'
import { sendToServer } from './data_sender.js'

export var layerList = []; // {sid: serial sid, name: str, layer: layer object, display: boolean}

export var sidPointer = 1;

function getNewSid() {
	return sidPointer++;
}

export function getLayerBySid(sid) {
	for(let i=0; i<layerList.length; i++) {
		if(sid == layerList[i].sid) {
			return layerList[i];
		}
	}
	
	return null; // sid not found
}

export function addToLayerList(input) {
	// input == {name: str, layer: layer object}
	let sid = getNewSid();
	let result = $('<div>').addClass('todotlist_item').addClass('form-check').data('sid', sid);
	$('<input type="checkbox">').addClass('layer_box_checkbox')
		.prop('checked', true).appendTo(result).change(function() {
				displayLayer(sid, this.checked);
		});
	$('<button>').addClass('layer_box_content').addClass('form-check-label').text(input['name']).appendTo(result);
	$('<button>').addClass('layer_delete').text('Delete').appendTo(result)
		.click(() => {
			deleteLayer(sid);
		});
	$('<hr>').appendTo(result);
	
	let object = {
		'sid': sid,
		'name': input['name'],
		'layer': input['layer'],
		'display': true
	}
	layerList.unshift(object);
	
	
	$('#layer-box').append(result);
	
}

export function clearLayer() {
	console.log(layerGroup.getLayers());
	layerGroup.clearLayers();
	layerList = [];
	
	$('#layer-box').empty();
	
	var data = { 'method': 'clear-all' };
	sendToServer(data, 'clear-all');

}

function deleteLayer(sid) {
	if(confirm('Delete this layer?')) {
		let object = getLayerBySid(sid);
		let index = layerList.indexOf(object);
		layerGroup.removeLayer(object.layer);
		layerList.splice(index, 1);

		$('.todotlist_item').each( function(index) {
			if(sid == $(this).data('sid')) {
				$(this).remove();
			}
		});

		var data = {
			'id': [layerGroup.getLayerId(object.layer).toString()],
			'method': 'clear'
		};
		sendToServer(data, 'clear');
	}
}

function displayLayer(sid, show) {
	// show == false when layer 'sid' are to hide
	layerGroup.clearLayers();
	console.log(layerList);
	
	for(let i=layerList.length-1; i>=0; i--) {
		if(sid == layerList[i].sid) {
			layerList[i].display = show;
		}
		if(layerList[i].display == true) {
			layerList[i].layer.addTo(layerGroup);
		}
	}
}
