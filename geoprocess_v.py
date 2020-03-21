import geopandas as gpd

def toDataFrame(json):
	gdf = gpd.GeoDataFrame.from_features(json['features'])
	gdf.crs = {'init': 'epsg:4326'}
	gdf = gdf.to_crs(epsg=3826)
	return gdf

def addBuffer(layer, radius):
	buf = layer.buffer(radius)
	buf = buf.to_crs(epsg=4326)
	return buf