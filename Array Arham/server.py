from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
cors = CORS(app)
def process_code(code):
    # Execute the code to get array values
    exec(code)
    array_values = locals().get('a', []) 
    return array_values

@app.route('/process_code', methods=['POST'])
def process_code_route():
    code = request.json['code']
    array_values = process_code(code)
    return jsonify({'values': array_values})

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)
