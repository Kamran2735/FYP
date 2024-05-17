// function preprocessPythonCode(code) {
//     // Split the code into lines
//     const lines = code.split('\n');
//     let result = [];
//     let blockStack = [];

//     function addPrintStatement(line, lineNumber) {
//         let indentLevel = line.match(/^\s*/)[0];
//         result.push(line);
//         result.push(`${indentLevel}print("line ${lineNumber}: ${line.trim().replace(/"/g, '\\"')}")`);
//         result.push(`${indentLevel}print("status here")`);
//     }

//     function processBlock(block) {
//         if (block.length === 0) return;

//         let indentLevel = block[0].line.match(/^\s*/)[0];
//         let blockContent = block.map(l => l.line).join('\n').replace(/"/g, '\\"');
//         let blockSummary = block.map(l => `line ${l.lineNumber}: ${l.line.trim()}`).join('\\n');
//         result.push(blockContent);
//         result.push(`${indentLevel}    print("block starting at line ${block[0].lineNumber}:\\n${blockSummary}")`);
//         result.push(`${indentLevel}    print("status here")`);
//     }

//     lines.forEach((line, index) => {
//         let trimmedLine = line.trim();
//         let indentLevel = line.match(/^\s*/)[0].length;

//         // Check if we are inside a block
//         if (blockStack.length > 0) {
//             let topBlock = blockStack[blockStack.length - 1];
//             if (indentLevel <= topBlock.indentLevel && topBlock.lines.length > 0) {
//                 processBlock(topBlock.lines);
//                 blockStack.pop();
//             }
//         }

//         if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ') || trimmedLine.startsWith('if ') || trimmedLine.startsWith('elif ') || trimmedLine.startsWith('else')) {
//             blockStack.push({ indentLevel, lines: [{ line, lineNumber: index + 1 }] });
//         } else if (blockStack.length > 0) {
//             blockStack[blockStack.length - 1].lines.push({ line, lineNumber: index + 1 });
//         } else {
//             addPrintStatement(line, index + 1);
//         }
//     });

//     // Process any remaining blocks
//     while (blockStack.length > 0) {
//         processBlock(blockStack.pop().lines);
//     }

//     return result.join('\n');
// }
// function runCode() {
//     const codeInput = document.getElementById('codeInput').value.trim();

//     // Check if codeInput is empty
//     if (!codeInput) {
//         console.error('Code input is empty');
//         return;
//     }

//     // Preprocess the input code
//     const preprocessedCode = preprocessPythonCode(codeInput);

//     // Send the preprocessed code for execution
//     fetch('http://localhost:5000/execute', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ code: preprocessedCode })
//     })
//     .then(response => response.text())
//     .then(result => {
//         console.log(result);
//         displayStepByStep(result); // Call displayStepByStep function here
//     })
//     .catch(error => console.error('Error:', error));
// }

function preprocessPythonCode(code) {
    const lines = code.split('\n');
    let result = [];
    let blockStack = [];

    function addPrintStatement(line, lineNumber) {
        let indentLevel = line.match(/^\s*/)[0];
        result.push(line);
        result.push(`${indentLevel}print("line ${lineNumber}: ${line.trim().replace(/"/g, '\\"')}")`);
    }

    function processBlock(block) {
        if (block.length === 0) return;

        let indentLevel = block[0].line.match(/^\s*/)[0];
        let blockContent = block.map(l => l.line).join('\n').replace(/"/g, '\\"');
        let blockSummary = block.map(l => `line ${l.lineNumber}: ${l.line.trim()}`).join('\\n');
        result.push(blockContent);
        result.push(`${indentLevel}    print("line ${block[0].lineNumber}:\\n${blockSummary}")`);
    }

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

        if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ') || trimmedLine.startsWith('if ') || trimmedLine.startsWith('elif ') || trimmedLine.startsWith('else')) {
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

    return result.join('\n');
}

function runCode() {
    const codeInput = document.getElementById('codeInput').value.trim();

    if (!codeInput) {
        console.error('Code input is empty');
        return;
    }

    const preprocessedCode = preprocessPythonCode(codeInput);

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
        displayStepByStep(responseData);
    })
    .catch(error => console.error('Fetch Error:', error));
}

let stepIndex = 0;
function displayStepByStep(responseData) {
    console.log(responseData);
    const variableTableBody = document.getElementById('variableTableBody');
    const outputArea = document.getElementById('outputArea');

    variableTableBody.innerHTML = '';
    outputArea.innerHTML = '';

    if (stepIndex < responseData.length) {
        const step = responseData[stepIndex];
        for (const variableName in step.variables) {
            const variable = step.variables[variableName];
            const row = `<tr>
                          <td>${variableName}</td>
                          <td>${variable.value}</td>
                          <td>${variable.type}</td>
                          <td>Global</td>
                        </tr>`;
            variableTableBody.innerHTML += row;
        }

        const codeLine = step.code.replace("print(", "").replace("status here", "").trim();
        const codeLineElement = document.createElement('p');
        codeLineElement.textContent = `Executed code: ${codeLine}`;
        outputArea.appendChild(codeLineElement);

        const outputLines = step.output;
        outputLines.forEach(output => {
            const outputLineElement = document.createElement('p');
            outputLineElement.textContent = output;
            outputArea.appendChild(outputLineElement);
        });

        stepIndex++;
        setTimeout(() => displayStepByStep(responseData), 2000); // 2-second delay
    }
}

