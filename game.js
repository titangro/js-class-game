'use strict';
class Vector {
	constructor(x = 0, y = 0) {
		this.x = x,
		this.y = y
	}
	plus(vector) {
		if (vector instanceof Vector) {
			let newX = this.x + vector.x;
			let newY = this.y + vector.y;
			return new Vector(newX, newY);
		} else {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}	
	}
	times(factor) {
		return new Vector((this.x * factor), (this.y * factor));
	}
}

class Actor {
	constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {	
		if (pos instanceof Vector && size instanceof Vector && speed instanceof Vector) {
			this.pos = pos;
			this.size = size;
			this.speed = speed;
		} else {
			throw new Error('Cвоство(а) не являются объектами Vector');
		}			
	}
	get left() {
		return this.pos.x;
	}
	get top() {
		return this.pos.y;
	}
	get right() {
		return this.pos.x + this.size.x;
	}
	get bottom() {
		return this.pos.y + this.size.y;
	}
	get type() {
		return 'actor';
	}
	act() {}
	isIntersect(actor) {
		if (actor instanceof Actor && actor !== undefined) {			
			if (actor !== this && (actor.top === this.top && actor.bottom === this.bottom && actor.left === this.left && actor.right === this.right || actor.left > this.left && this.right > actor.right && actor.top > this.top && actor.bottom < this.bottom || (actor.left > this.right && this.left > actor.right || actor.right > this.left && this.right > actor.left) && (actor.top > this.bottom && this.top > actor.bottom || actor.bottom > this.top && this.bottom > actor.top))) {
				return true;
			} else {
				return false;
			}
		} else {
			throw new Error('Движущийся объект не является типом Actor');
		}
	}	
}

class Level {
	constructor(grid = [], actors) {
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;		
	}	
	get player() {		
		return this.actors.find((actor) => actor.type === "player");		
	}
	get height() {	
		return this.grid.length;
	}
	get width() {
		return this.grid.reduce((result, item) => {			
			return Math.max(item.length, result);
		}, 0);	
	}	
	isFinished() {
		if (this.status !== null) {
			return this.finishDelay < 0
		} else {
			return false;
		}		
	}	
	actorAt(actor) {
		if (actor instanceof Actor && actor !== undefined) {
			if (this.actors) {
				return this.actors.find((item) => item instanceof Actor && actor.isIntersect(item));					
			}
		} else {	
			throw new Error('Объект не является типом Actor');			
		}
	}
	obstacleAt(pos, size) {
		if (pos instanceof Vector && pos instanceof Vector) {
			if (pos.x < 0 || pos.x + size.x > this.width || pos.y < 0) {
				return 'wall';
			} else if (pos.y + size.y > this.height) {
				return 'lava';
			}
			for (let posY = Math.floor(pos.y); posY < pos.y + size.y; posY++) {
				for (let posX = Math.floor(pos.x); posX < pos.x + size.x; posX++) {
					let obstacle = this.grid[posY][posX];
					if (obstacle) {
						return obstacle;	
					}												
				}
			}
		} else { 
			throw new Error('Объект(ы) не является типом Vector');
		}
	}
	removeActor(actor) {				
		this.actors.splice(this.actors.indexOf(actor), 1);	
	}
	noMoreActors(type) {
		if (this.actors) {
			return !(this.actors.find((actor) => actor.type === type));
		} else {
			return true;			
		}		
	}
	playerTouched(type, actor) {
		if (this.status === null) {						
			if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
			} else {
				if (type === 'coin') {			
					this.removeActor(actor);
					if (this.noMoreActors('coin')) {
						this.status = 'won';
					}
				}
			}
		}
	}
}

