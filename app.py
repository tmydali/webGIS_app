from flask import Flask, request, render_template
import geoprocess_v as gpv

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/vectors', methods=['POST'])
def vectors():
	gdf = gpv.toDataFrame(request.get_json())
	buffer = gpv.addBuffer(gdf, 100)
	return buffer.to_json()

if __name__ == '__main__':
	app.debug = True
	app.run()