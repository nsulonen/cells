class Cell {
  constructor(isAlive, generation) {
    this.isAlive = isAlive;
    this.generation = generation;
    this.age = 0;
  }

  incrementAge() {
    this.age += 1;
  }
}

const flask_server = 'http://127.0.0.1:5000/';
const canvas = document.getElementById('gridlife-canvas');
const context = canvas.getContext('2d');

const FADE_DURATION = 500;
const C_YOUNG_RGB = [106, 103, 78];
const C_OLD_RGB = [139, 69, 19];
const C_DECAYING_HEX = '#8B4512';

let MAX_AGE = 0;
let isInitialized = false;
let currentGrid = [];
let previousGrid = [];

function drawGrid() {
  const rowCount = currentGrid.length;
  if (rowCount === 0) return;
  const colCount = currentGrid[0].length;
  const cellSize = canvas.width / colCount;

  context.clearRect(0, 0, canvas.width, canvas.height);

  let maxAgeFound = 0;
  
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const cell = currentGrid[r][c];

      if (cell.state === "ALIVE") {
        maxAgeFound = Math.max(maxAgeFound, cell.age);
        
        const ageRatio = Math.min(cell.age, MAX_AGE) / MAX_AGE;
        const currentColor = lerpColor(C_YOUNG_RGB, C_OLD_RGB, ageRatio);
        const blur = 10 * (1 - ageRatio);
       
        context.fillStyle = currentColor;
        context.shadowColor = currentColor;
        context.shadowBlur = blur;
        context.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        context.shadowBlur = 0;
        
      } else if (cell.state === "DECAYING") {
        context.fillStyle = C_DECAYING_HEX;
        context.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
  console.log(`Max age on grid this frame: ${maxAgeFound}`);
}

function lerpColor(color1, color2, ratio) {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

function fillGrid(width, height) {
  const grid = []
  for (let r = 0; r < height; r++) {
    const row = []
    for (let c = 0; c < width; c++) {
      row.push(new Cell(false, 0));
    }
    grid.push(row);
  }
  return grid;
}

function update() {
  fetch(flask_server)
    .then(response => response.json())
    .then(data => {
      if (!isInitialized) {
        console.log("Initializing grid with dimensions:", data.width, data.height);

        currentGrid = fillGrid(data.width, data.height);
        previousGrid = fillGrid(data.width, data.height);
        MAX_AGE = data.max_age;

        isInitialized = true;
      }
      previousGrid = JSON.parse(JSON.stringify(currentGrid));

      for (let r = 0; r < data.height; r++) {
        for (let c = 0; c < data.width; c++) {
          const serverState = data.grid[r][c];
          const clientCell = currentGrid[r][c];

          const wasAlive = clientCell.isAlive;
          const isNowAlive = (serverState === "ALIVE");

          clientCell.isAlive = isNowAlive;
          clientCell.state = serverState;

          if (isNowAlive && wasAlive) {
            clientCell.incrementAge();
          }
          else if (isNowAlive && !wasAlive) {
            clientCell.age = 0;
          }
          else if (!isNowAlive && wasAlive) {
            clientCell.age = 0;
          }
        }
      }
    });
}

function render() {
  drawGrid();
  requestAnimationFrame(render);
}

setInterval(update, 100);
render();
