const playAreaEls = document.querySelector('#secPlayArea');
const codeAreaPara = document.querySelector("#codeArea");
const arrSize = document.querySelector("#arrSize");
const btnArrSize = document.querySelector("#btnArrSize");
const btnAddElement = document.querySelector("#btnAddElement");
let arrayInitialized = false;
let objArr = [];
let dataType = 'int'; // Store the selected data type
let currentDraggedElement = null;
let lastClickedElement = null; // Track the last clicked element

// Event listener for the datatype selection dropdown
arrDatatype.addEventListener('change', () => {
    dataType = arrDatatype.value; // Update the dataType variable when a datatype is selected
});

// Event listener for creating the array
btnArrSize.addEventListener('click', () => {
    createArr();
});

// Function to add event listeners for input items
function addInputListeners(obj) {
    // Event listener for input event to update code area in real-time
    obj.playEl.addEventListener('input', () => {
        updateValue(obj);
    });

    // Event listener for focus event (when the input field gains focus)
    obj.playEl.addEventListener('focus', () => {
        obj.playEl.classList.add('dragged'); // Add 'dragged' class when input field gains focus
    });

    // Event listener for blur event (when the input field loses focus)
    obj.playEl.addEventListener('blur', () => {
        obj.playEl.classList.remove('dragged'); // Remove 'dragged' class when input field loses focus
    });

    // Event listener for click event on input item
    obj.playEl.addEventListener('click', () => {
        resetBorderStyles(); // Reset border styles before applying to the new element
        obj.playEl.style.border = '.25rem solid #45a049'; // Apply border style to the clicked inputItem
        lastClickedElement = obj.playEl; // Update the last clicked element
    });
}

// Function to reset border styles of last clicked and last dragged elements
function resetBorderStyles() {
    if (lastClickedElement) {
        lastClickedElement.style.border = '';
    }
    if (currentDraggedElement) {
        currentDraggedElement.style.border = '';
    }
}

// Function to add event listeners for click events on inputItems
function addClickListeners(obj) {
    obj.playEl.addEventListener('click', () => {
        resetBorderStyles(); // Reset border styles before applying to the new element
        obj.playEl.style.border = '.25rem solid #45a049'; // Apply border style to the clicked inputItem
        lastClickedElement = obj.playEl; // Update the last clicked element
    });
}

// Function to update the value in the code area
function updateValue(obj) {
    const inputValue = obj.playEl.value.trim();
    let isValid = true;

    // Check if the input value matches the selected data type
    switch (dataType) {
        case 'int':
            isValid = /^\d+$/.test(inputValue);
            break;
        case 'float':
            isValid = /^-?\d*\.?\d*$/.test(inputValue);
            break;
        case 'char':
            isValid = /^[a-zA-Z]$/.test(inputValue);
            break;
        case 'string':
            isValid = true; // No restriction for string type
            break;
        default:
            isValid = false; // Invalid data type
            break;
    }

    if (!isValid) {
        alert(`Invalid input for ${dataType} data type.`);
        // Reset the input value
        obj.playEl.value = '';
        obj.codeEl.innerText = '0'; // Reset the corresponding code area element
    } else {
        obj.codeEl.innerText = inputValue;
    }
}

// Function to handle drag start event
function dragStart(e) {
    currentDraggedElement = e.target;
    e.dataTransfer.setData('text/plain', null);

    resetBorderStyles(); // Reset border styles before applying to the new element
    // Apply border style to the dragged element
    currentDraggedElement.style.border = '.25rem solid #45a049';
    // Add the 'dragged' class to the dragged element
    currentDraggedElement.classList.add('dragged');
    updateValue(objArr.find(obj => obj.playEl === currentDraggedElement));
}

