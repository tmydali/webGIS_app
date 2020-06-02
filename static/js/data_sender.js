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
	}
	else if(method == 'clear' || method == 'clear-all') {
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
				console.log('Success');
			},
		});
	}
}