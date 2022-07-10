const lerp = (norm, min, max) => {
    return (max - min) * norm + min;
  }
  
  const norm = (value, min, max) => {
    return (value - min) / (max - min);
  }
  
  const map = (value, sourceMin, sourceMax, destMin, destMax) => {
    return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  }
  
  const TileTypes = Object.freeze({
    "upleft": 1,
    "upright": 2,
    "downleft": 3,
    "downright": 4,
    "horizontal": 5,
    "vertical": 6,
    "shadow": 7,
    "blocker": 9
  });
  
  const Directions = Object.freeze({
    "up": 1,
    "right": 2,
    "down": 3,
    "left": 4
  });
  
  class Line {
    constructor(startPos, endPos) {
      this.startPos = startPos;
      this.endPos = endPos;
    }
    
    isIntersecting(line) {
      let det = (this.endPos.x - this.startPos.x) * (line.endPos.y - line.startPos.y) - (line.endPos.x - line.startPos.x) * (this.endPos.y - this.startPos.y),
          gamma, lambda;
      
      if (det === 0) {
        return false;
      } else {
        lambda = ((line.endPos.y - line.startPos.y) * (line.endPos.x - this.startPos.x) + (line.startPos.x - line.endPos.x) * (line.endPos.y - this.startPos.y)) / det;
        gamma = ((this.startPos.y - this.endPos.y) * (line.endPos.x - this.startPos.x) + (this.endPos.x - this.startPos.x) * (line.endPos.y - this.startPos.y)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
      }
    }
  }
  
  class PathPos {
    constructor(x, y, trail) {
      this.x = x;
      this.y = y;
      this.trail = [...trail];
      this.finishFound = false;
      this.tileType = "";
    }
    
    getAdjacent(l, prev) {
      let directions = [
        { x: 0, y: -1, dir: 'up' },
        { x: 0, y: 1, dir: 'down' },
        { x: -1, y: 0, dir: 'left' },
        { x: 1, y: 0, dir: 'right' }
      ], 
      adjPathPositions = [];
      
      if(Math.random() >= 0.5) {
        directions = directions.reverse();
      }
      
      for (var i = 0; i < directions.length; i++) {
        let dir = directions[i],
            newpos = { x: this.x + dir.x, y: this.y + dir.y },
            posKey = newpos.x + 'x' + newpos.y;
        
        if(newpos.x >= 0 && newpos.y >= 0 && newpos.x < 8 && newpos.y < 8) {
          if(l.level[newpos.y][newpos.x] !== 9 && !prev.includes(posKey)) {
            this.trail.push(this);
            prev.push(posKey);
            
            let newPathPos = new PathPos(newpos.x, newpos.y, this.trail);
            
            if(newpos.x === l.end.x && newpos.y === l.end.y) {
              newPathPos.finishFound = true;
            }
            
            adjPathPositions.push(newPathPos);
          }
        }
      };
      
      return adjPathPositions;
    }
  }
  
  const levelFactory = {
    newLevel: (difficulty, debug) => {
      let l = null, 
        path = [],
        minLength = 9; //difficulty > 50 ? 8 : 6;
      
      while(path.length < minLength) {
        l = levelFactory.generateLevel(difficulty);
        path = levelFactory.findPath(l);
      }
      
      levelFactory.addTrailToMap(l.level, path, l.end);
  
      for(let i = 0; i < l.level.length; i++) {
        for(let j = 0; j < l.level[i].length; j++) {
          if(l.level[i][j] === 0) {
            l.level[i][j] = levelFactory.randomNumber(1, 6);
          }
        }
      }
  
      // Remove frame
      for (let i = 0; i <= 7; i++) {
        if(l.level[i][0] === 9) {
          l.level[i][0] = 0;
        }
  
        if(l.level[0][i] === 9) {
          l.level[0][i] = 0;
        }
  
        if(l.level[i][7] === 9) {
          l.level[i][7] = 0;
        }
  
        if(l.level[7][i] === 9) {
          l.level[7][i] = 0;
        }
      }
      
      if(debug) {
        levelFactory.drawLevel(l, path);
      }
      
      return l;
    },
    drawLevel: (l, path) => {
      let c = document.getElementById("canvas");
      let ctx = c.getContext("2d");
      let colors = {
        "c1": "coral",
        "c2": "green",
        "c3": "aqua",
        "c4": "sienna",
        "c5": "maroon",
        "c6": "ivory",
        "c9": "pink" // blocker
      }
  
      ctx.clearRect(0, 0, c.width, c.height);
  
      for(let i = 0; i < l.level.length; i++) {
        for(let j = 0; j < l.level[i].length; j++) {
          let tileType = l.level[i][j];
  
          if(tileType !== 0) {
            levelFactory.drawSquare(ctx, j, i, colors['c' + tileType]);
          }
        }
      }
      
      /*for(let i = 0; i < path.length; i++) {
        levelFactory.drawSquare(ctx, path[i].x, path[i].y, 'rgba(0,255,0,0.1)');
      };*/
    },
    generateLevel: difficulty => {
      const l = {
          level: [
              [9, 9, 9, 9, 9, 9, 9, 9],
              [9, 0, 0, 0, 0, 0, 0, 9],
              [9, 0, 0, 0, 0, 0, 0, 9],
              [9, 0, 0, 0, 0, 0, 0, 9],
              [9, 0, 0, 0, 0, 0, 0, 9],
              [9, 0, 0, 0, 0, 0, 0, 9],
              [9, 0, 0, 0, 0, 0, 0, 9],
              [9, 9, 9, 9, 9, 9, 9, 9],
          ],
          start: Math.random() >= 0.5 ? { x: levelFactory.randomNumber(1, 6), y: 0 } : { x: 0, y: levelFactory.randomNumber(1, 6) },
          end: Math.random() >= 0.5 ? { x: levelFactory.randomNumber(1, 6), y: 7 } : { x: 7, y: levelFactory.randomNumber(1, 6) },
          spare: levelFactory.randomNumber(1, 6)
        };
      
      let minBlockers = Math.floor(levelFactory.randomNumber(1, 100) / 10); // difficulty / 10
      
      l.level[l.start.y][l.start.x] = (l.start.x == 0) ? 6 : 5;
      l.level[l.end.y][l.end.x] = (l.end.x == 7) ? 6 : 5;  
  
      // Add blockers
      for (let i = 0; i < levelFactory.randomNumber(minBlockers, 10); i++) {
        let x = levelFactory.randomNumber(1, 6),
            y = levelFactory.randomNumber(1, 6);
        l.level[y][x] = 9;
  
        if(Math.random() > 0.5) {
          l.level[y][x + 1] = 9;
        }
  
        if(Math.random() > 0.5) {
          l.level[y + 1][x] = 9;
        }
      }
  
      return l;
    }, 
    randomNumber: (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    findPath: l => {
      let pos = new PathPos(l.start.x, l.start.y, []),
          prev = [];
  
      let t = levelFactory.recursiveAdjacentPositions([pos], l, prev);
      
      return t;
    },
    addTrailToMap: (level, path, endPos) => {
      let dir = "";
      
      for(let i = 0; i < path.length; i++) {
        let trailTile = path[i],
            nextPos = {};
  
        if(path[i + 1]) {
          nextPos = {
            x: path[i + 1].x,
            y: path[i + 1].y
          }
        } else {
          nextPos = endPos;
        }
        
        let change = levelFactory.getNextTilePosition(trailTile, nextPos);
        
        if(trailTile.y === 0) {
          level[trailTile.y][trailTile.x] = 6; // vertical
          dir = 'down';
        } else if(trailTile.x === 0) {
          level[trailTile.y][trailTile.x] = 5; // horizontal
          dir = 'right';
        }
        
        if(change) {
          if(dir === 'down') {
            if(change === 'left') {
              level[trailTile.y][trailTile.x] = 3;
              dir = 'left';
            } else if (change === 'right') {
              level[trailTile.y][trailTile.x] = 4;
              dir = 'right';
            } else {
              level[trailTile.y][trailTile.x] = 5;
            }
          } else if(dir === 'up') {
            if(change === 'left') {
              level[trailTile.y][trailTile.x] = 1;
              dir = 'left';
            } else if (change === 'right') {
              level[trailTile.y][trailTile.x] = 2;
              dir = 'right';
            } else {
              level[trailTile.y][trailTile.x] = 5;
            }
          } else if(dir === 'right') {
            if(change === 'up') {
              level[trailTile.y][trailTile.x] = 3;
              dir = 'up';
            } else if (change === 'down') {
              level[trailTile.y][trailTile.x] = 1;
              dir = 'down';
            } else {
              level[trailTile.y][trailTile.x] = 6;
            }
          } else if(dir === 'left') {
            if(change === 'up') {
              level[trailTile.y][trailTile.x] = 4;
              dir = 'up';
            } else if (change === 'down') {
              level[trailTile.y][trailTile.x] = 2;
              dir = 'down';
            } else {
              level[trailTile.y][trailTile.x] = 6;
            }
          }
        }
      }
    },
    getNextTilePosition: (trailTile, nextPos) => {
      if(!nextPos) return;
      
      let change = {
        x: nextPos.x - trailTile.x,
        y: nextPos.y - trailTile.y
      }
      
      if(change.x === -1)
        return 'left';
      if(change.x === 1)
        return 'right';
      if(change.y === -1)
        return 'up';
      if(change.y === 1)
        return 'down';
    },
    recursiveAdjacentPositions: (positions, l, prev) => {
      let manyPos = [];
  
      for (let i = 0; i < positions.length; i++) {
        let pos = positions[i],
            adjacentPositions = pos.getAdjacent(l, prev);
  
        manyPos = manyPos.concat(adjacentPositions);
  
        for (let j = 0; j < adjacentPositions.length; j++) {
          let p = adjacentPositions[j];
  
          if(p.finishFound) {
            return p.trail;
          }
        }
      }
  
      if(manyPos.length) {
        let res = levelFactory.recursiveAdjacentPositions(manyPos, l, prev);
  
        if(res.length)
          return res;
      }
  
      return [];
    },
    drawSquare: (ctx, x, y, color) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.rect(40 * x, 40 * y, 40, 40);
      ctx.fill();
    }
  }
  
  const puzzleSpritesFactory = quality => { 
    class Rectangle {
      constructor(center, radius, rotation) {
        this.radius = radius;
        this.center = center;
        this.rotation = rotation;
        this.rotate(rotation);
      }
      
      rotate(r) {
        this.rotation = r;
        
        this.p1 = this.getPoint(this.center, r + 30, this.radius);
        this.p2 = this.getPoint(this.center, r + 150, this.radius);
        this.p3 = this.getPoint(this.center, r + 210, this.radius);
        this.p4 = this.getPoint(this.center, r + 330, this.radius);
      }
      
      translate(distance) {
        let r = new Rectangle(this.center, this.radius, this.rotation);
        
        r.p1.y += distance;
        r.p2.y += distance;
        r.p3.y += distance;
        r.p4.y += distance;
        
        return r;
      }
  
      localTranslate(distance) {
        this.p1.y += distance;
        this.p2.y += distance;
        this.p3.y += distance;
        this.p4.y += distance;
        
        return this;
      }
      
      push(distance) {
        var newCenter = this.getPoint(this.center, this.rotation, distance);
        return new Rectangle(newCenter, this.radius, this.rotation);
      }
      
      intersect(rectangle, inverted) {
        let r = new Rectangle(this.center, this.radius, this.rotation);
        
        if(inverted) {
          r.p1 = { x: this.p1.x, y: this.p1.y };
          r.p2 = { x: rectangle.p2.x, y: rectangle.p2.y };
          r.p3 = { x: rectangle.p3.x, y: rectangle.p3.y };
          r.p4 = { x: this.p4.x, y: this.p4.y };
        } else {
          r.p1 = { x: rectangle.p1.x, y: rectangle.p1.y };
          r.p2 = { x: this.p2.x, y: this.p2.y };
          r.p3 = { x: this.p3.x, y: this.p3.y };
          r.p4 = { x: rectangle.p4.x, y: rectangle.p4.y };
        }
        
        return r;
      }
      
      connect(ctx, colors, rectangle, drawHiddenSides) {
        let drawOrder,
            sides = {
              1: {
                p1: this.p1,
                p2: rectangle.p1,
                p3: rectangle.p4,
                p4: this.p4
              },
              2: {
                p1: this.p2,
                p2: rectangle.p2,
                p3: rectangle.p1,
                p4: this.p1
              },
              3: {
                p1: this.p2,
                p2: rectangle.p2,
                p3: rectangle.p3,
                p4: this.p3
              },
              4: {
                p1: this.p3,
                p2: rectangle.p3,
                p3: rectangle.p4,
                p4: this.p4
              }
            }
        
        if(this.rotation <= 90) {
          drawOrder = [4, 3, 2, 1];
        } else if (this.rotation <= 180) {
          drawOrder = [2, 3, 1, 4];
        } else if (this.rotation <= 270) {
          drawOrder = [2, 1, 3, 4];
        } else if (this.rotation <= 360) {
          drawOrder = [4, 1, 3, 2];
        }
        
        for (let i = (drawHiddenSides ? 1 : 3); i <= 4; i++) {
          this.drawSide(ctx, sides[drawOrder[i - 1]], colors['side' + drawOrder[i - 1]]);
        }
      }
      
      drawSide(ctx, side, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(side.p1.x, side.p1.y);
        ctx.lineTo(side.p2.x, side.p2.y);
        ctx.lineTo(side.p3.x, side.p3.y);
        ctx.lineTo(side.p4.x, side.p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      getPoint(center, rotation, radius) {
        let radian = (rotation / 180) * Math.PI;
    
        return {
          x: center.x + radius * Math.cos(radian),
          y: center.y + Math.floor(radius / 1.6) * Math.sin(radian) // 1.3
        };
      }
      
      draw(ctx, color) {
        this.drawSide(ctx, this, color);
        return this;
      }
    }
  
    const drawSlice = (ctx, b, startSlant, colors, rotation, translate, height, slant) => {
      let g2 = b.push(0),
          g1 = b.push(startSlant),
          ground = g1.intersect(g2, true),
          ground2 = g1.intersect(g2, true),
          base = ground.localTranslate(translate),
          top = ground2.localTranslate(translate - height),
          topPushed = ground.push(slant).translate(translate - height),
          t = top.intersect(topPushed);
      
      base.connect(ctx, colors, t, slant !== 0);
      
      return t;
    }
    
    const getCanvas = (width, height) => {
      let c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      return c;
    }
    
    const getCreateSpritePromise = (rotation, colors, isLocomotive) => {
      offscreen = getCanvas(600, 600),
      ctx = offscreen.getContext('2d'),
      ground = new Rectangle({x: 300, y: 420}, 210, rotation),
      base = new Rectangle({x: 300, y: 420}, 220, rotation);
      
      if(!isLocomotive) {
        ground.connect(ctx, colors.baseColors, base.translate(-40), false);
        base.translate(-40).connect(ctx, colors.baseColors, base.translate(-50), false);
        base.translate(-50).connect(ctx, colors.colorLine, base.translate(-70), false);
        base.translate(-70).connect(ctx, colors.baseColors, base.translate(-90), false);
        base.translate(-90).connect(ctx, colors.windowColors, base.translate(-160), false);
        base.translate(-160).connect(ctx, colors.baseColors, base.translate(-200).draw(ctx, '#fff'), false);
      } else {
        ground.connect(ctx, colors.baseColors, base.translate(-40), false);
        base.translate(-40).connect(ctx, colors.baseColors, base.translate(-50), false);
        
        drawSlice(ctx, base, 0, colors.colorLine2, rotation, -50, 20, -10),
        drawSlice(ctx, base, -10, colors.baseColors, rotation, -70, 20, -20),
        drawSlice(ctx, base, -30, colors.windowColors, rotation, -90, 70, -70);
        drawSlice(ctx, base, -100, colors.baseColors2, rotation, -160, 20, -70);
        drawSlice(ctx, base, -170, colors.baseColors3, rotation, -180, 20, -100).draw(ctx, '#FFF');
      }
  
      return createImageBitmap(offscreen);
    }
    
    let colors = {
      baseColors: { side1: '#d9dbdb', side2: '#fff', side3: '#d9dbdb', side4: '#fff' },
      baseColors2: { side1: '#e2e2e2', side2: '#fff', side3: '#d9dbdb', side4: '#fff' },
      baseColors3: { side1: '#f7f7f7', side2: '#fff', side3: '#d9dbdb', side4: '#fff' },
      colorLine: { side1: '#d9dbdb', side2: '#f38073', side3: '#d9dbdb', side4: '#f38073' },
      colorLine2: { side1: '#f38073', side2: '#f38073', side3: '#d9dbdb', side4: '#f38073' },
      windowColors: { side1: '#323332', side2: '#323332', side3: '#323332', side4: '#323332' }
    },
    locPromises = [],
    carPromises = [];
    
    for (let rotation = 0; rotation <= 360; rotation += quality) { 
      carPromises.push(getCreateSpritePromise(rotation, colors, false));
      locPromises.push(getCreateSpritePromise(rotation, colors, true));
    }
  
    return { locPromises, carPromises };
  }
  
  const state = {
    canvas: null,
    ctx: null,
    map: null,
    mousePos: null,
    hoveredTile: null,
    autoplay: true,
    paused: false,
    train: {
      tile: null,
      prevTiles: [],
      dir: null,
      speed: 0.25
    },
    timing: {
      delta: 0,
      last: 0
    },
    colors: {
      "rail": "#7d94a3",
      "railShadow": "#314858",
      "road": "#01aead",
      "blocker": "#f38073",
      "locked": "#019897",
      "bg": "#252021",
      "yellow": "#fdb601"
    },
    graphics: {
      // put sprites here
    },
    isTouchDevice: false
  }
  
  const drawTrain = (ctx, cartInfo) => {
    let sprite = state.graphics[cartInfo.isLocomotive ? 'locSprites' : 'carSprites'][cartInfo.rotation];
  
    if(sprite) {
      ctx.drawImage(sprite, cartInfo.x, cartInfo.y, 150, 150);
    }
  }
  
  class Tile {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.width = 224;
      this.height = 144;
      this.progress = 0;
      this.locked = false;
      this.hidden = false;
      this.setDir = null;
      this.pixelPos = {
        x: 578 + (this.x * 112) - (this.y * 112),
        y: 124 + (this.y * 72) + (this.x * 72)
      }
    }
    
    draw(ctx) {
      let tileId = 'tile-' + this.type + (this.locked ? "-locked" : "");
      
      if(!state.graphics[tileId]) {
          this.getTile(this.type, this.locked).then(sprite => {
            state.graphics[tileId] = sprite;
          });
  
          // Cache locked tiles
          if(!state.graphics[tileId + "-locked"]) {
            this.getTile(this.type, true).then(sprite => {
              state.graphics[tileId + "-locked"] = sprite;
            });
          }
      }
      
      if(state.graphics[tileId]) {
        ctx.drawImage(state.graphics[tileId], this.pixelPos.x, this.pixelPos.y);
      }
    }
    
    getCorners(rotateCount) {
      let corners = [
        { x: 112, y: 0 },
        { x: 224, y: 72 },
        { x: 112, y: 144 },
        { x: 0, y: 72 }
      ];
      
      for (let i = 0; i < rotateCount; i++) {
        corners.push(corners.shift());
      }
      
      return { 
        c1: corners[0],
        c2: corners[1],
        c3: corners[2],
        c4: corners[3]
      };
    }
    
    getTile(type, isLocked) {
      let offscreen = getCanvas(224, 144),
          ctx = offscreen.getContext('2d'),
          fillStyle = '#e17f51';
      
      if(isLocked) {
          fillStyle = state.colors.locked;
      } else {
        switch (this.type) {
            case TileTypes.shadow:
              fillStyle = 'rgba(0, 0, 0, .2)';
              break;
            case TileTypes.blocker:
              fillStyle = state.colors.blocker;
              break;
            case TileTypes.upleft:
            case TileTypes.upright:
            case TileTypes.downleft:
            case TileTypes.downright:
              fillStyle = state.colors.road;
              break;
            case TileTypes.horizontal:
            case TileTypes.vertical:
              fillStyle = state.colors.road;
              break;
        }
      }
      if(this.type === TileTypes.shadow) {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(112, 0);
        ctx.lineTo(224, 72);
        ctx.lineTo(112, 144);
        ctx.lineTo(0, 72);
        ctx.closePath();
        ctx.fill();
  
        let thinkness = 10;
  
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, thinkness);
        ctx.lineTo(112, 72 + thinkness);
        ctx.lineTo(224, thinkness);
        ctx.lineTo(224, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(112, 0);
        ctx.lineTo(224, 72);
        ctx.lineTo(112, 144);
        ctx.lineTo(0, 72);
        ctx.closePath();
        ctx.fill();
      }
  
      let railSize = {
        min: 0.37,
        max: 0.63
      }
  
      if(type === TileTypes.horizontal || type === TileTypes.vertical) {
        this.drawRail(ctx, railSize.min, type === TileTypes.horizontal ? 0 : 1);
        this.drawRail(ctx, railSize.max, type === TileTypes.horizontal ? 0 : 1);
      } else if (type === TileTypes.upright) {
        this.drawRailCorner(ctx, railSize.min, 0);
        this.drawRailCorner(ctx, railSize.max, 0);
      } else if (type === TileTypes.upleft) {
        this.drawRailCorner(ctx, railSize.min, 1);
        this.drawRailCorner(ctx, railSize.max, 1);
      } else if (type === TileTypes.downleft) {
        this.drawRailCorner(ctx, railSize.min, 2);
        this.drawRailCorner(ctx, railSize.max, 2);
      } else if (type === TileTypes.downright) {
        this.drawRailCorner(ctx, railSize.min, 3);
        this.drawRailCorner(ctx, railSize.max, 3);
      }
      
      return createImageBitmap(offscreen).then(sprite => {
        return sprite;
      });
    }
  
    drawGoal(ctx) {
      let cIndex = this.x === 7 ? 0 : 1,
          spriteKey = 'goal' + cIndex;
  
      if(!state.graphics[spriteKey]) {
        let offscreen = getCanvas(224, 144),
            ctxOff = offscreen.getContext('2d'),
            c = this.getCorners(cIndex),
            p2 = this.getPosLine(c.c1, c.c2, 0.5),
            p3 = this.getPosLine(c.c4, c.c3, 0.5),
            p1 = this.getPosLine(p2, p3, 0.5);
        
        ctxOff.fillStyle = state.colors.bg;
        ctxOff.lineWidth = 2;
        ctxOff.strokeStyle = state.colors.bg;
        ctxOff.beginPath();
        ctxOff.moveTo(c.c1.x, c.c1.y);
        ctxOff.lineTo(p2.x, p2.y);
        ctxOff.lineTo(p3.x, p3.y);
        ctxOff.lineTo(c.c4.x, c.c4.y);
        ctxOff.lineTo(p1.x, p1.y);
        ctxOff.closePath();
        ctxOff.fill();
        ctxOff.stroke();
        
        ctxOff.beginPath();
        ctxOff.moveTo(p2.x, p2.y);
        ctxOff.lineTo(c.c2.x, c.c2.y);
        ctxOff.lineTo(c.c3.x, c.c3.y);
        ctxOff.lineTo(p3.x, p3.y);
        ctxOff.closePath();
        ctxOff.fill();
        ctxOff.stroke();
  
        createImageBitmap(offscreen).then(sprite => {
          state.graphics[spriteKey] = sprite;
        });
      }
  
      if(state.graphics[spriteKey]) {
        state.ctx.drawImage(state.graphics[spriteKey], this.pixelPos.x, this.pixelPos.y);
      }
    }
  
    drawTunnel(drawCover) {
      const isFlipped = this.x !== 0,
            graphicKey = 'tunnel' + (drawCover ? '-cover' : '') + (isFlipped ? '-flipped' : '');
  
      if(!state.graphics[graphicKey]) {  
        const offscreen = getCanvas(264, 184),
              ctx = offscreen.getContext('2d'),
              c = this.getCorners(1),
              p1 = this.getPosLine(c.c1, c.c2, 0.2),
              p2 = this.getPosLine(c.c1, c.c2, 0.8),
              center = this.getPosLine(c.c1, c.c2, 0.5);
  
        if(drawCover) {
          ctx.fillStyle = state.colors.bg;
          ctx.beginPath();
  
          ctx.moveTo(p2.x, p2.y - 18);
          ctx.lineTo(c.c3.x, c.c3.y);
          ctx.lineTo(c.c3.x - 50, c.c3.y - 100);
          ctx.lineTo(c.c4.x, c.c4.y - 100);
          ctx.lineTo(c.c1.x, c.c1.y - 100);
          ctx.lineTo(p1.x, p1.y - 50);
          ctx.quadraticCurveTo(p1.x, p1.y - 75, center.x, center.y - 75);
          ctx.quadraticCurveTo(p2.x, p2.y - 75, p2.x, p2.y - 50);
  
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.strokeStyle = state.colors.bg;
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.moveTo(c.c4.x, c.c4.y);
          ctx.lineTo(c.c1.x, c.c1.y);
          ctx.closePath();
          ctx.stroke();
  
          ctx.fillStyle = state.colors.bg;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(c.c1.x, c.c1.y);
          ctx.lineTo(c.c4.x, c.c4.y);
          ctx.closePath();
          ctx.fill();
  
          ctx.fillStyle = "#444";
          ctx.beginPath();
  
          const p3 = this.getPosLine(c.c3, c.c4, 0.8);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(c.c4.x, c.c4.y);
          ctx.lineTo(p1.x, p1.y - 75);
          ctx.closePath();
          ctx.fill();
  
          ctx.fillStyle = state.colors.bg;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y - 23);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(c.c2.x, c.c2.y);
          ctx.lineTo(c.c3.x, c.c3.y);
          ctx.closePath();
          ctx.fill();
  
          ctx.strokeStyle = state.colors.bg;
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.moveTo(c.c2.x, c.c2.y);
          ctx.lineTo(c.c3.x, c.c3.y);
          ctx.closePath();
          ctx.stroke();
        }
        
        if(isFlipped) {
          let tempCanvas = getCanvas(264, 184);
          tempCanvas.getContext('2d').drawImage(offscreen, 0, 0);
          
          ctx.clearRect(0, 0, 264, 184);
          ctx.scale(-1, 1);
          ctx.drawImage(tempCanvas, -224, 0);
        };
        
        createImageBitmap(offscreen).then(sprite => {
            state.graphics[graphicKey] = sprite;
        });
      }
  
      if(!state.graphics['board-blocker']) {
        const offscreen = getCanvas(1380, 600),
              ctx = offscreen.getContext('2d');
  
        ctx.fillStyle = state.colors.bg;
        ctx.beginPath();
        ctx.moveTo(0, 600);
        ctx.lineTo(690, 180);
        ctx.lineTo(1380, 600);
        ctx.lineTo(1380, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        createImageBitmap(offscreen).then(sprite => {
          state.graphics['board-blocker'] = sprite;
        });
      }
  
      if(state.graphics['board-blocker'] && state.graphics[graphicKey]) {
        state.ctx.drawImage(state.graphics['board-blocker'], 0, 0);
        state.ctx.drawImage(state.graphics[graphicKey], this.pixelPos.x, this.pixelPos.y);
      }
    }
    
    drawRail(ctx, pos, rotateCount) {
      const c = this.getCorners(rotateCount);
      
      let p1 = this.getPosLine(c.c2, c.c1, pos),
          p2 = this.getPosLine(c.c3, c.c4, pos);
      
      ctx.strokeStyle = state.colors.railShadow;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 6;
      ctx.stroke();
      
      ctx.strokeStyle = state.colors.rail;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y - 4);
      ctx.lineTo(p2.x, p2.y - 4);
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    
    drawRailCorner(ctx, pos, rotateCount) {
      const c = this.getCorners(rotateCount);
      
      let p1 = this.getPosLine(c.c3, c.c4, pos),
          p2 = this.getPosLine(c.c3, c.c2, pos),
          p3 = this.getPosLine(c.c2, c.c1, pos),
          control = this.getPosLine(p1, p3, pos);
      
      ctx.strokeStyle = state.colors.railShadow;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(control.x, control.y, p2.x, p2.y);
      ctx.lineWidth = 6;
      ctx.stroke();
      
      ctx.strokeStyle = state.colors.rail;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y - 4);
      ctx.quadraticCurveTo(control.x, control.y - 4, p2.x, p2.y - 4);
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    
    getTrainCartInfo(tileProgress, isLocomotive) {
        let g1 = null,
            d = isLocomotive ? state.train.dir : this.setDir,
            r = 0;
  
        if(this.type === TileTypes.upleft && d === Directions.right) {
          g1 = this.drawCornerPos(true, 0, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 45, 135));
        } else if (this.type === TileTypes.upleft && d === Directions.up) {
          g1 = this.drawCornerPos(false, 3, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 315, 225));
        } else if(this.type === TileTypes.upright && d === Directions.left) {
          g1 = this.drawCornerPos(false, 2, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 225, 135));
        } else if(this.type === TileTypes.upright && d === Directions.up) {
          g1 = this.drawCornerPos(true, 3, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 315, 405));
  
          if(r > 360) {
            r -= 360;
          }
        } else if(this.type === TileTypes.downright && d === Directions.down) {
          g1 = this.drawCornerPos(false, 1, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 135, 45));
        } else if(this.type === TileTypes.downright && d === Directions.left) {
          g1 = this.drawCornerPos(true, 2, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 225, 315));
        } else if(this.type === TileTypes.downleft && d === Directions.right) {
          g1 = this.drawCornerPos(false, 0, tileProgress);
  
          r = Math.round(map(tileProgress, 0, 100, 45, -45));
  
          if(r < 0) {
            r = 360 - Math.abs(r);
          }
        } else if(this.type === TileTypes.downleft && d === Directions.down) {
          g1 = this.drawCornerPos(true, 1, tileProgress);
          r = Math.round(map(tileProgress, 0, 100, 135, 225));
        } else if(this.type === TileTypes.vertical && (d === Directions.left || d === Directions.right)) {
          g1 = this.drawStraightPos(tileProgress, d);
          r = d === Directions.left ? 225: 45;
        } else if(this.type === TileTypes.horizontal && (d === Directions.down || d === Directions.up)) {
          g1 = this.drawStraightPos(tileProgress, d);
          r = d === Directions.down ? 135 : 315;
        }
        else {
          state.paused = true;
          document.body.classList.remove('game--active');
          document.body.classList.add('game--over');
  
          return null;
        }
  
        return {
          x: g1.x - 83,
          y: g1.y - 111,
          rotation: r,
          isLocomotive: isLocomotive,
          progress: tileProgress
        }
    }
  
    drawStraightPos(tileProgress, dir) {
      const add = (dir === Directions.down || dir === Directions.left) ? 0 : 2;
  
      const c = this.getCorners(this.type === TileTypes.horizontal ?  add : add + 1);
  
      let p1 = this.getPosLine(c.c2, c.c1, 0.5),
          p2 = this.getPosLine(c.c3, c.c4, 0.5);
  
      p1.x += this.pixelPos.x;
      p1.y += this.pixelPos.y;
      p2.x += this.pixelPos.x;
      p2.y += this.pixelPos.y;
  
      return this.getPosLine(p1, p2, tileProgress / 100);
    }
  
    drawCornerPos(alt, r, tileProgress) {
      const c = this.getCorners(r);
          
      let p1 = this.getPosLine(c.c1, c.c4, 0.5),
          p2 = alt ? this.getPosLine(c.c3, c.c4, 0.5) : this.getPosLine(c.c1, c.c2, 0.5),
          cp = this.getPosLine(p1, this.getPosLine(c.c2, c.c3, 0.5), 0.5);
      
      p1.x += this.pixelPos.x;
      p1.y += this.pixelPos.y;
      p2.x += this.pixelPos.x;
      p2.y += this.pixelPos.y;
      
      cp.x += this.pixelPos.x;
      cp.y += this.pixelPos.y;
      
      return this.getPosLineCorner(p1, p2, cp, tileProgress / 100);
    }
    
    getPosLine(p1, p2, percent) {
      return {
        x: lerp(percent, p1.x, p2.x),
        y: lerp(percent, p1.y, p2.y)
      };
    }
    
    _getQBezierValue(t, p1, p2, p3) {
        var iT = 1 - t;
        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
    }
  
    getPosLineCorner(p1, p2, cp, percent) {   
        return {
            x:  this._getQBezierValue(percent, p1.x, cp.x, p2.x),
            y:  this._getQBezierValue(percent, p1.y, cp.y, p2.y)
        };
    }
  }
  
  class Map {
    constructor(level) {
      this.map = level.level;
      this.startPos = level.start;
      this.endPos = level.end;
      this.spare = level.spare;
      this.tileArr = [[],[],[],[],[],[],[],[],[]];
    }
  
    scramble() {
      let tiles = [],
          tileIndex = 0;
  
      for(let i = 1; i < (this.map.length - 1); i++) {
        for(let j = 1; j < (this.map[i].length - 1); j++) {
          let tileType = this.map[i][j];
  
          if(tileType !== TileTypes.blocker) {
            tiles.push(tileType);
          }
        }
      }
  
  
      for (let i = tiles.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
  
      for(let i = 1; i < (this.map.length - 1); i++) {
        for(let j = 1; j < (this.map[i].length - 1); j++) {
          let tileType = this.map[i][j];
  
          if(tileType !== TileTypes.blocker) {
            this.map[i][j] = tiles[tileIndex];
            tileIndex += 1;
          }
        }
      }
    }
    
    draw(ctx) {
      if(this.tileArr[0].length === 0) {
        for(let i = 0; i < this.map.length; i++) {
          for(let j = 0; j < this.map[i].length; j++) {
            let tile = new Tile(j, i, this.map[i][j]);
  
            if(j === this.startPos.x && i === this.startPos.y) {
              tile.locked = true;
              state.train.tile = tile;
              state.train.tile.progress = state.autoplay ? 0 : -200; // Give the player some headstart
              state.train.dir = this.startPos.x === 0 ? Directions.right : Directions.down;
            } else if (j === this.endPos.x && i === this.endPos.y) {
              tile.locked = true;
            }
  
            if(tile.type !== 0) {
              tile.draw(ctx);
            }
            
            this.tileArr[i].push(tile);
          }
        }
      } else {
        for(let i = 0; i < this.tileArr.length; i++) {
          for(let j = 0; j < this.tileArr[i].length; j++) {
            let tile = this.tileArr[i][j];
            
            if(tile.type !== 0) {
              tile.draw(ctx);
            }
          }
        }
      }
    }
  }
  
  const animateLoop = time => {
    let abort = false;
    
    state.timing = {
      delta: time - state.timing.last,
      last: time
    };
  
    state.ctx.beginPath();
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.map.draw(state.ctx);
    
    if(!state.train.tile.setDir) {
      state.train.tile.setDir = state.train.dir;
    }
  
    if(state.train.tile.progress >= 100) {
      let nextTileResults = getNextTile(state.map.tileArr, state.train.tile, state.train.dir);
  
      if(nextTileResults.tile) {
        state.train.tile.progress -= 100;
  
        state.train.prevTiles.unshift(state.train.tile);
  
        if(state.train.prevTiles.length > 2) {
          state.train.prevTiles.pop();
        }
  
        state.train.tile.setDir = state.train.dir;
  
        state.train.tile = nextTileResults.tile;
  
        if(state.train.tile.type !== TileTypes.blocker && state.train.tile.hidden == false) {
          state.train.tile.locked = true;
        }
        state.train.dir = nextTileResults.dir;
      }
    }
  
    let tileProgress = state.train.tile.progress;
  
    let carts = [state.train.tile.getTrainCartInfo(tileProgress, true)];
    let p = tileProgress,
        r = 0;
  
    // Draw goal
    state.map.tileArr[state.map.endPos.y][state.map.endPos.x].drawGoal(state.ctx);
  
    // Draw tunnel covers
    state.map.tileArr[state.map.startPos.y][state.map.startPos.x].drawTunnel(false);
  
    if(carts[0]) {
      for(let i = 0; i <= 1; i++) {
        p -= 76;
        
        if(p < 0) {
          p += 100;
          r += 1;
        }
  
        if(r === 0) {
          carts.push(state.train.tile.getTrainCartInfo(p, false));
        } else if(r <= state.train.prevTiles.length) {
          carts.push(state.train.prevTiles[r - 1].getTrainCartInfo(p, false));
        }
      }
  
      carts.sort((a, b) => a.y - b.y);
  
      for(let i = 0; i < carts.length; i++) {
        if(carts[i].progress < 100) {
          drawTrain(state.ctx, carts[i]);
        }
        else if(carts[i].progress > 400) {
          // Finished
          state.paused = true;
  
          if(state.autoplay) {
            // Get a new level
            abort = true;
            playLevel(true, false);
          } else {
            document.body.classList.remove('game--active');
            document.body.classList.add('game--win');
          }
        } 
      }
    }
  
    if(!abort) {
      // Draw tunnel covers
      state.map.tileArr[state.map.startPos.y][state.map.startPos.x].drawTunnel(true);
      
      if(state.mousePos && !state.paused && !state.autoplay) {
        let t = hoverCheck(state.mousePos);
        
        if(t[0]) {
          if(!state.graphics["shadow"]) {
            new Tile(0, 0, TileTypes.shadow).getTile(TileTypes.shadow, false).then(sprite => {
              state.graphics["shadow"] = sprite;
            });
          }
          
          if(!state.isTouchDevice) {
            if(state.graphics["shadow"]) {
              state.ctx.drawImage(state.graphics['shadow'], t[0].pixelPos.x, t[0].pixelPos.y);
            }
            state.ctx.drawImage(state.graphics['tile-' + state.map.spare], t[0].pixelPos.x, t[0].pixelPos.y - 72);
          }
          state.hoveredTile = t[0];
        } else {
          state.hoveredTile = null;
        }
      }
      
      state.train.tile.progress += ((state.train.speed * state.timing.delta) / 8) + 0.5;
    }
    
    if(state.isTouchDevice && !state.autoplay && state.graphics['tile-' + state.map.spare]) {
      state.ctx.drawImage(state.graphics['tile-' + state.map.spare], 20, 988);
    }
  
    requestAnimationFrame(animateLoop);
  }
  
  const getNextTile = (tiles, currentTile, dir) => {
    let result = {
      dir: dir,
      tile: null
    };
    
    if(currentTile.type === TileTypes.start && dir === Directions.right) {
       result.tile = tiles[currentTile.y][currentTile.x + 1];
    }
    
    // Straight
    if(currentTile.type === TileTypes.vertical && dir === Directions.right) {
      result.tile = tiles[currentTile.y][currentTile.x + 1];
    }
    
    if(currentTile.type === TileTypes.vertical && dir === Directions.left) {
      result.tile = tiles[currentTile.y][currentTile.x - 1];
    }
    
    if(currentTile.type == TileTypes.horizontal && dir === Directions.down) {
      result.tile = tiles[currentTile.y + 1][currentTile.x];
    }
    
    if(currentTile.type === TileTypes.horizontal && dir === Directions.up) {
      result.tile = tiles[currentTile.y - 1][currentTile.x];
    }
    
    // Corners
    if(currentTile.type === TileTypes.upleft && dir === Directions.right) {
      result.tile = tiles[currentTile.y + 1][currentTile.x];
      result.dir = Directions.down;
    }
    
    if(currentTile.type === TileTypes.downright && dir === Directions.down) {
      result.tile = tiles[currentTile.y][currentTile.x + 1];
      result.dir = Directions.right;
    }
    
    if(currentTile.type === TileTypes.downleft && dir === Directions.right) {
      result.tile = tiles[currentTile.y - 1][currentTile.x];
      result.dir = Directions.up;
    }
    
    if(currentTile.type === TileTypes.upleft && dir === Directions.up) {
      result.tile = tiles[currentTile.y][currentTile.x - 1];
      result.dir = Directions.left;
    }
    
    if(currentTile.type === TileTypes.upright && dir === Directions.left) {
      result.tile = tiles[currentTile.y + 1][currentTile.x];
      result.dir = Directions.down;
    }
    
    if(currentTile.type === TileTypes.upright && dir === Directions.up) {
      result.tile = tiles[currentTile.y][currentTile.x + 1];
      result.dir = Directions.right;
    }
    
    if(currentTile.type === TileTypes.downleft && dir === Directions.down) {
      result.tile = tiles[currentTile.y][currentTile.x - 1];
      result.dir = Directions.left;
    }
    
    if(currentTile.type === TileTypes.downright && dir === Directions.left) {
      result.tile = tiles[currentTile.y - 1][currentTile.x];
      result.dir = Directions.up;
    }
    
    return result;
  }
  
  const setMousePos = evt => {
      var rect = state.canvas.getBoundingClientRect();
      state.mousePos = {
          x: (evt.clientX - rect.left) / (rect.right - rect.left) * state.canvas.width,
          y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * state.canvas.height
      };
  }
  
  const playLevel = (autoplay, paused) => {
    let diffSlider = document.querySelector('input[type=range]');
  
    if(!autoplay) {
      document.body.classList.add('game--active');
    } else {
      document.body.classList.remove('game--active');
    }
  
    state.paused = paused;
    state.autoplay = autoplay;
    state.map = new Map(levelFactory.newLevel(diffSlider.value, false));
  
    if(!autoplay) {
      state.map.scramble();
    }
  
    state.train = {
      tile: null,
      prevTiles: [],
      speed: map(diffSlider.value, 1, 100, 0, 1),
      dir: null
    };
  }
  
  const gotoMenu = () => {
    state.paused = true;
    state.autoplay = true;
    document.body.classList.remove('game--win');
    document.body.classList.remove('game--over');
    playLevel(true, true);
  }
  
  const finish = () => {
    state.train.speed = 7;
  }
  
  const setSpeed = slider => {
    state.train.speed = slider.value / 100;
  }
  
  const getCanvas = (width, height) => {
    let c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    return c;
  }
  
  const load = () => {
    let quality = getQuality();
    
    if(!window.createImageBitmap) {
      window.createImageBitmap = imageBitmapFallback;
    }
    
    if('ontouchstart' in document.documentElement) {
      state.isTouchDevice = true;
    }
  
    let promises = puzzleSpritesFactory(quality),
        carSprites = [],
        locSprites = [];
    
    Promise.all(promises.carPromises)
    .then((results) => {
      for(let i = 0; i < results.length; i++) {
        let sprite = results[i];
  
        for (let j = 0; j < quality; j++) { 
          carSprites.push(sprite);
        }
      }
    })
    .then(() => Promise.all(promises.locPromises))
    .then((results) => {
      for(let i = 0; i < results.length; i++) {
        let sprite = results[i];
  
        for (let j = 0; j < quality; j++) { 
          locSprites.push(sprite);
        }
      }
    })
    .then(() => {
      init({ carSprites, locSprites });
    })
    .catch((err) => console.error(err));
  }
  
  const getQuality = () => {
    let score = 0,
        table = [1, 4, 8, 16]; // [1, 4, 8, 16]
    
    if(!window.createImageBitmap) {
      score += 1;
    }
    
    if(!navigator.deviceMemory || navigator.deviceMemory < 8) {
      score += 1;
    }
    
    if(window.matchMedia("only screen and (max-width: 760px)").matches) {
      score += 1;
    }
    
    return table[score];
  }
  
  const imageBitmapFallback = canvas => {
    return new Promise(function(resolve, reject) {
        //let c = getCanvas(canvas.width, canvas.height);
        //c.getContext('2d').drawImage(canvas, 0, 0);
        resolve(canvas);
    });
  }
  
  const init = (sprites) => {
    state.graphics['locSprites'] = sprites.locSprites;
    state.graphics['carSprites'] = sprites.carSprites;
    
    state.canvas = document.getElementsByTagName('canvas')[0];
    state.ctx = state.canvas.getContext('2d');
    state.map = new Map(levelFactory.newLevel(20, false));
  
    if(!state.isTouchDevice) {
      document.addEventListener("mousemove", setMousePos, false);
    }
    state.canvas.addEventListener('click', swapTiles, false);
  
    window.playLevel = playLevel;
    window.gotoMenu = gotoMenu;
    window.setSpeed = setSpeed;
    window.finish = finish;
  
    document.body.classList.remove('game--loading');
    requestAnimationFrame(animateLoop);
  }
  
  const swapTiles = event => {
      if(state.isTouchDevice) {
        setMousePos(event);
  
        let t = hoverCheck(state.mousePos);
        
        if(t && t.length > 0) {
          state.map.tileArr[t[0].y][t[0].x] = new Tile(t[0].x, t[0].y, state.map.spare);
          state.map.spare = t[0].type;
        }
      } else {
        let t = state.hoveredTile;
  
        state.map.tileArr[t.y][t.x] = new Tile(t.x, t.y, state.map.spare);
        state.map.spare = state.hoveredTile.type;
      }
  }
  
  const hoverCheck = mousePos => {
      let hits = [],
          result = [];
      
      for(let i = 1; i < state.map.tileArr.length - 2; i++) {
        for(let j = 1; j < state.map.tileArr[i].length - 1; j++) {
          let tile = state.map.tileArr[i][j];
          
          if(tile.locked || tile.type === TileTypes.blocker)
            continue;
  
          if(mousePos.x > tile.pixelPos.x && mousePos.y > tile.pixelPos.y
        && mousePos.x < (tile.pixelPos.x + tile.width) && mousePos.y < (tile.pixelPos.y + tile.height)) {
            hits.push(tile);
          }
        }
      }
      
      if(hits.length > 1) {
        hits.forEach(function(t) {
          let c = t.getCorners(0),
              l1 = new Line(c.c1, c.c2),
              l2 = new Line(c.c2, c.c3),
              l3 = new Line(c.c3, c.c4),
              l4 = new Line(c.c4, c.c1),
              ml = new Line({
                x: mousePos.x - t.pixelPos.x,
                y: mousePos.y - t.pixelPos.y
              }, {
                x: 2343,
                y: mousePos.y - t.pixelPos.y
              });
          
           if(!l4.isIntersecting(ml) && l1.isIntersecting(ml)) {
             result.push(t);
           }
          
          if(!l3.isIntersecting(ml) && l2.isIntersecting(ml)) {
            result.push(t);
          }
        });
      } else {
        result.push(hits[0]);
      }
        
      return result;
  }
  
  load();