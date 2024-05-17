import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import StringIO

app = Flask(__name__)
CORS(app)

class VariableTracker:
    def __init__(self):
        self.variables = []
        self.code_lines = []
        self.outputs = []

    def track_variable_values(self, values, code_line):
        ignored_names = {'tracker', 'original_stdout', 'request', 'app', 'sys', 'StringIO', 'CORS', 'Flask', 'VariableTracker', 'OutputInterceptor'}
        tracked_values = {}
        for name, value in values.items():
            if name not in ignored_names and not name.startswith('__'):
                try:
                    # Attempt to serialize the value to ensure it's serializable
                    _ = jsonify({name: value})
                    tracked_values[name] = (type(value).__name__, value)
                except TypeError:
                    # If not serializable, skip this variable
                    pass
        self.variables.append(tracked_values)
        self.code_lines.append(code_line)
        self.outputs.append([])
        
    def add_output(self, text):
        if self.outputs:
            self.outputs[-1].append(text.strip())
        else:
            self.outputs.append([text.strip()])

    def get_tracked_data(self):
        result = []
        for values, code_line, output in zip(self.variables, self.code_lines, self.outputs):
            result.append({
                'variables': {name: {"type": var_type, "value": value} for name, (var_type, value) in values.items()},
                'code': code_line,
                'output': output
            })
        return result

class OutputInterceptor:
    def __init__(self, tracker, original_stdout):
        self.tracker = tracker
        self.original_stdout = original_stdout
        self.buffer = StringIO()

    def write(self, text):
        self.buffer.write(text)
        self.original_stdout.write(text)
        if "line" in text:
            self.tracker.track_variable_values(globals().copy(), text)
        elif "print" in text:  # Check for lines containing print statement
            self.tracker.add_output(text.strip())

    def flush(self):
        self.buffer.seek(0)
        self.original_stdout.write(self.buffer.read())
        self.original_stdout.flush()

    def __getattr__(self, attr):
        return getattr(self.original_stdout, attr)




@app.route('/execute', methods=['POST'])
def execute_code():
    code = request.json.get('code', '')
    tracker = VariableTracker()
    
    original_stdout = sys.stdout
    sys.stdout = OutputInterceptor(tracker, original_stdout)
    
    try:
        exec(code, globals())
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        sys.stdout = original_stdout
    
    response_data = tracker.get_tracked_data()
    
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)
