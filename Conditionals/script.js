async function runExecution() {
    const code = document.getElementById('codeInput').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/execute_code', { // Sending the request to the /execute endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            throw new Error('Failed to execute code');
        }

        const executionResults = await response.json();
        visualizeExecution(executionResults);
    } catch (error) {
        console.error('Error:', error);
    }
}

function visualizeExecution(executionResults) {
    const visualizationDiv = document.getElementById('visualization');
    visualizationDiv.innerHTML = '';

    // Check if executionResults is an object and contains output
    if (typeof executionResults !== 'object' || executionResults === null || !executionResults.hasOwnProperty('output')) {
        console.error('Invalid execution results:', executionResults);
        visualizationDiv.textContent = 'Invalid execution results.';
        return;
    }

    const output = executionResults.output;

    // Iterate over output
    for (const [lineNumber, result] of output) {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = `Line ${lineNumber}: ${result}`;
        visualizationDiv.appendChild(lineDiv);
    }
}




