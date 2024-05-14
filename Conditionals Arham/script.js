let branch;
async function runExecution() {
    const code = document.getElementById('codeInput').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/execute_code', {
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
        console.log(executionResults);
        visualizeResponse(executionResults);
    } catch (error) {
        console.error('Error:', error);
    }
}
function visualizeResponse(responseData) {
    const svg = d3.select("svg");

    // Define the length of the main path
    const lineLength = 300; // Adjust as needed

    // Calculate the end points of the original line
    const originalLineEndX = 450; // Adjust as needed
    const originalLineEndY = 200; // Adjust as needed

    // Calculate the angles and branch end points
    const numResponses = responseData.length;
    let angles = [];
    if (numResponses === 2) {
        angles = [45, -45];
    } else if (numResponses === 3) {
        angles = [45, 0, -45];
    } else if (numResponses === 4) {
        angles = [60, 30, -30, -60];
    } else if (numResponses === 5) {
        angles = [60, 30, 0, -30, -60];
    } else if (numResponses === 6) {
        angles = [75, 50, 25, -25, -50, -75];
    } else if (numResponses === 7) {
        angles = [75, 50, 25, 0, -25, -50, -75];
    } else {
        const angleIncrement = 60; // Angle increment for each additional response
        for (let i = 0; i < numResponses; i++) {
            angles.push(angleIncrement * (i - Math.floor(numResponses / 2)));
        }
    }

    // Draw main path
    const mainPath = svg.append("line")
        .attr("x1", 100) // Starting x-coordinate
        .attr("y1", 200) // Starting y-coordinate
        .attr("x2", originalLineEndX) // Ending x-coordinate
        .attr("y2", originalLineEndY) // Ending y-coordinate
        .style("stroke", "white")
        .style("stroke-width", 25);

    // Transition to fill main path with green color
    mainPath.transition()
        .delay(1000)
        .duration(1000)
        .style("stroke", "green");

    // Transition through each response
    for (let i = 0; i < numResponses; i++) {
        // Add delay for each response
        const delay = 2000 + i * 2000;

        // Draw branch for the response
        const branch = svg.append("line")
            .attr("x1", originalLineEndX) // Starting x-coordinate (end of original line)
            .attr("y1", originalLineEndY) // Starting y-coordinate (end of original line)
            .attr("x2", originalLineEndX + Math.cos(angles[i] * Math.PI / 180) * lineLength) // Ending x-coordinate
            .attr("y2", originalLineEndY - Math.sin(angles[i] * Math.PI / 180) * lineLength) // Ending y-coordinate
            .style("stroke", "white")
            .style("stroke-width", 25);

        // Transition to blink yellow and color based on execution
        branch.transition()
            .delay(delay)
            .duration(1000)
            .style("stroke", "yellow")
            .transition()
            .duration(1000)
            .style("stroke", responseData[i].executed === "Yes" ? "green" : "red");

        // Transition to color the rest of the branches
        svg.selectAll(".branch")
            .transition()
            .delay(delay)
            .duration(1000)
            .style("stroke", (d, j) => j === i ? (responseData[i].executed === "Yes" ? "green" : "red") : "red");
    }
}