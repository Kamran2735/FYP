// Function to execute the user's code
function runCode() {
  const pythonCode = document.getElementById('codeInput').value;

  if (!pythonCode.trim()) {
    alert('Please enter some code.');
    return;
  }

  document.getElementById('output').textContent = '';
  const variableTableBody = document.getElementById('variableTableBody');
  variableTableBody.innerHTML = '';

  fetch('http://localhost:3000/runcode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code: pythonCode }) // Send the Python code in the request body
  })
    .then(response => response.json())
    .then(data => {
      // Update output area with result
      document.getElementById('output').textContent = data.output;

      // Update variable table with variable information
      data.variables.forEach(variable => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${variable.name}</td>
            <td>${variable.value}</td>
            <td>${variable.dataType}</td>
            <td>${variable.scope}</td>
        `;
        variableTableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('An error occurred while fetching data. Please try again.');
    });
}
