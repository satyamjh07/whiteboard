document.addEventListener("DOMContentLoaded", () => {
  const whiteboard = document.getElementById("whiteboard");
  const ctx = whiteboard.getContext("2d");

  whiteboard.width = 1000;
  whiteboard.height = 500;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let selectedShape = "freehand"; // Default to freehand drawing mode

  let shapes = []; // Array to store drawn shapes
  let startX, startY; // Store the starting point for shape drawing

  // Get brush size, color, and shape elements
  const brushSizeInput = document.getElementById("brushSize");
  const brushColorInput = document.getElementById("brushColor");
  const shapeSelect = document.getElementById("shapeSelect");

  whiteboard.addEventListener("mousedown", startDrawing);
  whiteboard.addEventListener("mousemove", draw);
  whiteboard.addEventListener("mouseup", stopDrawing);
  whiteboard.addEventListener("mouseout", handleMouseOut);

  function handleMouseOut(e) {
    // Check if the mouse event target is the whiteboard canvas itself
    if (e.target === whiteboard) {
      stopDrawing(e);
    }
  }

  function startDrawing(e) {
    isDrawing = true;

    const canvasBounds = whiteboard.getBoundingClientRect();
    lastX = e.clientX - canvasBounds.left;
    lastY = e.clientY - canvasBounds.top;

    if (selectedShape === "freehand") {
      // For freehand drawing, start a new path and add the current position
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    } else {
      // For shape drawing, store the starting position
      [startX, startY] = [lastX, lastY];
    }
  }

  function draw(e) {
    if (!isDrawing || e.target !== whiteboard) return;
    const x = e.clientX - whiteboard.getBoundingClientRect().left;
    const y = e.clientY - whiteboard.getBoundingClientRect().top;
    const brushSize = brushSizeInput.value;
    const brushColor = brushColorInput.value;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    if (selectedShape === "freehand") {
      // Freehand drawing
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    } else {
      // For shape drawing, clear the canvas and redraw the shapes array
      redrawShapes();

      // Draw the shape preview dynamically
      if (selectedShape === "line") {
        drawLine(startX, startY, x, y);
      } else if (selectedShape === "triangle") {
        drawTriangle(startX, startY, x, y);
      } else if (selectedShape === "square") {
        drawSquare(startX, startY, x, y);
      } else if (selectedShape === "rectangle") {
        drawRectangle(startX, startY, x, y);
      }
    }
  }

  // Adjust the minimum length for a valid line
  const minLineLength = 5;

  function stopDrawing(e) {
    if (selectedShape !== "freehand") {
      // For shape drawing, add the shape to the shapes array when the user stops drawing
      const x = e.clientX - whiteboard.getBoundingClientRect().left;
      const y = e.clientY - whiteboard.getBoundingClientRect().top;

      shapes.push({
        type: selectedShape,
        startX: lastX,
        startY: lastY,
        endX: x,
        endY: y,
        color: brushColorInput.value,
        size: brushSizeInput.value,
      });

      // Redraw all shapes
      redrawShapes();
    }

    isDrawing = false;
  }

  function redrawShapes() {
    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);

    shapes.forEach((shape) => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.size;

      if (shape.type === "freehand") {
        // Not needed, freehand paths are drawn in real-time.
      } else if (shape.type === "line") {
        drawLine(shape.startX, shape.startY, shape.endX, shape.endY);
      } else if (shape.type === "triangle") {
        drawTriangle(shape.startX, shape.startY, shape.endX, shape.endY);
      } else if (shape.type === "square") {
        drawSquare(shape.startX, shape.startY, shape.endX, shape.endY);
      } else if (shape.type === "rectangle") {
        drawRectangle(shape.startX, shape.startY, shape.endX, shape.endY);
      }
    });
  }
  function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function drawTriangle(x1, y1, x2, y2) {
    // Calculate the third point of the equilateral triangle
    const height = (Math.sqrt(3) / 2) * Math.abs(x2 - x1);
    const x3 = x1 + (x2 - x1) / 2;
    const y3 = y2 > y1 ? y1 + height : y1 - height;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();
  }

  function drawSquare(x1, y1, x2, y2) {
    const size = Math.abs(x2 - x1);
    ctx.strokeRect(x1, y1, size, size);
  }

  function drawRectangle(x1, y1, x2, y2) {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    ctx.strokeRect(x1, y1, width, height);
  }

  shapeSelect.addEventListener("change", () => {
    selectedShape = shapeSelect.value;
    // Clear the canvas to remove previous shape if any
    redrawShapes();
  });

  const clearBtn = document.getElementById("clearBtn");
  clearBtn.addEventListener("click", () => {
    shapes.length = 0; // Clear the shapes array
    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
  });

  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.addEventListener("click", () => {
    const image = whiteboard.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "whiteboard.png";
    link.click();
  });
});
