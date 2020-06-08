import { layerGroup } from './main.js'
import { sendToServer } from './data_sender.js'

export var layerList = []; // {sid: serial sid, name: str, layer: layer object, display: boolean}
export var focusLayerSid = -1; // sid
export var sidPointer = 1;

// color control
var colorList = ['royalblue', 'hotpink', 'seagreen', 'darkorange', 'gray',
				 'gold', 'SlateBlue', 'LightCoral', 'SpringGreen', 'FireBrick'];
var colorPointer = 8;
export function getNextColor() {
	colorPointer = (colorPointer+1) % colorList.length;
	return colorList[colorPointer];
};

export function makeLayerFocused(sid) {
	if(sid < 0) { return; }
	focusLayerSid = sid;
	$('.todotlist_item').each(function() {
		if(sid == $(this).data('sid')) {
			$(this).css({'background-color': 'PeachPuff'});
		}
		else {
			$(this).css({'background-color': 'initial'});
		}
	});
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
		.prop('checked', true).appendTo(result)
		.change(function() {
				displayLayer(sid, this.checked);
		});
	$('<button>').addClass('layer-fun').addClass('form-check-label')
		.text(input['name'])
		.appendTo(result).click(() => {
			makeLayerFocused(sid);
		});
	$('<button>').addClass('layer-fun')
		.text('D')
		.appendTo(result).click(() => {
			deleteLayer(sid);
		});
	$('<button>').addClass('layer-fun')
		.text('R')
		.appendTo(result).click(() => {
			renameLayer(sid);
		});
	
	let object = {
		'sid': sid,
		'name': input['name'],
		'layer': input['layer'],
		'display': true
	}
	layerList.unshift(object);
	
	
	$('#layer-box').prepend(result);
	makeLayerFocused(sid);
}

export function clearLayer() {
	console.log(layerGroup.getLayers());
	layerGroup.clearLayers();
	layerList = [];
	focusLayerSid = -1;
	
	$('#layer-box').empty();
	
	var data = { 'method': 'clear-all' };
	sendToServer(data, 'clear-all');

}

export function layerMove(direction) {
	let obj = getLayerBySid(focusLayerSid);
	if(obj == null) { return; }
	let sid = obj.sid;
	let index = layerList.indexOf(obj);
	let item = null;
	
	$('.todotlist_item').each(function(i) {
		if(sid == $(this).data('sid')) {
			item = $(this).detach();
		}
	});
	
	if(direction == 'up') {
		if(index == 0) {
			$('#layer-box').prepend(item);
		}
		else {
			let objToMove = layerList.splice(index, 1)[0];
			layerList.splice(index-1, 0, objToMove);
			$('.todotlist_item').eq(index-1).before(item);
		}
	}
	else if(direction == 'down') {
		if(index == layerList.length-1) {
			$('#layer-box').append(item);
		}
		else {
			let objToMove = layerList.splice(index, 1)[0];
			layerList.splice(index+1, 0, objToMove);
			$('.todotlist_item').eq(index).after(item);
		}
	}
	
	layerGroup.clearLayers();
	for(let i=layerList.length-1; i>=0; i--) {
		let obj = layerList[i];
		if(obj.display == true) {
			obj.layer.addTo(layerGroup);
		}
	}
}

function getNewSid() {
	return sidPointer++;
}

function deleteLayer(sid) {
	if(confirm('Delete this layer?')) {
		let object = getLayerBySid(sid);
		let index = layerList.indexOf(object);
		let nextFocusSid = focusLayerSid;
		layerGroup.removeLayer(object.layer);
		layerList.splice(index, 1);
		if(focusLayerSid == object.sid) {
			index = 
				0 == layerList.length ? -1 :
				index < layerList.length ? index :
				layerList.length - 1;
			nextFocusSid = index < 0 ? -1 : layerList[index].sid
		}
		
		makeLayerFocused(nextFocusSid);

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

function renameLayer(sid) {
	let name = prompt('Rename for this layer');
	if(!name) {
		name = getLayerBySid(sid).name;
	}
	getLayerBySid(sid)['name'] = name;
	
	$('.todotlist_item').each( function(index) {
		if(sid == $(this).data('sid')) {
			$(this).children('.form-check-label').text(name);
		}
	});
}

function displayLayer(sid, show) {
	// show == false when layer 'sid' are to hide
	layerGroup.clearLayers();
	console.log(layerList);
	
	for(let i=layerList.length-1; i>=0; i--) {
		let obj = layerList[i];
		if(sid == obj.sid) {
			obj.display = show;
		}
		if(obj.display == true) {
			obj.layer.addTo(layerGroup);
		}
	}
}
