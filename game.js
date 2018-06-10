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
				throw new Error('Cвоство pos не является объектами Vector');
			}
			if (size === undefined) {
				this.size = new Vector(1, 1);
			} else if (size instanceof Vector) {
				this.size = size;
			} else {
				throw new Error('Cвоство size не является объектами Vector');
			}
			if(speed === undefined) {
				this.speed = new Vector(0, 0);
			} else if (speed instanceof Vector) {
				this.speed = speed;
			} else {
				throw new Error('Cвоство speed не является объектами Vector');
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
	constructor(grid = [], actors) {
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
		return this.grid.length;
	}
	get width() {
		let result = 0
		this.grid.forEach(function(item) {
			result = Math.max(item.length);
		});
		return result;		
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
						if (item.pos.x < (actor.pos.x + actor.size.x) && item.pos.x >= actor.pos.x) {
							if (item.pos.y < (actor.pos.y + actor.size.y) && item.pos.y >= actor.pos.y) {								
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
		for (let i = Math.floor(pos.y + size.y); i <= Math.ceil(size.y + pos.y); i++) {			
			for (let j = Math.floor(pos.x + size.x); j <= Math.ceil(size.x + pos.x); j++){				
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
			let parser = this;
			plan.map(function(item) {
				try {
					let result = item.split('');				
					grid.push(result.map(function(item) {
						return item = parser.obstacleFromSymbol(item);										
					}));
				} catch (err) {
					grid.push();
				}
			});					
			return grid;
		}
	}
	createActors(plan) {
		let grid = [];		
		if (plan.length === 0 || this.data === undefined) {			
			return [];
		} else {
			try {
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
			} catch(err) {
				grid.push();
			}
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
 		return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
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
		if (pos === undefined) {
			this.pos = new Vector(0.2, 0.1);
			this.start = new Vector(0.2, 0.1);
		} else {
			this.pos = new Vector(pos.x + 0.2, pos.y + 0.1);
			this.start = new Vector(pos.x + 0.2, pos.y + 0.1);
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
		if (pos === undefined) {
			this.pos = new Vector(0, -0.5);			
		} else {
			this.pos = new Vector(pos.x, pos.y - 0.5);			
		}
		this.size = new Vector(0.8, 1.5);
		this.speed = new Vector(0, 0);
	}
	get type() {
		return 'player';
	}
}

const maps = [
  [
    '     v                   v                 ',
    '                       v        xxxx      ',
    '  o   x               v                   ',
    '  x    x                                  ',
    '         x                                ',
    '             xxxx                         ',
    '                                   o      ',
    '                    !xxx xxxx   xxxxxxxx  ',
    '                  xx            o         ',
    '        o   !!!              xxxx         ',
    '  @     xxxx   xx                         ',
    '   x                                      ',
    'xxxx   |                                  ',
    '               = |                        ',
    '                                          ',
    '         xxxxxx!                          ',
    '                        oo                ',
    '                      xxxxx               ',
    '                                          ',
    '                                          ',
    '                                          ',
    '                                          '
  ],
  [
    '      v      v         ',
    '    v            v    o ',
    '  v        x  x  x x  x ',
    '        o = = =         ',
    '        x    |  | |     ',
    '@   x                   ',
    'x                     o ',
    '                      x '
  ],
  [
    '      v                        xxxxxxv      ',
    '    v               o xxxxxxxxx         o   ',
    '  v         xxxxxxxxxx                 xxx  ',
    '        o                 =          o      ',
    '        x             =           !!!x!xxx  ',
    '@   x         |      xxx     xxx            ',
    'x            xxx                o           ',
    '                              xxxx          '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
}

const parser = new LevelParser(actorDict);

const level = parser.parse(maps);
runLevel(level, DOMDisplay)
  .then(status => console.log(`Игрок ${status}`));

runGame(maps, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
