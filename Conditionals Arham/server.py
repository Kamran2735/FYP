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


def execute_conditional_statment(line,variables):
    output_capture = StringIO() 
    old_stdout = sys.stdout  
    try:
            sys.stdout = output_capture  
            exec(line, variables)  
    finally:
        sys.stdout = old_stdout  # Restore the original stdout
        captured_output = output_capture.getvalue()
    return captured_output


def get_conditional_statements(code):
    conditional_statements = []
    lines = code.split('\n')
    if_block_executed = False
    elif_block_executed = False
    else_block_executed = False
    output_capture = StringIO()
    # sys.stdout = output_capture
    
    variables = {}
    exec(code, {}, variables)
    # sys.stdout = sys.__stdout__

    # captured_output = output_capture.getvalue()
    if_count = 0
    step = 1
    for i in range(len(lines)):
        captured_output = ""
        line , start,end ="", i,i
        if 'if' in lines[i] or 'elif' in lines[i] or 'else' in lines[i]:
            line = lines[i]
            is_if_statement = lines[i].strip().startswith('if')
            is_else_statement = lines[i].strip().startswith('else')
            is_elif_statement = lines[i].strip().startswith('elif')
            
            if is_if_statement:
                if_count = if_count + 1
                step = 1
                if_block_executed = False
                elif_block_executed = False
                else_block_executed = False
                output_capture = StringIO()  
            
            condition_text = get_condition(line)
            condition =eval(condition_text, variables) if  condition_text  else ""
            
                
            while (i+1 < len(lines) and has_left_indent(lines[i+1])):
                 i+=1
                 end = i
                 line = line + '\n'+ lines[i]
            data = {
                'if_block': if_count,
                'code': line,
                'condition': condition_text,
                'executed': "",
                'line_number': f'{start+1}-{end+1}',
                'output':"",
                'step': f'Step {step}'
            }
            if condition == True and is_if_statement:
                if_block_executed = True
                captured_output = execute_conditional_statment(line,variables)

            elif condition == True and is_elif_statement and if_block_executed==False:
                elif_block_executed = True
                captured_output = execute_conditional_statment(line,variables)
                
            elif is_else_statement and if_block_executed==False and elif_block_executed==False:
                else_block_executed = True 
                captured_output = execute_conditional_statment(line,variables)
                
            
            
            data['executed']= 'Yes' if (is_if_statement and if_block_executed) or (is_elif_statement and elif_block_executed) or (is_else_statement and else_block_executed) else 'No'
            if condition == True or (is_else_statement and (if_block_executed==False and elif_block_executed == False)):
             try:
              data['output'] =  captured_output
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