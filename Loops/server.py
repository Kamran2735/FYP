import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import StringIO

app = Flask(__name__)
CORS(app)

class VariableTracker:
    def __init__(self):
        self.variables = []
        self.ignored_variables = set(dir(sys.modules[__name__]))

    def track_variable_values(self, values):
        # Ignore specific variables and built-in names
        ignored_names = self.ignored_variables.union({'tracker', 'original_stdout'})
        tracked_values = {name: (type(value).__name__, value) for name, value in values.items() if name not in ignored_names and not name.startswith('__')}
        self.variables.append(tracked_values)

    def get_tracked_variables(self):
        result = []
        for i, values in enumerate(self.variables, start=1):
            result.append({name: {"type": var_type, "value": value} for name, (var_type, value) in values.items()})
        return result

class OutputInterceptor:
    def __init__(self, tracker, original_stdout):
        self.tracker = tracker
        self.original_stdout = original_stdout
        self.buffer = StringIO()

    def write(self, text):
        # Capture output in buffer
        self.buffer.write(text)
        self.original_stdout.write(text)  # Ensure the text is still printed to the console
        if "status here" in text:
            # Track variable values at print statement
            self.tracker.track_variable_values(globals().copy())

    def flush(self):
        # Flush buffer to original stdout
        self.buffer.seek(0)
        self.original_stdout.write(self.buffer.read())
        self.original_stdout.flush()

    def __getattr__(self, attr):
        # Pass other attribute calls to the original stdout
        return getattr(self.original_stdout, attr)

@app.route('/execute', methods=['POST'])
def execute_code():
    code = request.json.get('code', '')
    # Initialize variable tracker for this request
    tracker = VariableTracker()
    
    # Replace sys.stdout with the interceptor
    original_stdout = sys.stdout
    sys.stdout = OutputInterceptor(tracker, original_stdout)
    
    try:
        # Execute the user code
        exec(code, globals())
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        # Restore original stdout
        sys.stdout = original_stdout
    
    # Return tracked variable values
    return jsonify(tracker.get_tracked_variables())

if __name__ == '__main__':
    app.run(debug=True)
