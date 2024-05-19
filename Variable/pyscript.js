// async function runCode() {
//   console.log("runCode() function called."); // Log to check if the function is called
//   const codeInput = document.getElementById('codeInput').value;
//   console.log(codeInput);
//   try {
//     variableTableBody.innerHTML = " ";
//     output.innerHTML= " ";

//     const response = await fetch('http://127.0.0.1:5000/execute_line_by_line', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ code: codeInput })
//     });
  
//     console.log("Response received:", response); // Log the response object

//     if (!response.ok) {
//       throw new Error('Failed to parse code');
//     }

//     const responseData = await response.json(); // Parse response JSON
//     console.log("Response data:", responseData); // Log the response data
//     await updateVariableTable(responseData); // Await the updateVariableTable function
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

 
async function runCode() {
  console.log("runCode() function called."); // Log to check if the function is called
  const codeInput = document.getElementById('codeInput').value;

  // Split code input into lines
  let lines = codeInput.split('\n');

  // Regular expression to match indentation
  const indentationRegex = /^\s*/;

  // Track the current indentation level and the types of block statements encountered
  let currentIndentationLevel = 0;
  let blockStack = [];

  // Array to store lines with '#' comments
  let commentedLines = [];

  // Iterate through each line to identify block statements and insert comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indentationMatch = line.match(indentationRegex);
    if (indentationMatch) {
      const indentation = indentationMatch[0].length;
      if (indentation > currentIndentationLevel) {
        // Indentation increased, this is the beginning of a block statement
        currentIndentationLevel = indentation;
        // Capture the block type from the previous line
        const prevLineIndex = i - 1;
        if (prevLineIndex >= 0) {
          const prevLine = lines[prevLineIndex].trim();
          const blockType = prevLine.split(' ')[0];
          blockStack.push(blockType);
        }
      } else if (indentation < currentIndentationLevel) {
        // Indentation decreased, this is the end of a block statement
        currentIndentationLevel = indentation;
        // Pop the type of block statement from the stack
        const lastBlockType = blockStack.pop();
        // Insert comment before the current line denoting the type of block ended
        const comment = `# ${lastBlockType} Block statement ended`;
        lines.splice(i, 0, comment);
        commentedLines.push({line: i, comment});
        i++; // Increment i to skip the inserted comment in the next iteration
      }
    }
  }

  // Iterate through commented lines to remove redundant comments
  for (let i = 0; i < commentedLines.length - 1; i++) {
    const currentLine = commentedLines[i];
    const nextLine = commentedLines[i + 1];
    if (currentLine.comment.includes('if') && (nextLine.comment.includes('elif') || nextLine.comment.includes('else'))) {
      // Remove comment from current line
      lines[currentLine.line] = lines[currentLine.line].replace(currentLine.comment, '');
    } else if (currentLine.comment.includes('elif') && nextLine.comment.includes('elif')) {
      // Remove comment from current line
      lines[currentLine.line] = lines[currentLine.line].replace(currentLine.comment, '');
    }
  }

    // Remove empty lines
    lines = lines.filter(line => line.trim() !== '');

  // Join the modified lines back into a single string
  const preprocessedCode = lines.join('\n');
  console.log(preprocessedCode);

  try {
    variableTableBody.innerHTML = " ";
    output.innerHTML = " ";
    execution.innerHTML = " ";

    const response = await fetch('http://127.0.0.1:5000/execute_line_by_line', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: preprocessedCode })
    });

    console.log("Response received:", response); // Log the response object

    if (!response.ok) {
      throw new Error('Failed to parse code');
    }

    const responseData = await response.json(); // Parse response JSON
    console.log("Response data:", responseData); // Log the response data
    await updateVariableTable(responseData); // Await the updateVariableTable function
  } catch (error) {
    console.error('Error:', error);
  }
}
 
// async function updateVariableTable(responseArray) {
//   console.log(responseArray)
//   const variableTableBody = document.getElementById('variableTableBody');
//   const executionDiv = document.getElementById('execution'); // New div for executed code
//   const codeLineElement = document.createElement('p');
//   executionDiv.appendChild(codeLineElement); // Append codeLineElement to executionDiv
//   // Define a function to clear the variable table
//   const clearVariableTable = () => {
//     // Clear existing table content
//     variableTableBody.innerHTML = '';
//   };

//   // Check if executionDiv and variableTableBody exist
//   if (!executionDiv || !variableTableBody) {
//     console.error("Execution div or variable table body not found");
//     return;
//   }

//   // Define a function to add variables to the table
//   const addVariablesToTable = (variables, previousVariables) => {
//     // Iterate over each variable in the response
//     variables.forEach(variable => {
//       // Check if the variable exists in the previous response
//       const previousVariable = previousVariables.find(prevVar => prevVar.name === variable.name);
      
//       // Create a row for the variable
//       const variableRow = document.createElement('tr');
      
//       // Create cells for each property of the variable
//       const nameCell = document.createElement('td');
//       const valueCell = document.createElement('td');
//       const typeCell = document.createElement('td');
//       const scopeCell = document.createElement('td');

//       // Set the text content of each cell
//       nameCell.textContent = variable.name;
//       valueCell.textContent = variable.value;
//       typeCell.textContent = variable.type;
//       scopeCell.textContent = variable.scope;

//       // Compare the current value with the previous one
//       if (previousVariable) {

//         if(previousVariable.type === 'list' && variable.type === 'list'){
//          const compare = _.isEqual(previousVariable.value, variable.value)
//          if (!compare){
//           valueCell.classList.add('highlight')
//          }
//         }
//         else if( previousVariable.type !== 'list' && variable.type !== 'list' && previousVariable.value !== variable.value) {
//           valueCell.classList.add('highlight')
//         }
//         if (previousVariable.type !== variable.type) {
//           typeCell.classList.add('highlight')
//         }
//       } else {
//         // Highlight new variables
//         nameCell.classList.add('highlight');
//         valueCell.classList.add('highlight');
//         typeCell.classList.add('highlight');
//         scopeCell.classList.add('highlight');
//       }
      

