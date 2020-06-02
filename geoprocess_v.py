import geopandas as gpd

class pandaFrame():
	def __init__(self):
		# store in key-value form
		self.DF = {}
		
	def actions(self, rawData):
		method = rawData['method']
		if method == 'overlay':
			return self.overlay(rawData['id'], rawData['how'])
		elif method == 'new':
			ID = rawData['id']
			data = rawData['data']
			return self.storeData(ID[0], data)
		elif method == 'clear':
			ID = rawData['id']
			return self.clear(ID[0])
		elif method == 'clear-all':
			return self.clearAll()

	def overlay(self, ID, how):
		newID = ID[0]
		df1 = self.DF[ID[1]]
		df2 = self.DF[ID[2]]
		result = gpd.overlay(df1, df2, how=how)
		self.DF[newID] = result
		return result.to_json()

	def storeData(self, ID, data):
		gdf = gpd.GeoDataFrame.from_features(data['features'])
		gdf.crs = {'init': 'epsg:4326'}
		self.DF[ID] = gdf
		print(self.DF.keys())
		return ('', 204)
	
	def clear(self, ID):
		self.DF.pop(ID)
		return ('', 204)
	
	def clearAll(self):
		self.DF = {}
		print(self.DF.keys())
		return ('', 204)
	
	def addBuffer(self, layer, radius):
		buf = layer.buffer(radius)
		buf = buf.to_crs(epsg=4326)
		return buf

