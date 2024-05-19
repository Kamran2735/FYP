document.getElementById('run').addEventListener('click', function() {
  // Get the SVG container
  var svgContainer = document.getElementById('svgContainer');

  // Toggle the display property
  if (svgContainer.style.display === 'none') {
      svgContainer.style.display = 'block'; // Make it visible
  } 
});

function preprocessPythonCode(code) {
    const lines = code.split('\n');
    let result = [];
    let blockStack = [];
    let loopno = 1;

    // Function to add a line with a print statement
    function addPrintStatement(line, lineNumber) {
        let indentLevel = line.match(/^\s*/)[0];
        result.push(line);
    }

    // Function to process code blocks within loops
    function processBlock(block) {
        if (block.length === 0) return;

        let indentLevel = block[0].line.match(/^\s*/)[0];
        let blockContent = block.map(l => l.line).join('\n').replace(/"/g, '\\"');
        let blockSummary = block.map(l => `line ${l.lineNumber}: ${l.line.trim()}`).join('\\n');
        result.push(blockContent);
        result.push(`${indentLevel}    print("Loop:  ${loopno}:\\n${blockSummary}")`);
        loopno = loopno + 1;
    }

    // Process each line to identify and handle loops
    lines.forEach((line, index) => {
        let trimmedLine = line.trim();
        let indentLevel = line.match(/^\s*/)[0].length;

        if (blockStack.length > 0) {
            let topBlock = blockStack[blockStack.length - 1];
            if (indentLevel <= topBlock.indentLevel && topBlock.lines.length > 0) {
                processBlock(topBlock.lines);
                blockStack.pop();
            }
        }

        if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ')) {
            blockStack.push({ indentLevel, lines: [{ line, lineNumber: index + 1 }] });
        } else if (blockStack.length > 0) {
            blockStack[blockStack.length - 1].lines.push({ line, lineNumber: index + 1 });
        } else {
            addPrintStatement(line, index + 1);
        }
    });

    while (blockStack.length > 0) {
        processBlock(blockStack.pop().lines);
    }

    // Join the result and add print statements before loops
    const finalCode = addPrintBeforeLoops(result.join('\n'));
    return finalCode;
}

// Function to add print statements before loops
function addPrintBeforeLoops(pyCode) {
    // Split the Python code into lines
    let lines = pyCode.split('\n');

    // Loop through each line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check if the line contains a loop
        if (line.trim().startsWith('for') || line.trim().startsWith('while')) {
            // Insert a print statement before the loop
            lines.splice(i, 0, "print('Code Before Loop:')");
            // Increment the index to account for the newly added line
            i++;
        }
    }

    // Add a final print statement at the end of the code
    lines.push("print('End of Code Loop:')");

    // Join the lines back together
    return lines.join('\n');
}

function runCode() {
    const codeInput = document.getElementById('codeInput').value.trim();

    if (!codeInput) {
        console.error('Code input is empty');
        return;
    }

    const preprocessedCode = preprocessPythonCode(codeInput);
    console.log(preprocessedCode);
    
    fetch('http://localhost:5000/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: preprocessedCode })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(responseData => {
        updateVariableTable(responseData);
        processResponse(responseData);
    })
    .catch(error => console.error('Fetch Error:', error));
}

