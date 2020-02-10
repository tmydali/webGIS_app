export default class Basics {
	
	static layerGroup;
	
	constructor(map, layerGroup) {
		this.map = map;
		Basics.layerGroup = layerGroup;
	}
	
	setButtonCallback() {
		// button callback
		$("#clear_btn").click( () => clearLayer(Basics.layerGroup));
		$("#buffer_btn").click( () => {
			let buffered = buffer(Basics.layerGroup, 500);
			L.geoJSON(buffered).addTo(Basics.layerGroup);
		});
		$('#upload_btn').click( () => {
			$('#popup-content').html( 
				'<h2>Choose your own GeoJSON file</h2>' +
				'<input id="file" type="file" accept=".json, .geojson" />');
			$('#popup-window').show();
			$('#file').change(this.onFileLoad);
			console.log($('#file'));
		});
		$('#close_btn').click( () => {
			$('#popup-window').hide();
		});
	}

	addPointListener() {
		this.map.on('click', (e) => {
			if(e.originalEvent.button == 0) {
				//alert("You clicked the map at " + e.latlng);
				L.marker(e.latlng).addTo(Basics.layerGroup);
			}
		});
	}
	
	onFileLoad(event) {
		var reader = new FileReader();
		var onReaderLoad = (event) => {
			try {
				var obj = JSON.parse(event.target.result);
				$('#popup-window').hide();
				Basics.addToLayerGroup(obj)
				console.log(obj);
			}
			catch(err) {
				console.log(err);
			}
		}
		reader.onload = onReaderLoad;
		reader.readAsText(event.target.files[0]);
	}
	
	static addToLayerGroup(obj) {
		console.log(Basics.layerGroup);
		L.geoJSON(obj).addTo(Basics.layerGroup);
	}
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