// Function to handle drop event
function drop(e) {
    e.preventDefault();
    const dropTarget = e.target;
    if (dropTarget.classList.contains('inputItems') && dropTarget !== currentDraggedElement) {
        const temp = currentDraggedElement.value;
        currentDraggedElement.value = dropTarget.value;
        dropTarget.value = temp;

        // Update the corresponding code area elements
        const currentDraggedCodeElement = objArr.find(obj => obj.playEl === currentDraggedElement).codeEl;
        const dropTargetCodeElement = objArr.find(obj => obj.playEl === dropTarget).codeEl;

        currentDraggedCodeElement.innerText = currentDraggedElement.value;
        dropTargetCodeElement.innerText = dropTarget.value;

        // Update code area content
        updateCodeArea();
    }

    // Apply border style to the drop target
    dropTarget.style.border = '.25rem solid #45a049';

    resetBorderStyles(); // Reset border styles
    lastClickedElement = dropTarget; // Update the last clicked element
    updateValue(objArr.find(obj => obj.playEl === dropTarget));
}

// Function to handle drag end event
function dragEnd(e) {
    currentDraggedElement = null;
    // Reset border style of the dragged element
    e.target.style.border = '';
    // Remove the 'dragged' class from the dragged element
    e.target.classList.remove('dragged');
    updateValue(objArr.find(obj => obj.playEl === e.target));
}

// Function to handle drag over event
function dragOver(e) {
    e.preventDefault();
}

// Function to create elements on the page
function createArr() {
    const inputValue = parseInt(arrSize.value);
    dataType = arrDatatype.value; // Get the selected data type

    // Check if the input value is greater than 10
    if (inputValue > 10) {
        alert("Max 10 elements allowed. Please re-enter a value less than or equal to 10.");
        arrSize.value = ""; // Clear the input field
        return; // Exit the function
    }

    // Check if the array is already initialized
    if (objArr.length > 0) {
        const replaceArray = confirm("An array is already initialized. Do you want to replace it?");
        if (replaceArray) {
            // If yes, remove the existing array
            objArr.forEach(obj => obj.playEl.parentElement.remove());
            objArr.length = 0; // Clear the array
        } else {
            return; // Exit the function without adding a new array
        }
    }

    // Clear the codeArea
    codeAreaPara.innerHTML = "";

    // Update the declaration of 'let array = []' based on the new input value and data type
    const arrayDeclaration = document.createElement("span");
    arrayDeclaration.innerText = `let array = [ `;
    codeAreaPara.append(arrayDeclaration);

    // Inside the createArr function
for (let i = 0; i < inputValue; i++) {
    const tempCon = document.createElement("div");
    tempCon.classList.add("inputCon");
    
    // Creating input element in the playarea
    const tempPlayEl = document.createElement("input");
    tempPlayEl.type = dataType;
    tempPlayEl.id = `playEl${i + 1}`;
    tempPlayEl.draggable = true;
    tempPlayEl.classList.add("inputItems");

    // Adding delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'x';
    deleteBtn.classList.add('deleteBtn');
    deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

    // Event listener to show delete button on hover
    tempCon.addEventListener('mouseenter', () => {
        deleteBtn.style.visibility = 'visible';
    });

    // Event listener to hide delete button on mouse leave
    tempCon.addEventListener('mouseleave', () => {
        deleteBtn.style.visibility = 'hidden';
    });

    // Event listener to delete element on button click
    deleteBtn.addEventListener('click', () => {
        deleteElement(tempCon); // Pass the container div to deleteElement function
    });

    //Indexes
    const tempIndex  = document.createElement("p");
    tempIndex.innerText = i;

    tempCon.append(tempPlayEl, tempIndex, deleteBtn); // Append delete button to container
    playAreaEls.append(tempCon);

    // Creating span element in the code area
    const tempCodeEl = document.createElement("span");
    tempCodeEl.id = `codeEl${i + 1}`;
    tempCodeEl.innerText = "0";
    codeAreaPara.append(tempCodeEl);

    // Adding Comma after every span in codeArea and at the end closing square bracket
    if (i !== inputValue - 1) {
        const tempComma = document.createElement("span");
        tempComma.innerText = " , ";
        codeAreaPara.append(tempComma);
    } else {
        const tempBracket = document.createElement("span");
        tempBracket.innerText = " ]";
        codeAreaPara.append(tempBracket);
    }

    // Making an object of input and span for linking them together and adding the object in the objArr
    const tempObj = { playEl: tempPlayEl, codeEl: tempCodeEl };
    objArr.push(tempObj);

    // Add event listeners for input changes, click events, and drag events
    addInputListeners(tempObj);
    addClickListeners(tempObj);
    tempPlayEl.addEventListener('dragstart', dragStart);
    tempPlayEl.addEventListener('dragover', dragOver);
    tempPlayEl.addEventListener('drop', drop);
    tempPlayEl.addEventListener('dragend', dragEnd);
}
arrayInitialized = true;
}


