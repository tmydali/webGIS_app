# webGIS_app
This is a webGis app with basic GIS tools

## Environment
+ jQuery 3.4.1
+ Leaflet 1.6.0
+ Turf.js 5.2.0

## Server
目前使用python的simple http server做為後端，首先切換到專案資料夾(index.html所在目錄)
```
cd webGIS_app
```
使用python原生提供之server
```
python -m http.server
```
在瀏覽器輸入`localhost:8000`即可連入該資料夾，建議使用Google Chrome。
