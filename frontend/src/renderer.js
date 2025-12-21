const canvas = document.getElementById('gridlife-canvas');
const context = canvas.getContext('2d');

const C_OLD_RGB = [139, 69, 19];
const C_DECAYING_HEX = '#8B4512';
const ZOOM_SPEED = 0.15;

export let cellSize = 10;
let targetCellSize = 10;
let coverCellSize = 10;

let xOffset = 0;
let yOffset = 0;
let zoomCenterX = 0;
let zoomCenterY = 0;

export function resizeCanvas(gridWidth, gridHeight) {
  // Calculate cell size to fit grid while maintaining aspect ratio
  const coverScaleX = window.innerWidth / gridWidth;
  const coverScaleY = window.innerHeight / gridHeight;
  coverCellSize = Math.ceil(Math.max(coverScaleX, coverScaleY)); // Use floor for crips pixels

  // Set the canvas drawing buffer size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  cellSize = coverCellSize;
  targetCellSize = cellSize;

  // Calculate offsets to center the grid on the canvas
  const gridRenderWidth = gridWidth * cellSize;
  const gridRenderHeight = gridHeight * cellSize;
  xOffset = Math.floor((canvas.width - gridRenderWidth) / 2);
  yOffset = Math.floor((canvas.height - gridRenderHeight) / 2);
}

export function zoomAt(scale, screenX, screenY) {
  targetCellSize = Math.max(coverCellSize, Math.min(cellSize * scale, 100));
  zoomCenterX = screenX;
  zoomCenterY = screenY;
}

export function updateZoomAnimation() {
  if (Math.abs(cellSize - targetCellSize) < 0.01) {
    cellSize = targetCellSize;
    return;
  }

  const gridX = (zoomCenterX - xOffset) / cellSize;
  const gridY = (zoomCenterY - yOffset) / cellSize;

  cellSize += (targetCellSize - cellSize) * ZOOM_SPEED;

  xOffset = zoomCenterX - gridX * cellSize;
  yOffset = zoomCenterY - gridY * cellSize;
}

function lerpColor(color1, color2, ratio) {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawGrid(grid, maxAge) {
  context.fillStyle = "#1A202C"; // Background color
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const rowCount = grid.length;
  if (rowCount === 0) return;
  const colCount = grid[0].length;

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const cell = grid[r][c];
      const x = xOffset + c * cellSize;
      const y = yOffset + r * cellSize;

      if (x + cellSize < 0 || x > canvas.width || y + cellSize < 0 || y > canvas.height) {
        continue;
      }

      if (cell.state === "ALIVE" || cell.state == "REBORN") {
        const ageRatio = Math.min(cell.age, maxAge) / maxAge;
        const currentColor = lerpColor(cell.color, C_OLD_RGB, ageRatio);
        const blur = 20 * (1 - ageRatio);
       
        context.fillStyle = currentColor;
        context.shadowColor = currentColor;
        context.shadowBlur = blur;

        const size = Math.max(1, cellSize - 1);
        context.fillRect(x, y, size, size);
        context.shadowBlur = 0;
        
      } else if (cell.state === "DECAYING") {
        context.fillStyle = C_DECAYING_HEX;
        const size = Math.max(1, cellSize - 1);
        context.fillRect(x, y, size, size);
      }
    }
  }
}

