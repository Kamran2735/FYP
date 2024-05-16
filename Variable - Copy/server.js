// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(bodyParser.json());
// app.use(cors())
// // Endpoint to handle code execution
// // Function to execute the user's code
// app.post('/runcode', (req, res) => {
//   const code = req.body.code;

//   // Variables object to store variable information
//   const variables = {};

//   // Function to capture variable information during code execution
//   function captureVariables(name, value, dataType, scope) {
//       console.log(name, value, dataType, scope)
//     if (!variables[name]) {
//       variables[name] = { name, value, dataType, scope };
//     } else {
//       // Update value if variable already exists
//       variables[name].value = value;
//     }
//   }

//   // Execute the code
//   let output;
//   try {
//     // Override console.log to capture variable information
//     const originalConsoleLog = console.log;
//     console.log = function() {
//       for (let i = 0; i < arguments.length; i++) {
//         const arg = arguments[i];
//         const type = typeof arg;
//         // If the argument is a variable, capture its name and value
//         if (type !== 'function' && type !== 'symbol') {
//           const name = Object.keys(variables).find(key => variables[key].value === arg);
//           if (name) {
//             captureVariables(name, arg, type, 'local');
//           }
//         }
//       }

//       // Call the original console.log function
//       originalConsoleLog.apply(console, arguments);
//     };

//     // Execute the code
//     const result = eval(code);

//     // Restore original console.log
//     console.log = originalConsoleLog;

//     output = result;
//   } catch (error) {
//     console.error(error);
//     output = 'Error executing code';
//   }
//   console.log(output,variables)
//   // Send back the output and variable information in the response
//   res.json({ output, variables: Object.values(variables) });
// });
  

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const { PythonShell } = require('python-shell');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Function to execute Python code
function runPythonCode(code) {
  const options = {
    mode: 'text',
    pythonOptions: ['-u'], // unbuffered stdout and stderr
  };

  // Variables object to store variable information
  const variables = {};

  // Function to capture variable information during code execution
  function captureVariables(name, value, dataType, scope) {
    console.log(name, value, dataType, scope);
    if (!variables[name]) {
      variables[name] = { name, value, dataType, scope };
    } else {
      // Update value if variable already exists
      variables[name].value = value;
    }
  }

  return new Promise((resolve, reject) => {
    PythonShell.runString(code, options, function (err, results) {
      if (err) {
        console.error(err);
        reject('Error executing code');
      } else {
        resolve({ output: results.join('\n'), variables });
      }
    });
  });
}

// Endpoint to handle code execution
app.post('/runcode', async (req, res) => {
  const code = req.body.code;

  try {
    const result = await runPythonCode(code);
    console.log(result.output, result.variables);
    res.json(result);
  } catch (error) {
    console.error('Error executing Python code:', error);
    res.status(500).json({ error: 'Error executing Python code' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
