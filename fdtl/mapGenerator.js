// Procedural Map Generator
// Maps are represented by a 2D array.
// 0: empty, 1: wall, 2: trap, 3: exit gateway, 4: Lost Soul (Moral choice)

export function generateLevelMap(type, rows, cols) {
  const map = Array.from({ length: rows }, () => Array(cols).fill(1));
  
  if (type === 'sanctuary') {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        map[r][c] = 0;
      }
    }
    return map;
  }
  
  if (type === 'void') {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        // sparse walls scattered randomly
        map[r][c] = Math.random() > 0.98 ? 1 : 0;
      }
    }
    
    // spawn traps
    scatterTiles(map, rows, cols, 2, 100);
    // spawn altars
    scatterTiles(map, rows, cols, 4, 30);
    // spawn narrative terminals
    scatterTiles(map, rows, cols, 5, 10);
    // spawn relic chests
    scatterTiles(map, rows, cols, 6, 2);
    
    // ensure player start area is free
    clearArea(map, 1, 1, 4, 4);
    
    // spawn gateway randomly very far away from top-left
    let placed = false;
    while (!placed) {
      const gR = Math.floor(Math.random() * (rows / 2)) + Math.floor(rows / 2);
      const gC = Math.floor(Math.random() * (cols / 2)) + Math.floor(cols / 2);
      if (map[gR][gC] === 0) {
        map[gR][gC] = 3;
        placed = true;
      }
    }
    return map;
  }
  
  if (type === 'maze') {
    // Drunkard's Walk algorithm for a large, interconnected cave/maze
    let r = 2;
    let c = 2;
    map[r][c] = 0;
    
    // Carve out roughly 45% of the solid rock
    const targetFloor = Math.floor(rows * cols * 0.45);
    let currentFloor = 1;
    
    while (currentFloor < targetFloor) {
      // Random direction
      const dir = Math.floor(Math.random() * 4);
      let nr = r, nc = c;
      if (dir === 0) nr -= 1;
      else if (dir === 1) nr += 1;
      else if (dir === 2) nc -= 1;
      else if (dir === 3) nc += 1;
      
      // Keep a solid border (pad by 1)
      if (nr >= 1 && nr < rows - 1 && nc >= 1 && nc < cols - 1) {
        r = nr;
        c = nc;
        if (map[r][c] === 1) {
          map[r][c] = 0;
          currentFloor++;
        }
      } else {
        // Jump to an existing random floor node to branch out
        const rx = Math.floor(Math.random() * (rows - 2)) + 1;
        const cx = Math.floor(Math.random() * (cols - 2)) + 1;
        if (map[rx][cx] === 0) {
          r = rx;
          c = cx;
        }
      }
    }
    
    clearArea(map, 1, 1, 4, 4); // Ensure safe player start area
    
    // scatter traps
    scatterTiles(map, rows, cols, 2, 80);
    // scatter moral choice altars
    scatterTiles(map, rows, cols, 4, 25);
    // scatter narrative terminals
    scatterTiles(map, rows, cols, 5, 15);
    // scatter relic chests
    scatterTiles(map, rows, cols, 6, 3);
    
    // Place gateway at the most bottom right open tile available
    let placedGateway = false;
    for (let i = rows - 2; i > 0 && !placedGateway; i--) {
      for (let j = cols - 2; j > 0 && !placedGateway; j--) {
        if (map[i][j] === 0) {
          map[i][j] = 3;
          placedGateway = true;
        }
      }
    }
    return map;
  }
}

function scatterTiles(map, rows, cols, tileType, count) {
  let placed = 0;
  while(placed < count) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (map[r][c] === 0) {
      map[r][c] = tileType;
      placed++;
    }
  }
}

function clearArea(map, startR, startC, w, h) {
  for(let r = startR; r < startR + h; r++) {
    for(let c = startC; c < startC + w; c++) {
      if (map[r] && map[r][c] !== undefined) {
        map[r][c] = 0;
      }
    }
  }
}
