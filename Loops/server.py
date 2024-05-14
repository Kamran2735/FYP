from flask import Flask, render_template, request, jsonify
import ast
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/runcode": {"origins": "http://127.0.0.1:5500"}}) ) 

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/runcode", methods=["POST"])
def run_code():
    code = request.json["code"]
    output, variables = execute_with_debug(code)
    return jsonify({"output": output, "variables": variables})

def execute_with_debug(code):
    output = []
    variables = []

    # Split code into statements
    statements = code.split('\n')
    namespace = {}

    for statement in statements:
        try:
            # Execute the statement
            exec(statement, namespace)

            # Capture variables after each statement
            for var_name, var_value in namespace.items():
                variables.append({
                    "name": var_name,
                    "value": var_value,
                    "dataType": type(var_value).__name__
                })

            # Capture output of print statements
            output.append(namespace.get("__builtins__", {}).get("print_output", ""))
            namespace["__builtins__"]["print_output"] = ""  # Reset print_output
            
            # Check if we encountered a loop and need to pause
            if "for" in statement or "while" in statement:
                # We pause the execution here and return the current output and variables
                return "\n".join(output), variables
        except Exception as e:
            output.append(f"Error: {str(e)}")
    
    return "\n".join(output), variables


@app.route("/runcode", methods=["OPTIONS"])
def options():
    # Respond to preflight request
    response = jsonify(success=True)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST")
    return response

if __name__ == "__main__":
    app.run(debug=True)