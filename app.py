from flask import Flask, request, render_template
from geoprocess_v import pandaFrame

app = Flask(__name__)
gpv = pandaFrame()

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/vectors', methods=['POST'])
def vectors():
	# execute command from client and return results
	return gpv.actions(request.get_json())

if __name__ == '__main__':
	app.debug = True
	app.run()