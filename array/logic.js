const playAreaEls = document.querySelector('#secPlayArea');
const codeAreaPara = document.querySelector("#codeArea");
const arrSize = document.querySelector("#arrSize");
const btnArrSize = document.querySelector("#btnArrSize");
const btnAddElement = document.querySelector("#btnAddElement");
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

}


// Function to delete the selected element
function deleteElement(container) {
    const index = Array.from(playAreaEls.children).indexOf(container); // Get index of container in playAreaEls
    if (index !== -1) {
        objArr.splice(index, 1); // Remove element from objArr
        container.remove(); // Remove element from DOM
        
        // Update indexes of all elements
        objArr.forEach((obj, i) => {
            obj.playEl.previousElementSibling.innerText = i; // Update index text
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
function addElement() {
    // Create a new input element
    const newInput = document.createElement('input');
    newInput.type = dataType; // Set the type based on the selected data type
    newInput.classList.add('inputItems'); 
    newInput.draggable = true; // Make draggable

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
    newCodeEl.innerText = "0"; // Initialize with '0'

    // Update the objArr with the new input and code elements
    const newObj = { playEl: newInput, codeEl: newCodeEl };
    objArr.push(newObj);

    // Add event listeners for input changes, click events, and drag events
    addInputListeners(newObj); // Add input listeners to the new input element
    addClickListeners(newObj);
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
}






// function createArr() {
//     const inputValue = parseInt(arrSize.value);
//     dataType = arrDatatype.value; // Get the selected data type

//     // Check if the input value is greater than 10
//     if (inputValue > 10) {
//         alert("Max 10 elements allowed. Please re-enter a value less than or equal to 10.");
//         arrSize.value = ""; // Clear the input field
//         return; // Exit the function
//     }

//     // Check if the array is already initialized
//     if (objArr.length > 0) {
//         const replaceArray = confirm("An array is already initialized. Do you want to replace it?");
//         if (replaceArray) {
//             // If yes, remove the existing array
//             objArr.forEach(obj => obj.playEl.parentElement.remove());
//             objArr.length = 0; // Clear the array
//         } else {
//             return; // Exit the function without adding a new array
//         }
//     }

//     // Clear the codeArea
//     codeAreaPara.innerHTML = "";

//     // Update the declaration of 'let array = []' based on the new input value and data type
//     const arrayDeclaration = document.createElement("span");
//     arrayDeclaration.innerText = `let array = [ `;
//     codeAreaPara.append(arrayDeclaration);

// // Inside the createArr function
// for (let i = 0; i < inputValue; i++) {
//     // Create container element
//     const tempCon = document.createElement("div");
//     tempCon.classList.add("inputCon");

//     // Creating input element in the playarea
//     const tempPlayEl = document.createElement("input");
//     tempPlayEl.type = dataType;
//     tempPlayEl.id = `playEl${i + 1}`;
//     tempPlayEl.draggable = true;
//     tempPlayEl.classList.add("inputItems");

//     // Adding index for the new element
//     const tempIndex = document.createElement("p");
//     tempIndex.innerText = i;

//     // Adding delete button for the new element
//     const deleteBtn = document.createElement('button');
//     deleteBtn.innerText = 'x';
//     deleteBtn.classList.add('deleteBtn');
//     deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

//     // Event listener to show delete button on hover
//     tempCon.addEventListener('mouseenter', () => {
//         deleteBtn.style.visibility = 'visible';
//     });

//     // Event listener to hide delete button on mouse leave
//     tempCon.addEventListener('mouseleave', () => {
//         deleteBtn.style.visibility = 'hidden';
//     });

//     // Event listener to delete element on button click
//     deleteBtn.addEventListener('click', () => {
//         deleteElement(tempCon); // Pass the container div to deleteElement function
//     });

//     // Add buttons for adding elements on both sides of each input element
//     const addLeftButton = document.createElement('button');
//     addLeftButton.innerText = '+';
//     addLeftButton.classList.add('addElementButton');
//     addLeftButton.addEventListener('click', () => {
//         addElementToLeft(tempCon); // Pass the container div
//     });

//     const addRightButton = document.createElement('button');
//     addRightButton.innerText = '+';
//     addRightButton.classList.add('addElementButton');
//     addRightButton.addEventListener('click', () => {
//         addElementToRight(tempCon); // Pass the container div
//     });

//     // Append buttons and other elements to container
//     tempCon.append(tempPlayEl, tempIndex, addLeftButton, addRightButton, deleteBtn);
//     // Update event listeners for hover and click events on input elements
//     updateInputListeners(tempPlayEl);

//     // Append the container to the playAreaEls
//     playAreaEls.append(tempCon);



//     // Creating span element in the code area
//     const tempCodeEl = document.createElement("span");
//     tempCodeEl.id = `codeEl${i + 1}`;
//     tempCodeEl.innerText = "0";
//     codeAreaPara.append(tempCodeEl);

//     // Adding Comma after every span in codeArea and at the end closing square bracket
//     if (i !== inputValue - 1) {
//         const tempComma = document.createElement("span");
//         tempComma.innerText = " , ";
//         codeAreaPara.append(tempComma);
//     } else {
//         const tempBracket = document.createElement("span");
//         tempBracket.innerText = " ]";
//         codeAreaPara.append(tempBracket);
//     }


//     // Making an object of input and span for linking them together and adding the object in the objArr
//     const tempObj = { playEl: tempPlayEl, codeEl: tempCodeEl };
//     objArr.push(tempObj);


//     addLeftButton.addEventListener('click', () => {
//         addElementToLeft(tempCon);
//     });
//     addRightButton.addEventListener('click', () => {
//         addElementToRight(tempCon);
//     });

//     // Add event listeners for input changes, click events, and drag events
//     addInputListeners(tempObj);
//     addClickListeners(tempObj);
//     tempPlayEl.addEventListener('dragstart', dragStart);
//     tempPlayEl.addEventListener('dragover', dragOver);
//     tempPlayEl.addEventListener('drop', drop);
//     tempPlayEl.addEventListener('dragend', dragEnd);
// }
// }


// // Event listener for creating elements on the left side
// function addElementToLeft(container) {
//     const index = Array.from(playAreaEls.children).indexOf(container); // Get index of container in playAreaEls

//     // Creating input element in the playarea
//     const tempPlayEl = document.createElement("input");
//     tempPlayEl.type = dataType;
//     tempPlayEl.id = `playEl${index}`;
//     tempPlayEl.draggable = true;
//     tempPlayEl.classList.add("inputItems");

//     // Adding index for the new element
//     const tempIndex = document.createElement("p");
//     tempIndex.innerText = index;

//     // Adding delete button for the new element
//     const deleteBtn = document.createElement('button');
//     deleteBtn.innerText = 'x';
//     deleteBtn.classList.add('deleteBtn');
//     deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

//     // Event listener to show delete button on hover
//     container.addEventListener('mouseenter', () => {
//         deleteBtn.style.visibility = 'visible';
//     });

//     // Event listener to hide delete button on mouse leave
//     container.addEventListener('mouseleave', () => {
//         deleteBtn.style.visibility = 'hidden';
//     });

//     // Event listener to delete element on button click
//     deleteBtn.addEventListener('click', () => {
//         deleteElement(container); // Pass the container div to deleteElement function
//     });

//     const newContainer = document.createElement("div");
//     newContainer.classList.add("inputCon");

//     // Append input, index, and delete button to the new container
//     newContainer.append(tempPlayEl, tempIndex, deleteBtn);

//     // Insert the new container before the current container
//     container.parentElement.insertBefore(newContainer, container);

//     // Update indexes of all elements
//     objArr.forEach((obj, i) => {
//         obj.playEl.previousElementSibling.innerText = i; // Update index text
//     });

//     updateCodeArea(); // Update code area after addition
// }

// // Event listener for creating elements on the left side
// btnAddElement.addEventListener('click', () => {
//     const firstContainer = playAreaEls.children[0]; // Get the first container in playAreaEls
//     addElementToLeft(firstContainer); // Pass the first container to the function
// });


// // Event listener for creating elements on the right side
// function addElementToRight(container) {
//     const index = Array.from(playAreaEls.children).indexOf(container) + 1; // Get index of container in playAreaEls and add 1 for the right side

//     // Creating input element in the playarea
//     const tempPlayEl = document.createElement("input");
//     tempPlayEl.type = dataType;
//     tempPlayEl.id = `playEl${index}`;
//     tempPlayEl.draggable = true;
//     tempPlayEl.classList.add("inputItems");

//     // Adding index for the new element
//     const tempIndex = document.createElement("p");
//     tempIndex.innerText = index;

//     // Adding delete button for the new element
//     const deleteBtn = document.createElement('button');
//     deleteBtn.innerText = 'x';
//     deleteBtn.classList.add('deleteBtn');
//     deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

//     // Event listener to show delete button on hover
//     tempCon.addEventListener('mouseenter', () => {
//         deleteBtn.style.visibility = 'visible';
//     });

//     // Event listener to hide delete button on mouse leave
//     tempCon.addEventListener('mouseleave', () => {
//         deleteBtn.style.visibility = 'hidden';
//     });

//     // Event listener to delete element on button click
//     deleteBtn.addEventListener('click', () => {
//         deleteElement(tempCon); // Pass the container div to deleteElement function
//     });

//     const newContainer = document.createElement("div");
//     newContainer.classList.add("inputCon");

//     // Append input, index, and delete button to the new container
//     newContainer.append(tempPlayEl, tempIndex, deleteBtn);

//     // Insert the new container after the current container
//     container.parentElement.insertBefore(newContainer, container.nextSibling);

//     // Update indexes of all elements
//     objArr.forEach((obj, i) => {
//         obj.playEl.previousElementSibling.innerText = i; // Update index text
//     });

//     updateCodeArea(); // Update code area after addition
// }

// // Function to update the event listeners for hover and click events on input elements
// function updateInputListeners(input) {
//     input.addEventListener('mouseenter', () => {
//         const buttons = input.parentElement.querySelectorAll('button');
//         buttons.forEach(button => {
//             button.style.visibility = 'visible';
//         });
//     });

//     input.addEventListener('mouseleave', () => {
//         const buttons = input.parentElement.querySelectorAll('button');
//         buttons.forEach(button => {
//             button.style.visibility = 'hidden';
//         });
//     });
// }

// // Inside the createArr function
// // Add buttons for adding elements on both sides of each input element
// const addLeftButton = document.createElement('button');
// addLeftButton.innerText = '+';
// addLeftButton.classList.add('addElementButton');

// const addRightButton = document.createElement('button');
// addRightButton.innerText = '+';
// addRightButton.classList.add('addElementButton');

// tempCon.append(tempPlayEl, tempIndex, addLeftButton, addRightButton, deleteBtn); // Append buttons to container




























// function addElement() {
//     // Create a new input element
//     const newInput = document.createElement('input');
//     newInput.type = dataType; // Set the type based on the selected data type
//     newInput.classList.add('inputItems');
//     newInput.draggable = true; // Make draggable

//     // Create a new paragraph element for index
//     const newIndex = document.createElement('p');
//     newIndex.className = 'index'; // Add class for styling
//     newIndex.innerText = objArr.length; // Set index value

//     // Create a new container for the input item, index, and buttons
//     const newContainer = document.createElement('div');
//     newContainer.classList.add('inputCon');

//     // Left button
//     const leftButton = document.createElement('button');
//     leftButton.innerText = '+';
//     leftButton.classList.add('addButton');
//     leftButton.classList.add('leftButton');
//     leftButton.style.visibility = 'hidden';

//     // Right button
//     const rightButton = document.createElement('button');
//     rightButton.innerText = '+';
//     rightButton.classList.add('addButton');
//     rightButton.classList.add('rightButton');
//     rightButton.style.visibility = 'hidden';

//     // Show buttons on hover
//     newContainer.addEventListener('mouseenter', () => {
//         leftButton.style.visibility = 'visible';
//         rightButton.style.visibility = 'visible';
//     });

//     // Hide buttons on mouse leave
//     newContainer.addEventListener('mouseleave', () => {
//         leftButton.style.visibility = 'hidden';
//         rightButton.style.visibility = 'hidden';
//     });

//     // Add event listeners to buttons
//     leftButton.addEventListener('click', () => {
//         addElementBefore(newContainer);
//     });

//     rightButton.addEventListener('click', () => {
//         addElementAfter(newContainer);
//     });

//     // Append elements to the container
//     newContainer.append(leftButton, newInput, newIndex, rightButton);

//     // Add the new input item to the play area
//     playAreaEls.appendChild(newContainer);

//     // Create a new span element for the code area
//     const newCodeEl = document.createElement('span');
//     newCodeEl.className = `codeEl${objArr.length + 1}`; // Set class for styling
//     newCodeEl.innerText = "0"; // Initialize with '0'

//     // Update the objArr with the new input and code elements
//     const newObj = { playEl: newInput, codeEl: newCodeEl };
//     objArr.push(newObj);

//     // Add event listeners for input changes, click events, and drag events
//     addInputListeners(newObj); // Add input listeners to the new input element
//     addClickListeners(newObj);
//     newInput.addEventListener('dragstart', dragStart);
//     newInput.addEventListener('dragover', dragOver);
//     newInput.addEventListener('drop', drop);
//     newInput.addEventListener('dragend', dragEnd);

//     // Insert comma if needed
//     if (objArr.length > 1) {
//         const comma = document.createElement('span');
//         comma.innerText = ', ';
//         codeAreaPara.insertBefore(comma, codeAreaPara.lastChild.previousSibling); // Insert comma before the last but one element
//     }

//     // Update the text content of codeEl and rearrange brackets
//     updateCodeArea();
// }


// function addElementBefore(container) {
//     // Create a new input element
//     const newInput = document.createElement('input');
//     newInput.type = dataType; // Set the type based on the selected data type
//     newInput.classList.add('inputItems');
//     newInput.draggable = true; // Make draggable

//     // Create a new paragraph element for index
//     const newIndex = document.createElement('p');
//     newIndex.className = 'index'; // Add class for styling
//     newIndex.innerText = objArr.length; // Set index value

//     // Create a new container for the input item, index, and buttons
//     const newContainer = document.createElement('div');
//     newContainer.classList.add('inputCon');

//     // Left button
//     const leftButton = document.createElement('button');
//     leftButton.innerText = '+';
//     leftButton.classList.add('addButton');
//     leftButton.classList.add('leftButton');
//     leftButton.style.visibility = 'hidden';

//     // Right button
//     const rightButton = document.createElement('button');
//     rightButton.innerText = '+';
//     rightButton.classList.add('addButton');
//     rightButton.classList.add('rightButton');
//     rightButton.style.visibility = 'hidden';

//     // Show buttons on hover
//     newContainer.addEventListener('mouseenter', () => {
//         leftButton.style.visibility = 'visible';
//         rightButton.style.visibility = 'visible';
//     });

//     // Hide buttons on mouse leave
//     newContainer.addEventListener('mouseleave', () => {
//         leftButton.style.visibility = 'hidden';
//         rightButton.style.visibility = 'hidden';
//     });

//     // Add event listeners to buttons
//     leftButton.addEventListener('click', () => {
//         addElementBefore(newContainer);
//     });

//     rightButton.addEventListener('click', () => {
//         addElementAfter(newContainer);
//     });

//     // Append elements to the container
//     newContainer.append(leftButton, newInput, newIndex, rightButton);

//     // Add the new input item to the play area before the specified container
//     container.parentNode.insertBefore(newContainer, container);
// }

// function addElementAfter(container) {
//     // Create a new input element
//     const newInput = document.createElement('input');
//     newInput.type = dataType; // Set the type based on the selected data type
//     newInput.classList.add('inputItems');
//     newInput.draggable = true; // Make draggable

//     // Create a new paragraph element for index
//     const newIndex = document.createElement('p');
//     newIndex.className = 'index'; // Add class for styling
//     newIndex.innerText = objArr.length; // Set index value

//     // Create a new container for the input item, index, and buttons
//     const newContainer = document.createElement('div');
//     newContainer.classList.add('inputCon');

//     // Left button
//     const leftButton = document.createElement('button');
//     leftButton.innerText = '+';
//     leftButton.classList.add('addButton');
//     leftButton.classList.add('leftButton');
//     leftButton.style.visibility = 'hidden';

//     // Right button
//     const rightButton = document.createElement('button');
//     rightButton.innerText = '+';
//     rightButton.classList.add('addButton');
//     rightButton.classList.add('rightButton');
//     rightButton.style.visibility = 'hidden';

//     // Show buttons on hover
//     newContainer.addEventListener('mouseenter', () => {
//         leftButton.style.visibility = 'visible';
//         rightButton.style.visibility = 'visible';
//     });

//     // Hide buttons on mouse leave
//     newContainer.addEventListener('mouseleave', () => {
//         leftButton.style.visibility = 'hidden';
//         rightButton.style.visibility = 'hidden';
//     });

//     // Add event listeners to buttons
//     leftButton.addEventListener('click', () => {
//         addElementBefore(newContainer);
//     });

//     rightButton.addEventListener('click', () => {
//         addElementAfter(newContainer);
//     });

//     // Append elements to the container
//     newContainer.append(leftButton, newInput, newIndex, rightButton);

//     // Add the new input item to the play area after the specified container
//     container.parentNode.insertBefore(newContainer, container.nextSibling);
// }




// function createArr() {
//     const inputValue = parseInt(arrSize.value);
//     dataType = arrDatatype.value; // Get the selected data type

//     // Check if the input value is greater than 10
//     if (inputValue > 10) {
//         alert("Max 10 elements allowed. Please re-enter a value less than or equal to 10.");
//         arrSize.value = ""; // Clear the input field
//         return; // Exit the function
//     }

//     // Check if the array is already initialized
//     if (objArr.length > 0) {
//         const replaceArray = confirm("An array is already initialized. Do you want to replace it?");
//         if (replaceArray) {
//             // If yes, remove the existing array
//             objArr.forEach(obj => obj.playEl.parentElement.remove());
//             objArr.length = 0; // Clear the array
//         } else {
//             return; // Exit the function without adding a new array
//         }
//     }

//     // Clear the codeArea
//     codeAreaPara.innerHTML = "";

//     // Update the declaration of 'let array = []' based on the new input value and data type
//     const arrayDeclaration = document.createElement("span");
//     arrayDeclaration.innerText = `let array = [ `;
//     codeAreaPara.append(arrayDeclaration);

//     // Add an event listener to prevent default behavior for drag events
//     document.addEventListener('dragstart', function(event) {
//         const target = event.target;
//         // Check if the drag event originates from an input element within the play area
//         if (!target.classList.contains('inputItems')) {
//             event.preventDefault();
//         }
//     });

//     // Inside the createArr function
//     for (let i = 0; i < inputValue; i++) {
//         const tempCon = document.createElement("div");
//         tempCon.classList.add("inputCon");

//         // Creating input element in the playarea
//         const tempPlayEl = document.createElement("input");
//         tempPlayEl.type = dataType;
//         tempPlayEl.id = `playEl${i + 1}`;
//         tempPlayEl.classList.add("inputItems");

//         // Set only the input elements as draggable
//         tempPlayEl.draggable = true;

//         // Adding delete button
//         const deleteBtn = document.createElement('button');
//         deleteBtn.innerText = 'x';
//         deleteBtn.classList.add('deleteBtn');
//         deleteBtn.style.visibility = 'hidden'; // Initially hide delete button

//         // Event listener to show delete button on hover
//         tempCon.addEventListener('mouseenter', () => {
//             deleteBtn.style.visibility = 'visible';
//         });

//         // Event listener to hide delete button on mouse leave
//         tempCon.addEventListener('mouseleave', () => {
//             deleteBtn.style.visibility = 'hidden';
//         });

//         // Event listener to delete element on button click
//         deleteBtn.addEventListener('click', () => {
//             deleteElement(tempCon); // Pass the container div to deleteElement function
//         });

//         //Indexes
//         const tempIndex = document.createElement("p");
//         tempIndex.innerText = i;

//         tempCon.append(tempPlayEl, tempIndex, deleteBtn); // Append delete button to container
//         playAreaEls.append(tempCon);

//         // Creating span element in the code area
//         const tempCodeEl = document.createElement("span");
//         tempCodeEl.id = `codeEl${i + 1}`;
//         tempCodeEl.innerText = "0";
//         codeAreaPara.append(tempCodeEl);

//         // Adding Comma after every span in codeArea and at the end closing square bracket
//         if (i !== inputValue - 1) {
//             const tempComma = document.createElement("span");
//             tempComma.innerText = " , ";
//             codeAreaPara.append(tempComma);
//         } else {
//             const tempBracket = document.createElement("span");
//             tempBracket.innerText = " ]";
//             codeAreaPara.append(tempBracket);
//         }

//         // Making an object of input and span for linking them together and adding the object in the objArr
//         const tempObj = { playEl: tempPlayEl, codeEl: tempCodeEl };
//         objArr.push(tempObj);

//     // Add event listeners for input changes, click events, and drag events
//     addInputListeners(tempObj);
//     addClickListeners(tempObj);
//     tempPlayEl.addEventListener('dragstart', dragStart);
//     tempPlayEl.addEventListener('dragover', dragOver);
//     tempPlayEl.addEventListener('drop', drop);
//     tempPlayEl.addEventListener('dragend', dragEnd);

//         // Create buttons for adding elements before and after each input item
//         const addButtonBefore = document.createElement("button");
//         addButtonBefore.innerText = "Add Before";
//         addButtonBefore.classList.add('btnAddBefore');
//         addButtonBefore.addEventListener('click', () => {
//             addElementBefore(tempCon);
//         });

//         const addButtonAfter = document.createElement("button");
//         addButtonAfter.innerText = "Add After";
//         addButtonAfter.classList.add('btnAddAfter');
//         addButtonAfter.addEventListener('click', () => {
//             addElementAfter(tempCon);
//         });

//         // Add buttons to the container
//         tempCon.appendChild(addButtonBefore);
//         tempCon.appendChild(addButtonAfter);
//     }
// }


// // Function to add a new element before the specified container
// function addElementBefore(container) {
//     const para = document.createElement("p");
//     para.innerText = `New Element Before: `;
//     const input = document.createElement("input");
//     input.type = "text";
//     input.classList.add('inputItems');
//     para.appendChild(input);
//     const codePara = document.createElement("p");
//     codePara.innerText = "0";
//     const index = Array.from(container.parentNode.children).indexOf(container);
//     const newObj = { playEl: input, codeEl: codePara };

//     // Create buttons for adding elements before and after the new input item
//     const addButtonBefore = document.createElement("button");
//     addButtonBefore.innerText = "Add Before";
//     addButtonBefore.classList.add('btnAddBefore');
//     addButtonBefore.addEventListener('click', () => {
//         addElementBefore(para);
//     });

//     const addButtonAfter = document.createElement("button");
//     addButtonAfter.innerText = "Add After";
//     addButtonAfter.classList.add('btnAddAfter');
//     addButtonAfter.addEventListener('click', () => {
//         addElementAfter(para);
//     });

//     // Add buttons to the paragraph
//     para.appendChild(addButtonBefore);
//     para.appendChild(addButtonAfter);

//     container.parentNode.insertBefore(para, container);
//     container.parentNode.insertBefore(codePara, container);

//     objArr.splice(index, 0, newObj); // Insert the new object into objArr at the specified index

//         // Add event listeners for input items
//         addInputListeners(newObj);
//         addClickListeners(newObj);

// }

// // Function to add a new element after the specified container
// function addElementAfter(container) {
//     const para = document.createElement("p");
//     para.innerText = `New Element After: `;
//     const input = document.createElement("input");
//     input.type = "text";
//     input.classList.add('inputItems');
//     para.appendChild(input);
//     const codePara = document.createElement("p");
//     codePara.innerText = "0";
//     const index = Array.from(container.parentNode.children).indexOf(container) + 1;
//     const newObj = { playEl: input, codeEl: codePara };

//     // Create buttons for adding elements before and after the new input item
//     const addButtonBefore = document.createElement("button");
//     addButtonBefore.innerText = "Add Before";
//     addButtonBefore.classList.add('btnAddBefore');
//     addButtonBefore.addEventListener('click', () => {
//         addElementBefore(para);
//     });

//     const addButtonAfter = document.createElement("button");
//     addButtonAfter.innerText = "Add After";
//     addButtonAfter.classList.add('btnAddAfter');
//     addButtonAfter.addEventListener('click', () => {
//         addElementAfter(para);
//     });

//     // Add buttons to the paragraph
//     para.appendChild(addButtonBefore);
//     para.appendChild(addButtonAfter);

//     container.parentNode.insertBefore(para, container.nextSibling);
//     container.parentNode.insertBefore(codePara, container.nextSibling);

//     objArr.splice(index, 0, newObj); // Insert the new object into objArr at the specified index

//     // Add event listeners for input items
//     addInputListeners(newObj);
//     addClickListeners(newObj);
// }
//     // Initialize drag and drop functionality
//     playAreaEls.addEventListener('dragstart', dragStart);
//     playAreaEls.addEventListener('dragover', dragOver);
//     playAreaEls.addEventListener('drop', drop);
//     playAreaEls.addEventListener('dragend', dragEnd);



