enchant();

var xPos = 50;
var yPos = 50;

randInt = function(range) {
	return Math.floor(Math.random()*range);
}

function Character() {
	this.sprite = new Sprite(1,1);
}


function CharacterTable(characterCount) {
	this.characters = new Array(characterCount);
	for (i = 0; i < characterCount; i++) {
		this.characters[i] = new Character();
		this.characters[i].gameExtras = new Array(0);
		this.characters[i].gameExtras.inUse = false;// if true, there is an actual character here
	}
}

CharacterTable.prototype.getNewCharacter = function() {
	for (i = 0; i < this.characters.length; i++) {
		if (!this.characters[i].gameExtras.inUse) {
			this.characters[i].gameExtras.inUse = true;
			game.rootScene.addChild(this.characters[i].sprite);
			return this.characters[i];
		}
	}
	return null;
}

CharacterTable.prototype.freeCharacter = function(character) {
	character.gameExtras.inUse = false;
	game.rootScene.removeChild(character.sprite);
}


initializeBad = function(character) {
	character.sprite.image = game.assets['imgs/bad.png'];
	character.sprite.x = game.width;
	character.sprite.y = randInt(game.height);
	character.sprite.width = 20;
	character.sprite.height = 20;
	character.sprite.frame = 2 * randInt(2);// either 0 or 2
	character.gameExtras.characterType = "enemy";
	character.gameExtras.alive = true;
}

initializeBullet = function(character, mainChar) {
	character.sprite.image = game.assets['imgs/bullet.png'];
	character.sprite.x = mainChar.sprite.x + mainChar.sprite.width;
	character.sprite.y = mainChar.sprite.y + mainChar.sprite.height / 2;
	character.sprite.width = 3;
	character.sprite.height = 2;
	character.sprite.frame = 0;
	character.gameExtras.characterType = "playerBullet";
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
		var badChar = CharacterTable.getNewCharacter();
		if (badChar != null) initializeBad(badChar);
	}

	var chr;

	for (var i = 0; i < CharacterTable.characters.length; i++) {
		chr = CharacterTable.characters[i]; 
		if (chr.gameExtras.inUse) {
			switch (chr.gameExtras.characterType) {
			case  "player":
				if (chr.gameExtras.alive) {
					if (chr.gameExtras.framesUntilBullet > 0) chr.gameExtras.framesUntilBullet --;

					if(game.input.left && !game.input.right){
						chr.sprite.x -= playerSpeed;
					} else if(game.input.right && !game.input.left){
						chr.sprite.x += playerSpeed;
					}

					if (game.input.up && !game.input.down){
						chr.sprite.y -= playerSpeed;
					} else if(game.input.down && !game.input.up){
						chr.sprite.y += playerSpeed;
					}

					// shoot bullets
					if (game.input.space) {
						if (chr.gameExtras.framesUntilBullet == 0) {
							chr.gameExtras.framesUntilBullet = chr.gameExtras.framesBetweenBullets;
							var bulletChar = CharacterTable.getNewCharacter();
							if (bulletChar != null) initializeBullet(bulletChar, chr);
						}
					}

					// check for collision
					for (var j = 0; j < CharacterTable.characters.length; j++) {
						var chrEnemy = CharacterTable.characters[j]; 
						if (chrEnemy.gameExtras.inUse && chrEnemy.gameExtras.characterType == "enemy") {
							if (chr.sprite.intersect(chrEnemy.sprite)) {
								chr.gameExtras.alive = false;
								chr.sprite.frame ++;
								break;
							}
						}
					}
					
				} else {
					// not alive
					chr.sprite.x += playerFallingSpeedX;
					chr.sprite.y += playerFallingSpeedY;
				}
				break;
			case  "enemy":
				if (chr.gameExtras.alive) {
					chr.sprite.x -= 1;
					if (chr.sprite.x < - chr.sprite.width - 2) CharacterTable.freeCharacter(chr);

					// check for collision with bullets
					for (var j = 0; j < CharacterTable.characters.length; j++) {
						var chrBullet = CharacterTable.characters[j]; 
						if (chrBullet.gameExtras.inUse && chrBullet.gameExtras.characterType == "playerBullet") {
							if (chr.sprite.intersect(chrBullet.sprite)) {
								chr.gameExtras.alive = false;
								chr.sprite.frame ++;
								CharacterTable.freeCharacter(chrBullet);// remove bullet
								break;
							}
						}
					}
				} else {
					// dead enemy
					chr.sprite.x -= enemyFallingSpeedX;
					chr.sprite.y += enemyFallingSpeedY;
					if (chr.sprite.y > game.height) CharacterTable.freeCharacter(chr);
				}
				break;
			case  "playerBullet":
				chr.sprite.x += bulletSpeed;
				if (chr.sprite.x > game.width) CharacterTable.freeCharacter(chr);
			}
		}
	}
}

var game;
var CharacterTable;

window.onload = function() {
	game = new Game(600, 320);
	game.scale = 1.5;
	game.preload('imgs/main.png', 'imgs/bad.png', 'imgs/space.png', 'imgs/bullet.png');
	game.keybind(32, 'space');
	game.fps = 30;

	game.onload = function() {
		CharacterTable = new CharacterTable(500);

		var bg = new Sprite(1280, 320);
		bg.image = game.assets["imgs/space.png"];
		bg.x = 0;
		bg.y = 0;
		game.rootScene.addChild(bg);


		var mainChar = CharacterTable.getNewCharacter();
		mainChar.sprite.frame = 1;
		mainChar.sprite.image = game.assets['imgs/main.png'];
		mainChar.sprite.x = xPos;
		mainChar.sprite.y = yPos;
		mainChar.sprite.width = 20;
		mainChar.sprite.height = 20;
		mainChar.gameExtras.characterType = "player";
		mainChar.gameExtras.alive = true;
		mainChar.gameExtras.framesBetweenBullets = 10;
		mainChar.gameExtras.framesUntilBullet = 0;

		game.addEventListener('enterframe', doFrame);

	}

	game.start();
}

