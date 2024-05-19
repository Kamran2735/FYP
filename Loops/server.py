import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import StringIO
import re

app = Flask(__name__)
CORS(app)

class VariableTracker:
    def __init__(self):
        self.reset()

    def reset(self):
        self.variables = []
        self.code_lines = []
        self.outputs = []

    def track_variable_values(self, local_vars, global_vars, code_line):
        ignored_names = {'tracker', 'original_stdout', 'request', 'app', 'sys', 'StringIO', 'CORS', 'Flask', 'VariableTracker', 'OutputInterceptor'}
        tracked_values = {}

        for name, value in {**local_vars, **global_vars}.items():
            if name not in ignored_names and not name.startswith('__'):
                try:
                    _ = jsonify({name: value})  # Check if value is serializable
                    scope = 'local' if name in local_vars else 'global'
                    tracked_values[name] = (type(value).__name__, value, scope)
                except TypeError:
                    pass

        self.variables.append(tracked_values)
        self.code_lines.append(code_line)
        self.outputs.append([])

    def add_output(self, text):
        if text and 'Loop:' not in text:
            if self.outputs:
                self.outputs[-1].append(text)
            else:
                self.outputs.append([text])

    def get_tracked_data(self):
        result = []

        for values, code_line, output in zip(self.variables, self.code_lines, self.outputs):
            result.append({
                'variables': {
                    name: {"type": var_type, "value": value, "scope": scope}
                    for name, (var_type, value, scope) in values.items()
                },
                'code': code_line,
                'output': output
            })

        self.reset()
        return result

class OutputInterceptor:
    def __init__(self, tracker, original_stdout, local_vars, global_vars):
        self.tracker = tracker
        self.original_stdout = original_stdout
        self.local_vars = local_vars
        self.global_vars = global_vars
        self.buffer = StringIO()

    def write(self, text):
        self.buffer.write(text)
        self.original_stdout.write(text)
        # Capture the print statement output
        self.tracker.add_output(text.strip())
        # Check for 'Loop' keyword to track variables
        if "Loop" in text:
            self.tracker.track_variable_values(self.local_vars.copy(), self.global_vars, text.strip())

    def flush(self):
        self.buffer.seek(0)
        self.original_stdout.write(self.buffer.read())
        self.buffer.truncate(0)
        self.buffer.seek(0)
        self.original_stdout.flush()

    def __getattr__(self, attr):
        return getattr(self.original_stdout, attr)

@app.route('/execute', methods=['POST'])
def execute_code():
    code = request.json.get('code', '')
    tracker = VariableTracker()
    tracker.reset()

    local_vars = {}
    global_vars = globals().copy()
    original_stdout = sys.stdout
    sys.stdout = OutputInterceptor(tracker, original_stdout, local_vars, global_vars)

    try:
        exec(code, global_vars, local_vars)
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        sys.stdout = original_stdout

    response_data = tracker.get_tracked_data()
    
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)
