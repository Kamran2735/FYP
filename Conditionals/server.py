from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app) 


def execute_python_code(code):
    lines = code.split('\n')
    execution_results = {'output': [], 'data': {}}

    # Initialize variables to store current block's code and indentation level
    current_block_code = ''
    current_indentation = 0

    # Iterate over each line of code
    for line_number, line in enumerate(lines, start=1):
        # Strip leading and trailing whitespaces
        stripped_line = line.strip()
        if stripped_line:
            # Calculate indentation level
            indentation = len(line) - len(line.lstrip())

            # If the current line is indented, add it to the current block's code
            if indentation > current_indentation:
                current_block_code += line + '\n'
            else:
                # Execute the current block's code
                execution_result = execute_block(current_block_code, execution_results['data'])

                # Append execution result to the output list
                execution_results['output'].append((line_number - len(current_block_code.split('\n')) + 1, execution_result))

                # Update current block's code and indentation level
                current_block_code = line + '\n'
                current_indentation = indentation

    # Execute the last block of code
    execution_result = execute_block(current_block_code, execution_results['data'])
    execution_results['output'].append((len(lines) - len(current_block_code.split('\n')) + 1, execution_result))

    return execution_results

def execute_block(code_block, data):
    # Execute the code block and collect relevant information
    # Dummy implementation for demonstration purposes
    code_lines = code_block.split('\n')

    for line in code_lines:
        if line.strip().startswith('if '):
            return 'if statement executed'
        elif line.strip().startswith('elif '):
            return 'elif statement executed'
        elif line.strip() == 'else:':
            return 'else statement executed'
        elif line.strip().startswith('for '):
            return 'for statement executed'

    return 'normal code executed'

@app.route('/execute_code', methods=['POST'])
def execute_code():
    code = request.json.get('code')
    try:
        execution_results = execute_python_code(code)
        return jsonify(execution_results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)