function deleteElement(container) {
    const index = Array.from(playAreaEls.children).indexOf(container); // Get index of container in playAreaEls
    if (index !== -1) {
        objArr.splice(index, 1); // Remove element from objArr
        container.remove(); // Remove element from DOM
        
        // Update indexes of all elements
        const indexParagraphs = playAreaEls.querySelectorAll('.inputCon p');
        indexParagraphs.forEach((paragraph, i) => {
            paragraph.innerText = i; // Update index text
        });

        updateCodeArea(); // Update code area after deletion
    }
}

function deleteElementByIndexOrValue(indexOrValue) {
    // Convert index or value to the appropriate type
    const index = parseInt(indexOrValue); // Parse as integer
    const value = isNaN(index) ? indexOrValue : index; // If it's not a number, keep it as a string

    if (typeof value === 'number') {
        // Delete element by index
        deleteElementByIndex(index);
    } else {
        // Delete element by value
        deleteElementByValue(value);
    }
}

function deleteElementByIndex(index) {
    // Find the index of the element with the given index
    if (index >= 0 && index < objArr.length) {
        const deletedElement = objArr.splice(index, 1)[0]; // Remove the element from the array
        if (deletedElement && deletedElement.playEl) {
            deletedElement.playEl.parentElement.remove(); // Remove the element's container from the DOM
        }

        // Update indexes of all elements
        const indexParagraphs = playAreaEls.querySelectorAll('.inputCon p');
        indexParagraphs.forEach((paragraph, i) => {
            paragraph.innerText = i; // Update index text
        });

        updateCodeArea(); // Update code area after deletion
    }
}

function deleteElementByIndex(index) {
    // Find the index of the element with the given index
    if (index >= 0 && index < objArr.length) {
        const deletedElement = objArr.splice(index, 1)[0]; // Remove the element from the array

        // Remove the container from the play area
        if (deletedElement && deletedElement.container) {
            deletedElement.container.remove();
        }

        // Remove the code element from the code area
        if (deletedElement && deletedElement.codeEl) {
            deletedElement.codeEl.remove();
        }

        // Update indexes of all elements
        const indexParagraphs = playAreaEls.querySelectorAll('.inputCon p');
        indexParagraphs.forEach((paragraph, i) => {
            paragraph.innerText = i; // Update index text
        });

        updateCodeArea(); // Update code area after deletion
    }

}   

// Function to update the code area content and rearrange brackets
function updateCodeArea() {
    // Clear codeAreaPara content
    codeAreaPara.innerHTML = "";

    // Update the declaration of 'let array = []'
    const arrayDeclaration = document.createElement("span");
    arrayDeclaration.innerText = `let array = [ `;
    codeAreaPara.append(arrayDeclaration);

    // Loop through objArr to update code area content
    objArr.forEach((obj, index) => {
        // Create span element for the code area
        const tempCodeEl = document.createElement("span");
        tempCodeEl.id = `codeEl${index + 1}`;
        tempCodeEl.innerText = obj.playEl.value.trim() === "" ? "0" : obj.playEl.value.trim();
        codeAreaPara.append(tempCodeEl);

        // Adding Comma after every span in codeArea and at the end closing square bracket
        if (index !== objArr.length - 1) {
            const tempComma = document.createElement("span");
            tempComma.innerText = ", ";
            codeAreaPara.append(tempComma);
        }
        else {
            const tempBracket = document.createElement("span");
            tempBracket.innerText = " ]";
            codeAreaPara.append(tempBracket);
        }
    });
}



// Event listener for the "Randomize" button
btnRandomize.addEventListener('click', () => {
    if (dataType === '') {
        alert('Please select a data type first.');
        return;
    }
    createRandomArray();
});

