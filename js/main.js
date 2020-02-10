import Basics from './basic_op.js';

var map = L.map('mapid').setView([22.999, 120.220], 17);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
	tileSize: 512,
  	zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoidG15ZGFsaSIsImEiOiJjazB3MzlrMXowdTUwM2lwZGlhMml5ZDduIn0.i56vbB-1XI6HPe_zEcDr1g'
}).addTo(map);

var layerGroup = L.layerGroup().addTo(map);
var Bass = new Basics(map, layerGroup);
Bass.setButtonCallback();
Bass.addPointListener();


