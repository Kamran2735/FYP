

  async function visualizeArray(array) {
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '';
    const arrayElement = document.createElement('div');
    arrayElement.classList.add('array');
  
    for (let i = 0; i < array.length; i++) {
      const box = document.createElement('div');
      box.classList.add('box');
      box.innerText = array[i];
      arrayElement.appendChild(box);
      visualization.appendChild(arrayElement);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust delay time as needed
    }
  }
  
  async function submitCode() {
    const code = document.getElementById('codeInput').value;
    fetch('http://127.0.0.1:5000/process_code', {
      method: 'POST',
      body: JSON.stringify({ code: code }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      visualizeArray(data.values);
    })
    .catch(error => console.error('Error:', error));
  }
  