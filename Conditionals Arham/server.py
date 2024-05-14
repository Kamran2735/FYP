from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
from io import StringIO 

app = Flask(__name__)
cors = CORS(app) 


def has_left_indent(line):
    return line.lstrip()!=line


def get_condition(line):
    if 'if' in line:
        return line.split('if')[1].split(':')[0].strip()
    elif 'elif' in line:
        return line.split('elif')[1].split(':')[0].strip()
    elif 'else' in line:
        return ""


def get_conditional_statements(code):
    conditional_statements = []
    lines = code.split('\n')
    code_executed = False
    
    output_capture = StringIO()
    sys.stdout = output_capture
    
    variables = {}
    exec(code, {}, variables)
    sys.stdout = sys.__stdout__

    captured_output = output_capture.getvalue()

    step = 1
    for i in range(len(lines)):
        line , start,end ="", i,i
        if 'if' in lines[i] or 'elif' in lines[i] or 'else' in lines[i]:
            line = lines[i]
            is_else_statement = lines[i].strip().startswith('else')
            condition_text = get_condition(line)
            condition =eval(condition_text, variables) if  condition_text  else ""
            if condition == True:
                code_executed = True
            while (i+1 < len(lines) and has_left_indent(lines[i+1])):
                 i+=1
                 end = i
                 line = line + '\n'+ lines[i]
            data = {
                'code': line,
                'condition': condition_text,
                'executed': 'Yes' if condition == True or (is_else_statement and code_executed==False) else 'No',
                'line_number': f'{start+1}-{end+1}',
                'output':"",
                'step': f'Step {step}'
            }
            if condition == True or (is_else_statement and code_executed==False):
             try:
              data['output'] = captured_output
             except Exception as e:
              data['output'] = f"Error: {e}"
            
            step = step + 1;
            conditional_statements.append(data)
    return conditional_statements


@app.route('/execute_code', methods=['POST'])
def execute_code():
    code = request.json.get('code')
    try:
        statements = get_conditional_statements(code)
        return jsonify(statements)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)