/// Function to create a randomized array with a random number of elements between 1 and 10
function createRandomArray() {
    if (dataType === '') {
        alert('Please select a datatype first.'); // Alert if no datatype is selected
        return;
    }

    // Generate a random number of elements between 1 and 10
    const randomNumberOfElements = Math.floor(Math.random() * 10) + 1;

    // Clear any existing array elements
    playAreaEls.innerHTML = '';
    objArr = []; // Reset objArr

    // Update the dataType variable when a datatype is selected
    dataType = arrDatatype.value;

    // Clear the codeAreaPara
    codeAreaPara.innerHTML = "";

    // Update the declaration of 'let array = []' based on the new input value and data type
    const arrayDeclaration = document.createElement("span");
    arrayDeclaration.innerText = `let array = [ `;
    codeAreaPara.append(arrayDeclaration);

    // Inside the createRandomArray function
    for (let i = 0; i < randomNumberOfElements; i++) {
        const tempCon = document.createElement("div");
        tempCon.classList.add("inputCon");

        // Creating input element in the playarea
        const tempPlayEl = document.createElement("input");
        tempPlayEl.type = dataType;
        tempPlayEl.id = `playEl${i + 1}`;
        tempPlayEl.draggable = true;
        tempPlayEl.classList.add("inputItems");

        //Indexes
        const tempIndex = document.createElement("p");
        tempIndex.innerText = i;

        // Adding delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'x';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

        // Event listener to show delete button on hover
        tempCon.addEventListener('mouseenter', () => {
            deleteBtn.style.visibility = 'visible';
        });

        // Event listener to hide delete button on mouse leave
        tempCon.addEventListener('mouseleave', () => {
            deleteBtn.style.visibility = 'hidden';
        });

        // Event listener to delete element on button click
        deleteBtn.addEventListener('click', () => {
            // Call the deleteElement function passing the parent container
            deleteElement(tempCon);
        });

        tempCon.append(tempPlayEl, tempIndex, deleteBtn); // Append delete button to container
        playAreaEls.append(tempCon);

        // Generate random values based on the datatype
        let randomValue;
        switch (dataType) {
            case 'int':
                randomValue = Math.floor(Math.random() * 100); // Random integers between 0 and 99
                break;
            case 'float':
                randomValue = (Math.random() * 100).toFixed(2); // Random floats between 0 and 99 with two decimal places
                break;
            case 'char':
                randomValue = String.fromCharCode(Math.floor(Math.random() * 26) + 65); // Random uppercase letter
                break;
            case 'string':
                const randomLength = Math.floor(Math.random() * 10) + 1; // Random string length between 1 and 10
                randomValue = '';
                for (let j = 0; j < randomLength; j++) {
                    randomValue += String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Random lowercase letter
                }
                break;
            default:
                alert('Invalid datatype.'); // Alert if an invalid datatype is selected
                return;
        }

        // Set the random value to the input element
        tempPlayEl.value = randomValue;

        // Creating span element in the code area
        const tempCodeEl = document.createElement("span");
        tempCodeEl.id = `codeEl${i + 1}`;
        tempCodeEl.innerText = randomValue;
        codeAreaPara.append(tempCodeEl);

        // Adding Comma after every span in codeArea and at the end closing square bracket
        if (i !== randomNumberOfElements - 1) {
            const tempComma = document.createElement("span");
            tempComma.innerText = " , ";
            codeAreaPara.append(tempComma);
        } else {
            const tempBracket = document.createElement("span");
            tempBracket.innerText = " ]";
            codeAreaPara.append(tempBracket);
        }

        // Making an object of input and span for linking them together and adding the object in the objArr
        const tempObj = { playEl: tempPlayEl, codeEl: tempCodeEl };
        objArr.push(tempObj);

        // Add event listeners for input changes, click events, and drag events
        addInputListeners(tempObj);
        addClickListeners(tempObj);
        tempPlayEl.addEventListener('dragstart', dragStart);
        tempPlayEl.addEventListener('dragover', dragOver);
        tempPlayEl.addEventListener('drop', drop);
        tempPlayEl.addEventListener('dragend', dragEnd);
    }
    arrayInitialized = true;
}


// Event listener for the "Add Element" button
btnAddElement.addEventListener('click', () => {
    if (dataType === '') {
        alert('Please select a data type first.');
        return;
    }
    addElement();
});

