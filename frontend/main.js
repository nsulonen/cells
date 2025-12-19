const flask_server = 'http://127.0.0.1:5000/';
const canvas = document.getElementById('gridlife-canvas');
const context = canvas.getContext('2d');

// fetch(flask_server)
//   .then(response => {
//     return response.json();
//   })
//   .then(data => {
//     console.log("Success! Data from server:", data);
//   })
//   .catch(error => {
//     console.error("Error fetching data:", error);
//   });

let currentGrid = [];
let previousGrid = [];

function drawGrid(current, previous) {
  const rowCount = current.length;
  if (rowCount === 0) return;

  const colCount = current[0].length;
  const cellSize = canvas.width / colCount;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {

      const currentState = current[r][c];
      const previousState = (previous.length > 0) ? previous[r][c] : 0;

      // CELL STATE
      if (previousState == 0 && currentState == 1) { // BORN
        fadingCells.push({
          r: r,
          c: c,
          startTime: Date.now()
        });
        
      } else if (previousState == 1 && currentState == 1) { // STABLE
        context.fillStyle = '#00ff00';
        context.shadowColor = '#00ff00';
        context.shadowBlur = 15;
        context.fillRect(
          c * cellSize,
          r * cellSize,
          cellSize,
          cellSize
        );
        context.shadowBlur = 0;
        
      } else if (previousState == 1 && currentState == 0) { // DIED
        fadingOutCells.push({
          r: r,
          c: c,
          startTime: Date.now()
        });
      }   
    }
  }
}

function update() {
  fetch(flask_server)
    .then(response => response.json())
    .then(gridData => {
      previousGrid = currentGrid;
      currentGrid = gridData;
    });
}

const FADE_DURATION = 500;
let fadingCells = [];
let fadingOutCells = [];

function render() {
  const colCount = currentGrid.length > 0 ? currentGrid[0].length : 0;
  if (colCount === 0) {
    requestAnimationFrame(render);
    return;
  };
  const cellSize = canvas.width / colCount;

  drawGrid(currentGrid, previousGrid);

  const now = Date.now();

  fadingCells.forEach(cell => {
    const elapsedTime = now - cell.startTime;
    const opacity = Math.min(1, elapsedTime / FADE_DURATION);

    context.fillStyle = `rgba(0, 255, 0, ${opacity})`;
    context.fillRect(
      cell.c * cellSize,
      cell.r * cellSize,
      cellSize,
      cellSize
    );
  });

  fadingOutCells.forEach(cell => {
    const elapsedTime = now - cell.startTime;
    const opacity = 1 - (Math.min(1, elapsedTime / FADE_DURATION));

    context.fillStyle = `rgba(0, 255, 0, ${opacity})`;
    context.fillRect(
      cell.c * cellSize,
      cell.r * cellSize,
      cellSize,
      cellSize
    );
  });

  fadingCells = fadingCells.filter(cell => {
    return (now - cell.startTime) < FADE_DURATION;
  });

  fadingOutCells = fadingOutCells.filter(cell => {
    return (now - cell.startTime) < FADE_DURATION;
  });
  
  requestAnimationFrame(render);
}

setInterval(update, 100);
render();