//       // Append cells to the row
//       variableRow.appendChild(nameCell);
//       variableRow.appendChild(valueCell);
//       variableRow.appendChild(typeCell);
//       variableRow.appendChild(scopeCell);

//       // Append the row to the table body
//       variableTableBody.appendChild(variableRow);
//     });
//   };

//   // Keep track of variables from the previous response
//   let previousVariables = [];

//   // Iterate over each response object in the array
//   for (let i = 0; i < responseArray.length; i++) {
//     const response = responseArray[i];

//     if (response.error) {
//       // If an error occurs, display it in the execution div
//       executionDiv.textContent = response.error;
//       // Clear the variable table before adding variables from the previous response
//       clearVariableTable();
//       // Break the loop
//       break;
//     }
//     codeLineElement.innerHTML = `Executed code: ${response.code} <br>`;

//     // Check if the response contains any variables
//     if (response.variables && response.variables.length > 0) {
//       // Add a row for the response output if it's not an empty string
//       if (response.output.trim() !== '') {
//         codeLineElement.innerHTML += response.output.replace(/\n/g, '<br>'); // Display the output with line breaks
//       }
      
//       // Add variables to the table
//       addVariablesToTable(response.variables, previousVariables);
//     }

//     // Update previousVariables for the next iteration
//     previousVariables = response.variables;

//     // Add a 2-second delay before proceeding to the next step
//     if (i < responseArray.length - 1) {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       // Clear the variable table before the next step
//       clearVariableTable();
//     }
//   }
// }
async function updateVariableTable(responseArray) {
  console.log(responseArray);
  const variableTableBody = document.getElementById('variableTableBody');
  const executionDiv = document.getElementById('execution'); // New div for executed code
  const outputField = document.getElementById('output');
  
  // Define a function to clear the execution div
  const clearExecutionDiv = () => {
    executionDiv.innerHTML = '';
  };
  
  // Define a function to append executed code line to execution div
  const appendToExecutionDiv = (code) => {
    clearExecutionDiv(); // Clear execution div before appending new code line
    const codeLineElement = document.createElement('p');
    codeLineElement.textContent = `Executed code: ${code}`;
    executionDiv.appendChild(codeLineElement);
  };

  // Define a function to clear the variable table
  const clearVariableTable = () => {
    // Clear existing table content
    variableTableBody.innerHTML = '';
  };

  // Check if executionDiv, outputField, and variableTableBody exist
  if (!executionDiv || !outputField || !variableTableBody) {
    console.error("Execution div, output field, or variable table body not found");
    return;
  }

  // Define a function to add variables to the table
  const addVariablesToTable = (variables, previousVariables) => {
    // Iterate over each variable in the response
    variables.forEach(variable => {
      // Check if the variable exists in the previous response
      const previousVariable = previousVariables.find(prevVar => prevVar.name === variable.name);
      
      // Create a row for the variable
      const variableRow = document.createElement('tr');
      
      // Create cells for each property of the variable
      const nameCell = document.createElement('td');
      const valueCell = document.createElement('td');
      const typeCell = document.createElement('td');
      const scopeCell = document.createElement('td');

      // Set the text content of each cell
      nameCell.textContent = variable.name;
      valueCell.textContent = variable.value;
      typeCell.textContent = variable.type;
      scopeCell.textContent = variable.scope;

      // Compare the current value with the previous one
      if (previousVariable) {

        if(previousVariable.type === 'list' && variable.type === 'list'){
         const compare = _.isEqual(previousVariable.value, variable.value)
         if (!compare){
          valueCell.classList.add('highlight')
         }
        }
        else if( previousVariable.type !== 'list' && variable.type !== 'list' && previousVariable.value !== variable.value) {
          valueCell.classList.add('highlight')
        }
        if (previousVariable.type !== variable.type) {
          typeCell.classList.add('highlight')
        }
      } else {
        // Highlight new variables
        nameCell.classList.add('highlight');
        valueCell.classList.add('highlight');
        typeCell.classList.add('highlight');
        scopeCell.classList.add('highlight');
      }
      

      // Append cells to the row
      variableRow.appendChild(nameCell);
      variableRow.appendChild(valueCell);
      variableRow.appendChild(typeCell);
      variableRow.appendChild(scopeCell);

      // Append the row to the table body
      variableTableBody.appendChild(variableRow);
    });
  };

  // Keep track of variables from the previous response
  let previousVariables = [];

  // Iterate over each response object in the array
  for (let i = 0; i < responseArray.length; i++) {
    const response = responseArray[i];

    if (response.error) {
      // If an error occurs, display it in the execution div
      executionDiv.textContent = response.error;
      // Clear the variable table before adding variables from the previous response
      clearVariableTable();
      // Break the loop
      break;
    }
    appendToExecutionDiv(response.code);

    // Check if the response contains any variables
    if (response.variables && response.variables.length > 0) {
      // Add a row for the response output if it's not an empty string
      if (response.output.trim() !== '') {
        outputField.innerHTML = response.output.replace(/\n/g, '<br>'); // Display the output with line breaks in outputField
      }
      
      // Add variables to the table
      addVariablesToTable(response.variables, previousVariables);
    }

    // Update previousVariables for the next iteration
    previousVariables = response.variables;

    // Add a 2-second delay before proceeding to the next step
    if (i < responseArray.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Clear the variable table before the next step
      clearVariableTable();
    }
  }
}





