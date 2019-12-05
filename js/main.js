var mymap = L.map('mapid').setView([22.999, 120.220], 17);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
	tileSize: 512,
  	zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoidG15ZGFsaSIsImEiOiJjazB3MzlrMXowdTUwM2lwZGlhMml5ZDduIn0.i56vbB-1XI6HPe_zEcDr1g'
}).addTo(mymap);

var layerGroup = L.layerGroup().addTo(mymap);
var bufferGroup = L.layerGroup().addTo(mymap);
// on click
function onMapClick(e) {
	if(e.originalEvent.button == 0) {
		//alert("You clicked the map at " + e.latlng);
		L.marker(e.latlng).addTo(layerGroup);
 	}
}

function clearMap() {
	layerGroup.clearLayers();
	bufferGroup.clearLayers();
}

function buffer_500m() {
	var buffered = turf.buffer(layerGroup.toGeoJSON(), 0.5, {units: 'kilometers', steps: 64});
	L.geoJSON(buffered).addTo(bufferGroup);
	console.log(buffered);
}


mymap.on('click', onMapClick);