// Function to add a new input item and its corresponding code area element
function addElement(value = null) {
    if (arrayInitialized === true) {
        // Create a new input element
        const newInput = document.createElement('input');
        newInput.type = dataType; // Set the type based on the selected data type
        newInput.classList.add('inputItems'); 
        newInput.draggable = true; // Make draggable
        
        // If value is provided, set it to the input element
        if (value !== null) {
            newInput.value = value;
        }

        // Create a new paragraph element for index
        const newIndex = document.createElement('p');
        newIndex.innerText = objArr.length; // Set the index as the length of the array

        // Create a new container for the input item, index, and delete button
        const newContainer = document.createElement('div');
        newContainer.classList.add('inputCon');
        newContainer.append(newInput, newIndex); // Append input and index to the container

        // Adding delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'x';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

        // Event listener to show delete button on hover
        newContainer.addEventListener('mouseenter', () => {
            deleteBtn.style.visibility = 'visible';
        });

        // Event listener to hide delete button on mouse leave
        newContainer.addEventListener('mouseleave', () => {
            deleteBtn.style.visibility = 'hidden';
        });

        // Event listener to delete element on button click
        deleteBtn.addEventListener('click', () => {
            deleteElement(newContainer); // Pass the container div to deleteElement function
        });

        newContainer.append(deleteBtn); // Append delete button to container

        // Add the new input item to the play area
        playAreaEls.appendChild(newContainer);

        // Create a new span element for the code area
        const newCodeEl = document.createElement('span');
        newCodeEl.class = `codeEl${objArr.length + 1}`; // Set the ID based on the array length
        newCodeEl.innerText = value !== null ? value : "0"; // Initialize with '0' or the provided value

        // Update the objArr with the new input and code elements
        const newObj = { playEl: newInput, codeEl: newCodeEl };
        objArr.push(newObj);

        // Add event listeners for input changes, click events, and drag events
        addInputListeners(newObj); // Add input listeners to the new input element
        addClickListeners(newObj);
        newInput.addEventListener('input', () => {
            updateCodeArea(); // Call updateCodeArea function when input value changes
        });
        newInput.addEventListener('dragstart', dragStart);
        newInput.addEventListener('dragover', dragOver);
        newInput.addEventListener('drop', drop);
        newInput.addEventListener('dragend', dragEnd);

        // Insert comma if needed
        if (objArr.length > 1) {
            const comma = document.createElement('span');
            comma.innerText = ', ';
            codeAreaPara.insertBefore(comma, codeAreaPara.lastChild.previousSibling); // Insert comma before the last but one element
        }

        // Update the text content of codeEl and rearrange brackets
        updateCodeArea();  
    } else {
        alert('Initialize array First.'); 
    }
}

