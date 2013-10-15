enchant();

var xPos = 50;
var yPos = 50;

randInt = function(range) {
	return Math.floor(Math.random()*range);
}

function SpriteTable(spriteCount) {
	this.sprites = new Array(spriteCount);
	for (i = 0; i < spriteCount; i++) {
		this.sprites[i] = new Sprite(1, 1);
		this.sprites[i].gameExtras = new Array(0);
		this.sprites[i].gameExtras.inUse = false;// if true, there is an actual sprite here
	}
}

SpriteTable.prototype.getNewSprite = function() {
	for (i = 0; i < this.sprites.length; i++) {
		if (!this.sprites[i].gameExtras.inUse) {
			this.sprites[i].gameExtras.inUse = true;
			game.rootScene.addChild(this.sprites[i]);
			return this.sprites[i];
		}
	}
	return null;
}

SpriteTable.prototype.freeSprite = function(sprite) {
	sprite.gameExtras.inUse = false;
	game.rootScene.removeChild(sprite);
}


initializeBad = function(sprite) {
	sprite.image = game.assets['imgs/bad.png'];
	sprite.x = game.width;
	sprite.y = randInt(game.height);
	sprite.width = 20;
	sprite.height = 20;
	sprite.frame = 2 * randInt(2);// either 0 or 2
	sprite.gameExtras.characterType = "enemy";
	sprite.gameExtras.alive = true;
}

initializeBullet = function(sprite, mainChar) {
	sprite.image = game.assets['imgs/bullet.png'];
	sprite.x = mainChar.x + mainChar.width;
	sprite.y = mainChar.y + mainChar.height / 2;
	sprite.width = 3;
	sprite.height = 2;
	sprite.frame = 0;
	sprite.gameExtras.characterType = "playerBullet";
}

var bulletSpeed = 3;
var playerSpeed = 1.25;
var enemySpeed = 1;
var playerFallingSpeedX = 1;
var playerFallingSpeedY = 2;
var enemyFallingSpeedX = 1;
var enemyFallingSpeedY = 2;

doFrame = function() {
	if (randInt(10) < 2) {
		var badChar = spriteTable.getNewSprite();
		if (badChar != null) initializeBad(badChar);
	}

	var spr;

	for (var i = 0; i < spriteTable.sprites.length; i++) {
		spr = spriteTable.sprites[i]; 
		if (spr.gameExtras.inUse) {
			switch (spr.gameExtras.characterType) {
			case  "player":
				if (spr.gameExtras.alive) {
					if (spr.gameExtras.framesUntilBullet > 0) spr.gameExtras.framesUntilBullet --;

					if(game.input.left && !game.input.right){
						spr.x -= playerSpeed;
					} else if(game.input.right && !game.input.left){
						spr.x += playerSpeed;
					}

					if (game.input.up && !game.input.down){
						spr.y -= playerSpeed;
					} else if(game.input.down && !game.input.up){
						spr.y += playerSpeed;
					}

					// shoot bullets
					if (game.input.space) {
						if (spr.gameExtras.framesUntilBullet == 0) {
							spr.gameExtras.framesUntilBullet = spr.gameExtras.framesBetweenBullets;
							var bulletChar = spriteTable.getNewSprite();
							if (bulletChar != null) initializeBullet(bulletChar, spr);
						}
					}

					// check for collision
					for (var j = 0; j < spriteTable.sprites.length; j++) {
						var sprEnemy = spriteTable.sprites[j]; 
						if (sprEnemy.gameExtras.inUse && sprEnemy.gameExtras.characterType == "enemy") {
							if (spr.intersect(sprEnemy)) {
								spr.gameExtras.alive = false;
								spr.frame ++;
								break;
							}
						}
					}
					
				} else {
					// not alive
					spr.x += playerFallingSpeedX;
					spr.y += playerFallingSpeedY;
				}
				break;
			case  "enemy":
				if (spr.gameExtras.alive) {
					spr.x -= 1;
					if (spr.x < - spr.width - 2) spriteTable.freeSprite(spr);

					// check for collision with bullets
					for (var j = 0; j < spriteTable.sprites.length; j++) {
						var sprBullet = spriteTable.sprites[j]; 
						if (sprBullet.gameExtras.inUse && sprBullet.gameExtras.characterType == "playerBullet") {
							if (spr.intersect(sprBullet)) {
								spr.gameExtras.alive = false;
								spr.frame ++;
								spriteTable.freeSprite(sprBullet);// remove bullet
								break;
							}
						}
					}
				} else {
					// dead enemy
					spr.x -= enemyFallingSpeedX;
					spr.y += enemyFallingSpeedY;
					if (spr.y > game.height) spriteTable.freeSprite(spr);
				}
				break;
			case  "playerBullet":
				spr.x += bulletSpeed;
				if (spr.x > game.width) spriteTable.freeSprite(spr);
			}
		}
	}
}

var game;
var spriteTable;

window.onload = function() {
	game = new Game(600, 320);
	game.scale = 1.5;
	game.preload('imgs/main.png', 'imgs/bad.png', 'imgs/space.png', 'imgs/bullet.png');
	game.keybind(32, 'space');
	game.fps = 30;

	game.onload = function() {
		spriteTable = new SpriteTable(500);

		var bg = new Sprite(1280, 320);
		bg.image = game.assets["imgs/space.png"];
		bg.x = 0;
		bg.y = 0;
		game.rootScene.addChild(bg);


		var mainChar = spriteTable.getNewSprite();
		mainChar.frame = 1;
		mainChar.image = game.assets['imgs/main.png'];
		mainChar.x = xPos;
		mainChar.y = yPos;
		mainChar.width = 20;
		mainChar.height = 20;
		mainChar.gameExtras.characterType = "player";
		mainChar.gameExtras.alive = true;
		mainChar.gameExtras.framesBetweenBullets = 10;
		mainChar.gameExtras.framesUntilBullet = 0;

		game.addEventListener('enterframe', doFrame);

	}

	game.start();
}

