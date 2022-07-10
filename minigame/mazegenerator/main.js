const GAME_LENGTH = 60; // seconds


class Maze {
  static _matrix(width, height) {
    const cols = Array.from({
      length: width });

    return cols.map(() => Array.from({
      length: height }).
    map(Maze.cell));
  }

  static cell() {
    return { walls: Maze.cellWall() };
  }

  static cellWall() {
    return { top: 1, left: 1, bottom: 1, right: 1 };
  }

  static get neighbourPosition() {
    return {
      top: 'bottom',
      left: 'right',
      bottom: 'top',
      right: 'left' };

  }

  static applyPositionAndNeighbours(matrix) {
    matrix.forEach((row, y) => {
      row.forEach((node, x) => {
        node.id = `${x}-${y}`;
        node.position = { x, y };
        node.neighbours = {
          top: matrix[y - 1] ? matrix[y - 1][x] : null,
          bottom: matrix[y + 1] ? matrix[y + 1][x] : null,
          left: row[x - 1] || null,
          right: row[x + 1] || null,
          unvisitedPositions() {
            return [
            'top', 'left',
            'bottom', 'right'].
            filter(p => this[p] && !this[p].visited);
          } };

      });
    });
    return matrix;
  }

  static shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  static make(width, height) {
    // Depth-first search / Recursive backtracker
    // Consider the space for a maze being a large grid of cells
    // (like a large chess board), each cell starting with four walls.
    const Z = Maze.applyPositionAndNeighbours(Maze._matrix(width, height));
    const backtrack = [];
    // Make the initial cell the current cell and mark it as visited
    const [x, y] = [width, height].map(num => Math.floor(Math.random() * num));
    let cell = Z[x][y];
    cell.start = true;
    cell.visited = true;
    cell.order = 1;
    let totalVisited = 1;
    const totalCells = width * height;
    // While there are unvisited cells
    while (totalCells > totalVisited) {
      // If the current cell has any neighbours which have not been visited
      const unvisited = cell.neighbours.unvisitedPositions();
      if (unvisited.length) {
        // Choose randomly one of the unvisited neighbours
        const position = unvisited[Math.floor(Math.random() * unvisited.length)];
        const neighbour = cell.neighbours[position];
        // Push the current cell to the stack
        backtrack.push(cell);
        // Remove the wall between the current cell and the chosen cell
        cell.walls[position] = 0;
        neighbour.walls[Maze.neighbourPosition[position]] = 0;
        // Make the chosen cell the current cell and mark it as visited
        cell = neighbour;
        cell.visited = true;
        cell.order = ++totalVisited;
      } else {
        // Pop a cell from the stack & Make it the current cell
        cell = backtrack.pop();
      }
    }
    return Z;
  }

