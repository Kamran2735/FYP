let codeOutput = "";
let codeVariables = [];

function runCode() {
  const codeInput = document.getElementById("codeInput").value;

  fetch("http://127.0.0.1:5000/run_code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: codeInput }),
  })
    .then((response) => response.json())
    .then((data) => {
      codeOutput = data.output;
      codeVariables = data.variables;
      document.getElementById("output").innerText = codeOutput;

      const variableTableBody = document.getElementById("variableTableBody");
      variableTableBody.innerHTML = "";
      codeVariables.forEach((variable) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${variable.name}</td>
          <td>${variable.value}</td>
          <td>${variable.dataType}</td>
        `;
        variableTableBody.appendChild(newRow);
      });
      
      // Enable the step button
      document.getElementById("stepButton").disabled = false;
    })
    .catch((error) => console.error("Error:", error));
}

function stepCode() {
    fetch('http://127.0.0.1:5000/run_code', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update output
      codeOutput = data.output;
      document.getElementById("output").innerText = codeOutput;

      // Update variables
      codeVariables = data.variables;
      const variableTableBody = document.getElementById("variableTableBody");
      variableTableBody.innerHTML = "";
      codeVariables.forEach((variable) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${variable.name}</td>
          <td>${variable.value}</td>
          <td>${variable.dataType}</td>
        `;
        variableTableBody.appendChild(newRow);
      });
      
      // Check if the code execution has finished
      if (codeOutput.includes("end")) {
        // Disable the step button if the code has finished executing
        document.getElementById("stepButton").disabled = true;
      }
    })
    .catch((error) => console.error("Error:", error));
}