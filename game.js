'use strict';
class Vector {
	constructor(x=0, y=0) {
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
	constructor(pos, size, speed) {	
		if (pos === undefined || size === undefined || speed === undefined) {
			if (pos === undefined){
				this.pos = new Vector(0, 0);
			} else if (pos instanceof Vector) {
				this.pos = pos;
			} else {
				throw new Error('Cвоство pos не являются объектами Vector');
			}
			if (size === undefined) {
				this.size = new Vector(1, 1);
			} else if (size instanceof Vector) {
				this.size = size;
			} else {
				throw new Error('Cвоство size не являются объектами Vector');
			}
			if(speed === undefined) {
				this.speed = new Vector(0, 0);
			} else if (speed instanceof Vector) {
				this.speed = speed;
			} else {
				throw new Error('Cвоство speed не являются объектами Vector');
			}			
		} else if (pos instanceof Vector && size instanceof Vector && speed instanceof Vector) {
			this.pos = pos;
			this.size = size;
			this.speed = size;
		} else {
			throw new Error('Cвоства не являются объектами Vector');
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
		if (actor.type === 'actor' && actor !== undefined) {
			if (actor === this) {
				return false;
			}
			if (actor.top === this.top && actor.bottom === this.bottom) {
				if (actor.left === this.left && actor.right === this.right) {
					return true;
				}
			}	
			if (actor.left > this.left) {
				if (this.right > actor.right) {
					if (actor.top > this.top) {
						if (actor.bottom < this.bottom) {
							return true;
						}
					}
				}
			}	
			if (actor.left > this.right && this.left > actor.right || actor.right > this.left && this.right > actor.left) {
				if (actor.top > this.bottom && this.top > actor.bottom || actor.bottom > this.top && this.bottom > actor.top) {
					return true;
				}
			}							
			return false;
		} else {
			throw new Error('Движущийся объект не является типом Actor');
		}
	}	
}

class Level {
	constructor(grid, actors) {
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;		
	}	
	get player() {		
		for (let actor of this.actors) {
			if (actor.type === "player") {				
				return actor;
			}
		}
	}
	get height() {	
		if (this.grid === undefined) {
			return 0;
		} else {
			return this.grid.length;
		}
	}
	get width() {
		if (this.grid === undefined) {
			return 0;
		} else {
			let result;
			for (let i = 0; i < this.grid.length; i++) {
				result = Math.max(this.grid[i].length);
			}
			return result;
		}
	}	
	isFinished() {
		if (this.status !== null) {
			if (this.finishDelay < 0) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	}	
	actorAt(actor) {
		if (!(actor instanceof Actor)) {
			throw new Error('Объект не является типом Actor');
		} else {
			if (this.actors === undefined) {
				return;
			} else if (this.actors.length === 1) {
				return;
			} else {
				let result;					
				for (let item of this.actors) {
					if (item instanceof Actor) {
						if (item.pos.x === actor.pos.x) {
							if (item.pos.y === actor.pos.y) {
								result = item;							
							}					
						}	else return;		
					}							
				}
				return result;
			}
		}							
	}
	obstacleAt(pos, size) {
		if (!(pos instanceof Vector) || !(pos instanceof Vector)) {
			throw new Error('Объект(ы) не является типом Vector');
		} else if (pos.x < 0) {
			return 'wall';
		} else if (pos.x + size.x > this.width)	{
			return 'wall';
		} else if (pos.y < 0) {
			return 'wall';
		} else if (pos.y + size.y > this.height) {
			return 'lava';
		}
		for (let i = Math.round(pos.y); i <= size.y+pos.y; i++) {
			for (let j = Math.round(pos.x); j <= size.x+pos.x; j++){
				return this.grid[i][j];
			}
		}
	}
	removeActor(actor) {				
		this.actors.splice(this.actors.indexOf(actor), 1);		
	}
	noMoreActors(type) {
		if (this.actors === undefined) {
			return true;
		}		
		for (let item of this.actors) {
			if (item instanceof Actor){
				if (item.type === type){
					return false;
				}
			}
		}
		return true;	
	}
	playerTouched(type, actor) {
		if (this.status !== null) {

		} else {						
			if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
			} else {
				if (type === 'coin') {					
					this.removeActor(actor);
					if (this.noMoreActors('coin')){
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
		if (symbol !== undefined) {
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
			for (let j = 0; j < plan.length; j++) {				
				let result = plan[j].split('');				
				for (let i = 0; i < result.length; i++) {					
					result[i] = this.obstacleFromSymbol(result[i]);
				}				
				grid.push(result);
			}
			return grid;
		}
	}
	createActors(plan) {
		let grid = [];		
		if (plan.length === 0 || this.data === undefined) {			
			return [];
		} else {				
			let item, actor, result;							
			for (let i = 0; i < plan.length; i++) {
				result = plan[i].split('');				
				for (let j = 0; j < plan[i].length; j++) {					
					item = this.actorFromSymbol(result[j]);
					if (item === undefined || typeof item !== 'function' || !(new item() instanceof Actor)) {						
						grid.push();
						continue;
					} else {
						actor = new item(new Vector(j, i));																
					}	
					grid.push(actor);					
				}								
			}	
			return grid;
		}
	}
	parse(plan) {		
		let level = new Level(this.createGrid(plan), this.createActors(plan));
		return level;
	}
}

const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));