  static create(element) {
    const maze = Maze.make(10, 10);
    const m = element;
    const wall = 10;
    const cell = 50;
    const makeRect = (x, y, w, h, cls) => `<rect class="${cls || 'wall'}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    m.innerHTML = '';
    maze.forEach((row, y) => {
      row.forEach((item, x) => {
        const sx = x * cell;
        const sy = y * cell;
        const { top, left, bottom, right } = item.walls;
        let markup = '';
        markup += `<g id="${item.id}">`;
        markup += makeRect(sx, sy, cell, cell, `node ${item.start ? 'start' : 'path'}`);
        if (top) markup += makeRect(sx, sy - wall, cell, wall);
        if (right) markup += makeRect(sx + cell, sy, wall, cell);
        if (bottom) markup += makeRect(sx, sy + cell - wall, cell, wall);
        if (left) markup += makeRect(sx - wall, sy - wall, wall, cell + wall);

        markup += '</g>';
        m.innerHTML += markup;
      });
    });
    m.innerHTML += '<line class="line" x1="20", y1="20", x2="30", y2="20" style="stroke:rgb(255,0,0);stroke-width:2"/>';
    m.innerHTML += '<circle class="player" cx="0" cy="0" r="8" fill="#03A9F4" stroke="#CFD8DC" stroke-width="2" style="transform: translate(20px, 20px)"/>';
  }}

const util = {
  getSegmentsFromRect: rect => {
    const b = {
      x: +rect.getAttribute('x'),
      y: +rect.getAttribute('y'),
      width: +rect.getAttribute('width'),
      height: +rect.getAttribute('height') };


    return [
    [[b.x, b.y], [b.width + b.x, b.y]],
    [[b.width + b.x, b.y], [b.width + b.x, b.height + b.y]],
    [[b.width + b.x, b.height + b.y], [b.x, b.height + b.y]],
    [[b.x, b.height + b.y], [b.x, b.y]]];

  },
  pointInPolygon: (point, vs) => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const [xi, yi, xj, yj] = [vs[i][0], vs[i][1], vs[j][0], vs[j][1]];
      const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  },
  doLinesIntersect: ([a, b], [c, d]) => {
    const s1 = [b[0] - a[0], b[1] - a[1]];
    const s2 = [d[0] - c[0], d[1] - c[1]];
    const s = (-s1[1] * (a[0] - c[0]) + s1[0] * (a[1] - c[1])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
    const t = (s2[0] * (a[1] - c[1]) - s2[1] * (a[0] - c[0])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  },
  getPointOfIntersection: ([[saX, saY], [eaX, eaY]], [[sbX, sbY], [ebX, ebY]]) => {
    // if the lines intersect, the result contains the x and y of the intersection
    // (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2
    // contain the point
    let a;
    let b;
    const denominator = (ebY - sbY) * (eaX - saX) - (ebX - sbX) * (eaY - saY);
    if (denominator === 0) return null;
    a = saY - sbY;
    b = saX - sbX;
    const numerator1 = (ebX - sbX) * a - (ebY - sbY) * b;
    const numerator2 = (eaX - saX) * a - (eaY - saY) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;
    // if we cast these lines infinitely in both directions, they intersect here:
    return [
    saX + a * (eaX - saX),
    saY + a * (eaY - saY)];

  },
  distanceBetweenPoints: (a, b) => Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2),
  getClosestIntersectionPoint: (line, walls) => {
    const intersections = walls.reduce((list, wall) => {
      list.push(...wall.reduce((i, segment) => {
        if (util.doLinesIntersect(line, segment)) {
          i.push(util.getPointOfIntersection(line, segment));
        }
        return i;
      }, []));
      return list;
    }, []);

    const closest = intersections.map(i => ({
      point: i.map(c => c - 0),
      distance: util.distanceBetweenPoints(i, line[0]) })).
    sort((a, b) => a.distance - b.distance);
    return closest[0] ? closest[0].point : null;
  } };

class MazeGame {
  constructor() {
    this.scoreboard = document.querySelector('.scoreboard');
    this.maze = document.querySelector('.maze');
    this.timer = document.querySelector('.timer');
    this.score = {
      won: 0,
      lost: 0,
      moves: 0,
      best: Infinity };

    this._then = performance.now();

    this.maze.addEventListener('click', event => this.clickHandler(event), false);
    this.maze.addEventListener('mousemove', event => this.mouseMoveHandler(event), false);
    this.restartTimer = this.getTimer();
    this.newGame();
  }

  getTimer() {
    let duration = GAME_LENGTH;
    let interval;
    const fn = () => {
      const d = --duration > 9 ? duration : `0${duration}`;
      this.timer.innerHTML = `[ 0:${d} ]`;
      if (duration === 0) {
        clearInterval(interval);
        this.newGame(false);
      }
    };
    interval = setInterval(fn, 1000);
    return () => {
      duration = GAME_LENGTH;
      clearInterval(interval);
      interval = setInterval(fn, 1000);
    };
  }

  newGame(won) {
    // Set new moves to zero
    this.score.moves = 0;
    // restart the game timer and update the scoreboard
    this.restartTimer();
    this.updateScoreBoard();

    // If previous game was won, up the score
    // Note directly checking the boolean because in first game, 'won' is undefined
    if (won === true) this.score.won++;else
    if (won === false) this.score.lost++;

    let timeout = 0;
    if (won !== undefined) {
      // Style game board green for a win or red for a loss
      setTimeout(() => this.pathElms.forEach(el => {
        el.style.setProperty('fill', won ? '#388E3C' : '#FF5252');
      }), 400);
      timeout = 2000;
    }

    // Update the maze to a different maze, use a timeout if it's not the first game to allow
    // for the win/lose animation
    setTimeout(() => this.updateMaze(), timeout);
  }

  updateMaze() {
    // Create new maze
    Maze.create(this.maze);

    // Get player
    this.player = this.maze.querySelector('.player');
    this.line = this.maze.querySelector('.line');


    // Get polygon data from Goal
    this.goalElem = this.maze.querySelector('.start');
    this.goal = util.getSegmentsFromRect(this.goalElem).map(s => s[0]);

    // Game map data
    this.pathElms = Array.from(this.maze.querySelectorAll('.path'));
    this.wallElms = Array.from(this.maze.querySelectorAll('.wall'));
    this.walls = this.wallElms.map(util.getSegmentsFromRect);
  }

  setPlayerPosition(xy) {
    this.player.xy = xy;
    this.player.style.setProperty('transform', `translate(${xy[0]}px, ${xy[1]}px)`);
    return this.player.xy;
  }

  getPlayerPosition() {
    return this.player.xy || this.setPlayerPosition([20, 20]);
  }

  setLinePosition(line) {
    this.line.setAttribute('x1', line[0][0]);
    this.line.setAttribute('y1', line[0][1]);
    this.line.setAttribute('x2', line[1][0]);
    this.line.setAttribute('y2', line[1][1]);
  }

  updateScoreBoard() {
    const { won, lost, moves, best } = this.score;
    this.scoreboard.innerHTML = `won: ${won} | lost: ${lost} | moves: ${moves} | best: ${best === Infinity ? '??' : best}`;
  }

  clickHandler(clickEvent) {
    if (this.blocked) return; // Respect the blocked flag
    this.score.moves++;
    // Get local point in maze of the click
    const localPoint = this.getLocalPoint(event);
    // Find the closest intersection
    const closestIntersection = util.getClosestIntersectionPoint([
    this.getPlayerPosition(),
    localPoint],
    this.walls);
    // If there is no interstection, move player to the clicked point
    if (!closestIntersection) this.setPlayerPosition(localPoint);
    // If there is in intersection, do a little error animation
    else {
        this.blocked = true;
        const translate = `translate(${this.player.xy[0]}px, ${this.player.xy[1]}px)`;
        this.player.style.setProperty('transform', `${translate} scale(1.5)`);
        this.player.style.setProperty('fill', '#f00');
        setTimeout(() => {
          this.player.style.setProperty('transform', translate);
          this.player.style.setProperty('fill', '#03A9F4');
          this.blocked = false;
        }, 600);
      }

    // If player has reached goal..
    if (util.pointInPolygon(this.player.xy, this.goal)) {
      // Check if this was players best game and update scoreboard if it was
      if (this.score.moves < this.score.best) this.score.best = this.score.moves;
      // Start a new game
      this.newGame(true);
    }

    // Update scoreboard
    this.updateScoreBoard();
  }

  getLocalPoint(event) {
    const { top, left } = this.maze.getBoundingClientRect();
    return [event.clientX - left - 10, event.clientY - top - 10];
  }

  mouseMoveHandler(event) {
    return requestAnimationFrame(() => {
      if (performance.now() - this._then > 0) {
        this._then = performance.now();
        // Get cursor position
        const localPoint = this.getLocalPoint(event);

        // Get the wall intersection between the player & the cursor this is closest to the player
        const closestIntersection = util.getClosestIntersectionPoint([
        this.getPlayerPosition(),
        localPoint],
        this.walls);

        // Update line of sight
        const line = [this.getPlayerPosition(), closestIntersection || localPoint];
        this.setLinePosition(line);
      }
    });
  }}


new MazeGame();