class LevelParser {
	constructor(data) {
		this.data = data;
	}
	actorFromSymbol(symbol) {
		if (!symbol || (typeof this.data[symbol]) !== 'function') {
			return;
		} else {
			return this.data[symbol];
		}
	}
	obstacleFromSymbol(symbol) {
		if (symbol === 'x') {
			return 'wall';
		} else if (symbol === '!') {
			return 'lava';
		}
	}
	createGrid(plan) {		
		let grid = [];		
		if (plan.length === 0) {			
			return grid;
		} else {
			let parser = this;
			plan.forEach((string) => {				
				let result = string.split('');
				grid.push(result.map((cell) => {	
					return parser.obstacleFromSymbol(cell);										
				}));
			});					
			return grid;
		}
	}
	createActors(plan) {
		let grid = [];
		if (plan.length === 0 || this.data === undefined) {			
			return [];
		} else {
			let actor, result, item;
			let parser = this;
			plan.forEach((posX, column) => {
				result = posX.split('');
				result.forEach((posY, cell) => {
					item = parser.actorFromSymbol(posY);
					if (item !== undefined && new item() instanceof Actor) {						
						actor = new item(new Vector(cell, column));
					} else {
						return grid.push();																					
					}	
					grid.push(actor);
				});								
			});		
			return grid;
		}
	}
	parse(plan) {		
		let level = new Level(this.createGrid(plan), this.createActors(plan));
		return level;
	}
}

class Fireball extends Actor {
	constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		super();		
		this.pos = pos;
		this.speed = speed;
		this.size = new Vector(1, 1);
	}		
	get type() {
		return 'fireball';
	}		
	getNextPosition(time = 1) {		
 		return new Vector(this.pos.x, this.pos.y).plus(new Vector(this.speed.x, this.speed.y).times(time));
	}
	handleObstacle() {
		this.speed.x = -this.speed.x;
		this.speed.y = -this.speed.y;
	}
	act(time, grid) {
		let newPosition = this.getNextPosition(time);					
		if (grid.obstacleAt(newPosition, this.size)) {
			this.handleObstacle();
		} else {
			this.pos = newPosition;
		}
	}
}

class HorizontalFireball extends Fireball {
	constructor(pos) {
		super(pos);
		this.pos = pos;
		this.speed = new Vector(2, 0);
		this.size = new Vector(1, 1);
	}
}

class VerticalFireball extends Fireball {
	constructor(pos) {
		super(pos);
		this.pos = pos;
		this.speed = new Vector(0, 2);
		this.size = new Vector(1, 1);
	}
}

class FireRain extends Fireball {
	constructor(pos) {
		super(pos);
		this.pos = pos;
		this.speed = new Vector(0, 3);
		this.size = new Vector(1, 1);
		this.start = pos;
	}	
	handleObstacle() {		
		this.pos = this.start;
		this.speed.x = this.speed.x;
		this.speed.y = this.speed.y;
	}
}

class Coin extends Actor {
	constructor(pos) {
		super(pos);
		this.size = new Vector(0.6, 0.6);
		if (pos) {
			this.pos = new Vector(pos.x + 0.2, pos.y + 0.1);
			this.start = new Vector(pos.x + 0.2, pos.y + 0.1);			
		} else {
			this.pos = new Vector(0.2, 0.1);
			this.start = new Vector(0.2, 0.1);
		}		
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.floor(Math.random() * 2 * Math.PI);		
	}
	get type() {
		return 'coin';
	}
	updateSpring(time = 1) {		
		this.spring += this.springSpeed * time; 
	}
	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}
	getNextPosition(time = 1) {
		this.updateSpring(time);
		return new Vector(this.start.x, this.start.y + this.getSpringVector().y);
	}
	act(time) {
		this.pos = this.getNextPosition(time);
	}
}

class Player extends Actor {
	constructor(pos) {
		super(pos);
		if (pos) {
			this.pos = new Vector(pos.x, pos.y - 0.5);
		} else {
			this.pos = new Vector(0, -0.5);
		}
		this.size = new Vector(0.8, 1.5);
		this.speed = new Vector(0, 0);
	}
	get type() {
		return 'player';
	}
}

const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
}

const parser = new LevelParser(actorDict);

loadLevels()    
  .then(map => runGame(JSON.parse(map), parser, DOMDisplay)  	
    .then(() => alert('Поздравляем! Игра успешно пройдена!')));