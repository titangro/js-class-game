'use strict';
class Vector {
	constructor(x=0, y=0) {
		this.x = x,
		this.y = y
	}
	plus(vector) {
		if(vector instanceof Vector) {
			let newX = this.x + vector.x;
			let newY = this.y + vector.y;
			return new Vector(newX, newY);
		} else {
			throw new Error("Можно прибавлять к вектору только вектор типа Vector");
		}	
	}
	times(factor) {
		return new Vector((this.x * factor), (this.y * factor));
	}
}

class Actor {
	constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)) {	
		if(pos === undefined || size === undefined || speed === undefined) {
			if(pos === undefined){
				this.pos = new Vector(0, 0);
			} else if(pos instanceof Vector) {
				this.pos = new Vector(pos.x, pos.y);
			} else {
				throw new Error("Cвоство pos не являются объектами Vector");
			}
			if(size === undefined) {
				this.size = new Vector(1, 1);
			} else if(size instanceof Vector) {
				this.size = new Vector(size.x, size.y);
			} else {
				throw new Error("Cвоство size не являются объектами Vector");
			}
			if(speed === undefined) {
				this.speed = new Vector(0, 0);
			} else if(speed instanceof Vector) {
				this.speed = new Vector(speed.x, speed.y);
			} else {
				throw new Error("Cвоство speed не являются объектами Vector");
			}			
		} else if(pos instanceof Vector && size instanceof Vector && speed instanceof Vector) {
			this.pos = new Vector(pos.x, pos.y);
			this.size = new Vector(size.x, size.y);
			this.speed = new Vector(speed.x, speed.y);
		} else {
			throw new Error("Cвоства не являются объектами Vector");
		}	
		Object.defineProperty(this, "left", { value: this.pos.x, configurable: false, writable: false, enumerable: true });
		Object.defineProperty(this, "top", { value: this.pos.y, configurable: false, writable: false, enumerable: true });
		Object.defineProperty(this, "right", { value: this.pos.x+this.size.x, configurable: false, writable: false, enumerable: true });
		Object.defineProperty(this, "bottom", { value: this.pos.y+this.size.y, configurable: false, writable: false, enumerable: true });
		Object.defineProperty(this, "type", { value: "actor", configurable: false, writable: false, enumerable: true });
	}
	act() {}
	isIntersect(moving) {
		if(moving.type === "actor" && moving !== undefined) {
			if(moving === this){
				return false;
			}
			if(moving.top === this.top && moving.bottom === this.bottom) {
				if(moving.left === this.left && moving.right === this.right) {
					return true;
				}
			}	
			if(moving.left > this.left) {
				if(this.right > moving.right) {
					if(moving.top > this.top) {
						if(moving.bottom < this.bottom) {
							return true;
						}
					}
				}
			}	
			if(moving.left > this.right && this.left > moving.right || moving.right > this.left && this.right > moving.left) {
				if(moving.top > this.bottom && this.top > moving.bottom || moving.bottom > this.top && this.bottom > moving.top) {
					return true;
				}
			}							
			return false;
		} else {
			throw new Error("Движущийся объект не является типом Actor");
		}
	}	
}
let p = new Vector(30,50);
let s = new Vector(5,5);
let sp = new Vector(10,2);
let alfa = new Actor(p,s,sp);
console.log(alfa);
console.log(alfa.pos);
console.log(p);
console.log(alfa.pos == p);
console.log(alfa.size);
console.log(s);
console.log(alfa.size == s);
let p1 = new Vector(30,60);
let s1 = new Vector(30,60);
//console.log(alfa.left);
//console.log(alfa.top);
//console.log(alfa.right);
//console.log(alfa.bottom);