function createPythonArray() {
    // Get the user input from the textarea
    const userInput = document.getElementById("userArrayInput").value;

    // Split the user input by lines
    const lines = userInput.split('\n');

    // Process each line separately
    lines.forEach(line => {
        // Define the regular expression pattern for the expected format of array initialization
        const initRegex = /(\w+)\s*=\s*\[\s*([^[\]]*)\s*\]/;

        // Define the regular expression pattern for the expected format of append operation
        const appendRegex = /(\w+)\s*\.\s*append\(([^()]*)\)/;

        // Define the regular expression pattern for the expected format of delete operation
        const deleteRegex = /(\w+)\s*\.\s*pop\(\s*(\d+|"([^"]+)")\s*\)/;

        // Check if the line matches the format of array initialization
        const initMatch = line.match(initRegex);
        const appendMatch = line.match(appendRegex);
        const deleteMatch = line.match(deleteRegex);

        if (initMatch) {
            // Process array initialization
            const variableName = initMatch[1];
            const elementsString = initMatch[2];
            
            // Split the elements string into individual elements
            const elements = elementsString.split(',').map(element => element.trim());

        // Initialize an array to store the validated elements
        const validatedElements = [];

        // Regular expressions for different data types
        const stringRegex = /^"([^"]*)"$/;
        const charRegex = /^'([^'])'$/;
        const intRegex = /^-?\d+$/;
        const floatRegex = /^-?\d+(\.\d+)?$/;

        // Validate each element based on its data type
        for (let element of elements) {
            let validatedElement = null;

            // Check if the element is a string
            if (stringRegex.test(element)) {
                validatedElement = element.slice(1, -1); // Remove the surrounding quotes
            }
            // Check if the element is a character
            else if (charRegex.test(element)) {
                validatedElement = element.charAt(1); // Get the character inside the single quotes
            }
            // Check if the element is an integer
            else if (intRegex.test(element)) {
                validatedElement = parseInt(element);
            }
            // Check if the element is a float
            else if (floatRegex.test(element)) {
                validatedElement = parseFloat(element);
            }

            // If the element is validated, add it to the array
            if (validatedElement !== null) {
                validatedElements.push(validatedElement);
            } else {
                // If any element fails validation, display an error message and stop processing
                alert(`Invalid element: ${element}`);
                return;
            }
        }

        // Clear any existing array elements
        playAreaEls.innerHTML = '';
        objArr = []; // Reset objArr

        // Clear the codeAreaPara
        codeAreaPara.innerHTML = "";

        // Update the declaration of 'let array = []' based on the new input value and data type
        const arrayDeclaration = document.createElement("span");
        arrayDeclaration.innerText = `${variableName} = [ `;
        codeAreaPara.append(arrayDeclaration);

        // Inside the createPythonArray function
        for (let i = 0; i < elements.length; i++) {
            // Your existing code for creating elements goes here
            const tempCon = document.createElement("div");
            tempCon.classList.add("inputCon");

            // Creating input element in the playarea
            const tempPlayEl = document.createElement("input");
            tempPlayEl.type = dataType;
            tempPlayEl.id = `playEl${i + 1}`;
            tempPlayEl.draggable = true;
            tempPlayEl.classList.add("inputItems");

            //Indexes
            const tempIndex = document.createElement("p");
            tempIndex.innerText = i;

            // Adding delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'x';
            deleteBtn.classList.add('deleteBtn');
            deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

            // Event listener to show delete button on hover
            tempCon.addEventListener('mouseenter', () => {
                deleteBtn.style.visibility = 'visible';
            });

            // Event listener to hide delete button on mouse leave
            tempCon.addEventListener('mouseleave', () => {
                deleteBtn.style.visibility = 'hidden';
            });

            // Event listener to delete element on button click
            deleteBtn.addEventListener('click', () => {
                // Call the deleteElement function passing the parent container
                deleteElement(tempCon);
            });

            tempCon.append(tempPlayEl, tempIndex, deleteBtn); // Append delete button to container
            playAreaEls.append(tempCon);

            // Set the value of the input element
            tempPlayEl.value = elements[i];

            // Creating span element in the code area
            const tempCodeEl = document.createElement("span");
            tempCodeEl.id = `codeEl${i + 1}`;
            tempCodeEl.innerText = elements[i];
            codeAreaPara.append(tempCodeEl);

            // Adding Comma after every span in codeArea and at the end closing square bracket
            if (i !== elements.length - 1) {
                const tempComma = document.createElement("span");
                tempComma.innerText = " , ";
                codeAreaPara.append(tempComma);
            } else {
                const tempBracket = document.createElement("span");
                tempBracket.innerText = " ]";
                codeAreaPara.append(tempBracket);
            }

            // Making an object of input and span for linking them together and adding the object in the objArr
            const tempObj = { playEl: tempPlayEl, codeEl: tempCodeEl };
            objArr.push(tempObj);

            // Add event listeners for input changes, click events, and drag events
            addInputListeners(tempObj);
            addClickListeners(tempObj);
            tempPlayEl.addEventListener('dragstart', dragStart);
            tempPlayEl.addEventListener('dragover', dragOver);
            tempPlayEl.addEventListener('drop', drop);
            tempPlayEl.addEventListener('dragend', dragEnd);
        }
    }  else if (appendMatch) {
        // Process append operation
        const variableName = appendMatch[1];
        const value = appendMatch[2];
        addElement(value); // Call the addElement function with the provided value
    } else if (deleteMatch) {
        // Process delete operation
        const variableName = deleteMatch[1];
        const indexOrValue = deleteMatch[2];
        // Call the deleteElement function with the provided index or value
        deleteElementByIndexOrValue(indexOrValue);
    } else {
        // Display an error message for invalid input
        alert(`Invalid input: ${line}`);
    }
});

// Set arrayInitialized to true if the array is initialized successfully
arrayInitialized = true;
}
