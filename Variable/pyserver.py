from flask import Flask, request, jsonify,Response 
from io import StringIO
from flask_cors import CORS
import sys
import json

app = Flask(__name__)
CORS(app) 


def execute_code_line_by_line(code):
    # Redirect stdout to capture print statements
    stdout_backup = sys.stdout
    sys.stdout = StringIO()

    try:
        # Initialize an empty list to store responses
        responses = []

        # Initialize an empty dictionary to store variables
        variables = {}

        # Split the code into individual lines
        lines = code.split('\n')

        # Initialize an empty string to hold the current statement
        current_statement = ''

        # Stack to keep track of indentation levels
        indentation_stack = []

        # Initialize a set to track local variables
        local_vars = set()

        # Execute each line sequentially
        for line in lines:
            # Strip leading and trailing whitespace from the line
            stripped_line = line.strip()

            # Skip empty lines
            if not stripped_line:
                continue

            # Determine the indentation level of the current line
            indentation = len(line) - len(line.lstrip())

            # Check if the line starts a block
            if stripped_line.endswith(':') and not stripped_line.startswith('#'):
                # Push the current indentation level onto the stack
                indentation_stack.append(indentation)

            # Append the current line to the current statement
            current_statement += line + '\n'

            # Check if the current statement is complete and not inside a block
            if not incomplete_statement(current_statement) and (not indentation_stack or indentation <= indentation_stack[-1]):
                try:
                    # Compile and execute the current statement
                    compiled_code = compile(current_statement, "<string>", "exec")
                    exec(compiled_code, globals(), variables)

                    # Retrieve the captured print statements
                    output = sys.stdout.getvalue()

                    # Extract variable information and determine scope
                    variable_list = []
                    for name, value in variables.items():
                        if name in local_vars:
                            scope = 'local'
                        else:
                            scope = 'global'
                        variable_list.append({'name': name, 'value': value, 'type': type(value).__name__, 'scope': scope})

                    # Prepare the response
                    response = {'output': output, 'variables': variable_list}

                    # Append the response to the list
                    responses.append(response)

                except Exception as e:
                    # If an error occurs, prepare the error response
                    error_message = str(e)
                    response = {'error': error_message}
                    responses.append(response)
                    break  # Stop execution if an error occurs

                # Clear the current statement
                current_statement = ''

                # Clear the set of local variables after the block ends
                if indentation_stack and indentation < indentation_stack[-1]:
                    local_vars.clear()

            # Check if the end of a block is reached
            if indentation_stack and indentation < indentation_stack[-1]:
                # Pop the indentation level from the stack
                indentation_stack.pop()

            # Check if the line is inside a block
            if indentation_stack:
                # Check if the line assigns a variable
                if stripped_line.startswith(' ' * 4) and not stripped_line.startswith('#'):
                    # Parse the line to extract the variable name
                    variable_name = stripped_line.split('=')[0].strip()
                    local_vars.add(variable_name)

        # Execute the current statement if it's complete and there are no more lines to process
        if current_statement and not incomplete_statement(current_statement):
            try:
                # Compile and execute the current statement
                compiled_code = compile(current_statement, "<string>", "exec")
                exec(compiled_code, globals(), variables)

                # Retrieve the captured print statements
                output = sys.stdout.getvalue()

                # Extract variable information and determine scope
                variable_list = []
                for name, value in variables.items():
                    if name in local_vars:
                        scope = 'local'
                    else:
                        scope = 'global'
                    variable_list.append({'name': name, 'value': value, 'type': type(value).__name__, 'scope': scope})

                # Prepare the response
                response = {'output': output, 'variables': variable_list}

                # Append the response to the list
                responses.append(response)

            except Exception as e:
                # If an error occurs, prepare the error response
                error_message = str(e)
                response = {'error': error_message}
                responses.append(response)

        # Convert the list of responses to a JSON array and yield it
        yield json.dumps(responses)

    except Exception as e:
        # Return the exception message if an error occurs
        error_message = str(e)
        yield json.dumps({'error': error_message})

    finally:
        # Restore stdout
        sys.stdout = stdout_backup


def incomplete_statement(statement):
    try:
        # Attempt to compile the statement
        compile(statement, "<string>", "exec")
        return False  # Statement is complete
    except (SyntaxError, IndentationError):
        return True   # Statement is incomplete


# Flask route to execute code line by line
@app.route('/execute_line_by_line', methods=['POST'])
def execute_line_by_line():
    try:
        code = request.json['code']
        return Response(execute_code_line_by_line(code), content_type='application/json')

    except Exception as e:
        # If an exception occurs, return the error message
        error_message = str(e)
        return jsonify({'error': error_message}), 400
    
    

if __name__ == '__main__':
    app.run(debug=True)
    