async function updateVariableTable(responseArray) {
    console.log(responseArray);
    const variableTableBody = document.getElementById('variableTableBody');
    const executionDiv = document.getElementById('execution'); // New div for executed code
    const outputField = document.getElementById('output');
    
    // Function to clear the execution div
    const clearExecutionDiv = () => {
      executionDiv.innerHTML = '';
    };
    
    // Function to append executed code line to execution div
    const appendToExecutionDiv = (code) => {
      clearExecutionDiv(); // Clear execution div before appending new code line
      const codeLineElement = document.createElement('p');
      codeLineElement.textContent = `${code}`;
      executionDiv.appendChild(codeLineElement);
    };
  
    // Function to clear the variable table
    const clearVariableTable = () => {
      variableTableBody.innerHTML = ''; // Clear existing table content
    };
  
    // Check if executionDiv, outputField, and variableTableBody exist
    if (!executionDiv || !outputField || !variableTableBody) {
      console.error("Execution div, output field, or variable table body not found");
      return;
    }
  
    // Function to add variables to the table
    const addVariablesToTable = (variables, previousVariables) => {
      for (const [name, variable] of Object.entries(variables)) {
        const previousVariable = previousVariables[name];
  
        // Create a row for the variable
        const variableRow = document.createElement('tr');
  
        // Create cells for each property of the variable
        const nameCell = document.createElement('td');
        const valueCell = document.createElement('td');
        const typeCell = document.createElement('td');
        const scopeCell = document.createElement('td');
        // Set the text content of each cell
        nameCell.textContent = name;
        valueCell.textContent = variable.value;
        typeCell.textContent = variable.type;
        scopeCell.textContent = variable.scope;
  
        // Compare the current value with the previous one
        if (previousVariable) {
          if (previousVariable.type === 'list' && variable.type === 'list') {
            const compare = _.isEqual(previousVariable.value, variable.value);
            if (!compare) {
              valueCell.classList.add('highlight');
            }
          } else if (previousVariable.type !== 'list' && variable.type !== 'list' && previousVariable.value !== variable.value) {
            valueCell.classList.add('highlight');
          }
          if (previousVariable.type !== variable.type) {
            typeCell.classList.add('highlight');
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
      }
    };
  
    // Keep track of variables from the previous response
    let previousVariables = {};
  
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
      if (response.variables && Object.keys(response.variables).length > 0) {
        // Display the output if it's not an empty array
        if (response.output.length > 0) {
          outputField.innerHTML = response.output.join('<br>'); // Display the output with line breaks in outputField
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

function changePathColorAndWidth(pathId, newColor, newStrokeWidth) {
    var path = document.getElementById(pathId);
    if (path) {
        anime({
            targets: path,
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'easeInOutSine',
            duration: 1500,
        });
        path.setAttribute('stroke', newColor);
        path.setAttribute('stroke-width', newStrokeWidth);
    } else {
        console.error('Path not found with id:', pathId);
    }
}

// Function to change the color of text elements
function changeTextColor(textId, newColor) {
    var text = document.getElementById(textId);
    if (text) {
        text.setAttribute('fill', newColor);
    } else {
        console.error('Text not found with id:', textId);
    }
}

var startPath = anime.path('#startPath');
var loopPath = anime.path('#loopPath');
var endPath = anime.path('#endPath');

// Define animations
var startAnimation = anime({
    targets: '#animatedObject',
    translateX: startPath('x'),
    translateY: startPath('y'),
    easing: 'linear',
    duration: 1000, // Set duration to 1 second
    autoplay: false,
    complete: function() {
        setTimeout(function() {
            loopAnimation.restart();
            changeTextColor("startText", "#00FF00"); // Change start text color to green
        }, 1000); // Delay 1 second before starting loopAnimation
    }
});

// Define the loopAnimation with a dynamic loop count
var loopAnimation = anime({
    targets: '#animatedObject',
    translateX: loopPath('x'),
    translateY: loopPath('y'),
    rotate: loopPath('angle'),
    easing: 'linear',
    duration: 1000, // Set duration to 1 second
    loop: 0, // Initialize loop count to 0
    autoplay: false,
    complete: function() {
        setTimeout(function() {
            endAnimation.restart();
            changeTextColor("loopText", "#00FF00"); // Change loop text color to green
        }, 1000); // Delay 1 second before starting endAnimation
    }
});

// Function to set the loop count for the loopAnimation
function setLoopCount(count) {
    loopAnimation.loop = count;
}

var endAnimation = anime({
    targets: '#animatedObject',
    translateX: endPath('x'),
    translateY: endPath('y'),
    easing: 'linear',
    duration: 1000, // Set duration to 1 second
    autoplay: false,
    complete: function() {
        setTimeout(function() {
            restartStartAnimation();
            changeTextColor("endText", "#00FF00"); // Change end text color to green
        }, 1000); // Delay 1 second before restarting startAnimation
    }
});

// Start the animation sequence
function restartStartAnimation() {
    setTimeout(function() {
        startAnimation.restart();
    }, 1000); // Delay 1 second before restarting startAnimation
}

// Function to trigger animations based on response data
function processResponse(responseArray) {
    let animationIndex = 0;
    let loopCount = 0;

    function playNextAnimation() {
        if (animationIndex < responseArray.length) {
            const response = responseArray[animationIndex];

            if (response.code === "Code Before Loop:") {
                startAnimation.restart();
            } else if (response.code.startsWith("Loop:")) {
                // Increment loop count only for the first line of the loop
                if (!loopCount) {
                    loopCount++; // Increment loop count
                    setLoopCount(loopCount); // Set loop count for animation
                }
                changeTextColor('startText', "#00FF00");
                loopAnimation.restart();

            } else if (response.code === "End of Code Loop:") {
                changePathColorAndWidth('loopPath', '#00FF00',5);
                changeTextColor('loopText', "#00FF00");
                endAnimation.restart();
                // Reset loop count after loop finishes
                loopCount = 0;
            }

            animationIndex++;
        }
    }

    // Start with the first animation
    playNextAnimation();

    // Chain animations using complete callback
    startAnimation.complete = () => {
        setTimeout(() => {
            changePathColorAndWidth('startPath', '#00FF00',5);
            playNextAnimation();
        }, 1000); // Delay 1 second before playing next animation
    };

    loopAnimation.complete = () => {
        setTimeout(() => {
            playNextAnimation();
        }, 1000); // Delay 1 second before playing next animation
    };

    endAnimation.complete = () => {
        setTimeout(() => {
            changePathColorAndWidth('endPath', '#00FF00',5);
            changeTextColor('endText', "#00FF00");
            playNextAnimation();
        }, 1000); // Delay 1 second before playing next animation
    };
}