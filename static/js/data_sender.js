import { layerList } from './layers.js'

export function sendToServer(data, method, item=null) {
	var message = JSON.stringify(data);
	if(method == 'new') {
	
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: '/vectors',
			dataType: 'json', 
			data: message,
			success: function() {
				console.log(method + ' id:' + data['id'] + ' Success');
			},
			error: function(e) {
				console.log(method + ' id:' + data['id'] + ' Error');
			}
		});
	}
	else if(method == 'overlay') {
		var layerGroup = item[0];
		var newLayer = item[1];
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: '/vectors',
			dataType: 'json', 
			data: message,
			success: function(data) {
				L.geoJSON(data, {
					color: 'green',
					fillOpacity: 0.9
				}).addTo(newLayer);
				console.log('Overlay Success');
			},
			error: function() {
				layerGroup.removeLayer(newLayer);
				let index = layerList.indexOf(newLayer);
				layerList.splice(index, 1);
				$('.todotlist_item').each( function(index) {
					if(id == $(this).data('sid')) {
						$(this).remove();
					}
				});
				console.log('Overlay Error');
			}
		});
	}
	else if(method == 'clear' || method == 'clear-all') {
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: '/vectors',
			dataType: 'json', 
			data: message,
			success: function() {
				console.log('Clear Success');
			},
			error: function() {
				console.log('Clear Error');
			},
		});
	}
}