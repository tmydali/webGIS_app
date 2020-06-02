# webGIS_app
This is a webGis app with basic GIS tools

## Environment
+ jQuery 3.4.1
+ Leaflet 1.6.0
+ Turf.js 5.2.0
+ python 3.6.9
+ flask 1.1.1
+ geopandas 0.5.1
+ Rtree 0.8.3 (需要再安裝C library `sudo apt-get update && apt-get install -y libspatialindex-dev`)

## Server
使用python with flask做為後端，首先切換到專案資料夾
```
cd webGIS_app
```
使用python原生提供之server
```
python app.py
```
在瀏覽器輸入`localhost:5000`即可連入該專案，建議使用Google Chrome。
