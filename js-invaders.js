/////////////////////////////////
//MISC GLOBALS
/////////////////////////////////
var t_delta = 0;				//Stores the diff in time between the previous frame and the current frame.
var t_lastFrame = Date.now();

var g_canvas = null;
var g_ctx = null;


var g_keysDown = {};


/////////////////////////////////
//MONSTERS
/////////////////////////////////
var g_monsterSpeed = 0.5;
var g_monsterMoveDistance = 4;

var g_monsters = new Array();
var g_monsterWidth = 40;
var g_monsterHeight = 35;
var g_monsterMoveCounter = 0;
var g_monsterMoveUpdateCounter = 0;
var g_monsterDirectionFlag = 0;
var g_monsterHeightOffset = 0;
var g_monsterStartCount = 0;
var g_monsterAccelerateMultiplier = 0.0065;
var g_monsterAnimationSwitch = 0;

var g_monsterFireCountdown = new Array();
var g_monsterFireMaxTime = 25;
var g_monsterFireMinTime = 1;
var g_monsterProjectiles = new Array();

var g_monsterRoundAnim1Loaded = false;
var g_monsterRoundAnim2Loaded = false;
var g_monsterRoundAnim1Img = null;
var g_monsterRoundAnim2Img = null;

var g_monsterBugAnim1Loaded = false;
var g_monsterBugAnim2Loaded = false;
var g_monsterBugAnim1Img = null;
var g_monsterBugAnim2Img = null;

var g_monsterSquidAnim1Loaded = false;
var g_monsterSquidAnim2Loaded = false;
var g_monsterSquidAnim1Img = null;
var g_monsterSquidAnim2Img = null;

var p_monster = {
	column: 0,
	row: 0,
	type: -1, //0 = Round, 1 = Bug, 2 = Squid

	create: function(column, row, type)
		{
			var newMonster = new Object();
			newMonster.column = column;
			newMonster.row = row;
			newMonster.type = type;

			return newMonster;
		}
};


/////////////////////////////////
//PLAYER
/////////////////////////////////
var g_player = {
	moveSpeed: 200,
	x: 50,
	y: 50,
	width: 60,
	height: 40
};

var g_playerProjectiles = new Array();
var g_playerMaxProjectiles = 1;


/////////////////////////////////
//PROJECTILE
/////////////////////////////////
var g_projectile = {
	moveSpeed: 600,
	x: 0,
	y: 0,

	colour: "#FFFFFF",

	create: function(x, y, colour)
		{
			var newProjectile = new Object();
			if (colour == null)
				newProjectile.colour = g_projectile.colour;
			else
				newProjectile.colour = colour;
			newProjectile.x = x;
			newProjectile.y = y;

			return newProjectile;
		}
};


/////////////////////////////////
//BLOCKS
/////////////////////////////////
var g_blocks = new Array();
var g_block = {
	health: 4,
	x: 0,
	y: 0,
	width: 20,
	height: 20,

	create: function(x, y)
		{
			var newBlock = new Object();
			newBlock.health = g_block.health;
			newBlock.x = x;
			newBlock.y = y;
			newBlock.pixels = new Array(g_block.width);

			for (var x = 0; x < g_block.width; x++)
			{
				newBlock.pixels[x] = new Array(g_block.height);

				for (var y = 0; y < g_block.height; y++)
					newBlock.pixels[x][y] = 1;
			}

			return newBlock;
		}
}



/////////////////////////////////
//GAME
/////////////////////////////////
var g_gameOptions = {
	width: 800,
	height: 850
};






/////////////////////////////////
//GAME LOGIC
/////////////////////////////////
/**
 * Init function - gets the whole thing rolling.
 */
var Init = function()
{
	console.log("Starting JS-Invaders...");

	//Load images.
	g_monsterRoundAnim1Img = new Image();
	g_monsterRoundAnim1Img.onload = function(){g_monsterRoundAnim1Loaded = true;}
	g_monsterRoundAnim1Img.src = "round_1.png";

	g_monsterRoundAnim2Img = new Image();
	g_monsterRoundAnim2Img.onload = function(){g_monsterRoundAnim2Loaded = true;}
	g_monsterRoundAnim2Img.src = "round_2.png";

	g_monsterBugAnim1Img = new Image();
	g_monsterBugAnim1Img.onload = function(){g_monsterBugAnim1Loaded = true;}
	g_monsterBugAnim1Img.src = "bug_1.png";

	g_monsterBugAnim2Img = new Image();
	g_monsterBugAnim2Img.onload = function(){g_monsterBugAnim2Loaded = true;}
	g_monsterBugAnim2Img.src = "bug_2.png";

	g_monsterSquidAnim1Img = new Image();
	g_monsterSquidAnim1Img.onload = function(){g_monsterSquidAnim1Loaded = true;}
	g_monsterSquidAnim1Img.src = "squid_1.png";

	g_monsterSquidAnim2Img = new Image();
	g_monsterSquidAnim2Img.onload = function(){g_monsterSquidAnim2Loaded = true;}
	g_monsterSquidAnim2Img.src = "squid_2.png";


	//Canvas related stuff.
	g_canvas = document.createElement('canvas');
	g_ctx = g_canvas.getContext("2d");

	g_canvas.width = g_gameOptions.width;
	g_canvas.height = g_gameOptions.height;

	document.body.appendChild(g_canvas);


	//Set up the player.
	g_player.x = g_gameOptions.width / 2 - 30;
	g_player.y = g_gameOptions.height - 80;


	//Create the monster array.
	for (var i = 0; i < 11; i++)
	{
		//Rounds.
		g_monsters.push(p_monster.create(i, 5, 1));
		g_monsters.push(p_monster.create(i, 4, 1));

		//Bugs.
		g_monsters.push(p_monster.create(i, 3, 2));
		g_monsters.push(p_monster.create(i, 2, 2));

		//Squids.
		g_monsters.push(p_monster.create(i, 1, 3));
		g_monsters.push(p_monster.create(i, 0, 3));

		//Setup the fire countdowns.
		g_monsterFireCountdown[i] = BoundedRandom(g_monsterFireMinTime, g_monsterFireMaxTime);
	}
	g_monsterStartCount = g_monsters.length;
	g_monsterMoveCounter = 22;


	//Create the blocks.
	var blockOffset = 160;
	CreateBlock(100 - 40, blockOffset);
	CreateBlock(300 - 40, blockOffset);
	CreateBlock(500 - 40, blockOffset);
	CreateBlock(700 - 40, blockOffset);


	//Start the game!
	setInterval(Main, 1);
}


/**
 * Main game loop.
 */
var Main = function()
{
	//Make sure we've loaded all images before starting.
	if (g_monsterRoundAnim1Loaded != true || g_monsterRoundAnim2Loaded != true)
		return;

	//Update time.
	var t_now = Date.now();
	t_delta = t_now - t_lastFrame;
	t_lastFrame = t_now;


	//Update the world.
	Update(t_delta / 1000, g_canvas);


	//Render everything to screen.
	Render(g_ctx);

}



/**
 * Draw everything on-screen.
 */
var Render = function(canvas)
{
	//Clear the canvas.
	canvas.fillStyle = "#000000";
	canvas.fillRect(0, 0, g_gameOptions.width, g_gameOptions.height);

	//Draw the player.
	canvas.fillStyle = "#00FF00";
	canvas.fillRect(g_player.x - g_player.width / 2, g_player.y - g_player.height / 2, g_player.width, g_player.height);

	//Draw the blocks.
	for (var i = 0; i < g_blocks.length; i++)
	{
		for (var x = 0; x < g_block.width; x++)
			for (var y = 0; y < g_block.height; y++)
				if (g_blocks[i].pixels[x][y] == 1)
					canvas.fillRect(g_blocks[i].x + x, g_blocks[i].y + y, 1, 1);
	}

	//Draw the ground.
	canvas.fillRect(0, g_gameOptions.height - 4, g_gameOptions.width, 4);


	//Draw all monsters.
	for (var i = 0; i < g_monsters.length; i++)
	{
		switch(g_monsters[i].type)
		{
			case 1: //Round monster, first two rows.
				canvas.fillStyle = "#C80000";
				if (g_monsterAnimationSwitch == 0)
					canvas.drawImage(g_monsterRoundAnim1Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				else
					canvas.drawImage(g_monsterRoundAnim2Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				break;

			case 2: //Bug monster, third and fourth row.
				canvas.fillStyle = "#3366CC";
				if (g_monsterAnimationSwitch == 0)
					canvas.drawImage(g_monsterBugAnim1Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				else
					canvas.drawImage(g_monsterBugAnim2Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				break;

			case 3: //Squid monster, fifth and sixth row.
				canvas.fillStyle = "#9933FF";
				if (g_monsterAnimationSwitch == 0)
					canvas.drawImage(g_monsterSquidAnim1Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				else
					canvas.drawImage(g_monsterSquidAnim2Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				break;
		}
	}

	//Draw all the player projectiles.
	for (var i = 0; i < g_playerProjectiles.length; i++)
	{
		canvas.beginPath();
		canvas.strokeStyle = g_playerProjectiles[i].colour;
		canvas.lineWidth = 3;
		canvas.moveTo(g_playerProjectiles[i].x, g_playerProjectiles[i].y - 8);
		canvas.lineTo(g_playerProjectiles[i].x, g_playerProjectiles[i].y + 8);
		canvas.stroke();
	}

	//Draw all the monster projectiles.
	for (var i = 0; i < g_monsterProjectiles.length; i++)
	{
		canvas.beginPath();
		canvas.strokeStyle = g_monsterProjectiles[i].colour;
		canvas.lineWidth = 3;
		canvas.moveTo(g_monsterProjectiles[i].x, g_monsterProjectiles[i].y - 8);
		canvas.lineTo(g_monsterProjectiles[i].x, g_monsterProjectiles[i].y + 8);
		canvas.stroke();
	}
}


/**
 * Perform all logic updates.
 */
var Update = function(delta, canvas)
{
	/////////////////////////////////
	//MOVE THE PLAYER
	/////////////////////////////////
	if (37 in g_keysDown)			//Move the player to the left.
	{
		g_player.x -= g_player.moveSpeed * delta;
	}

	if (39 in g_keysDown)			//Move the player to the right.
	{
		g_player.x += g_player.moveSpeed * delta;
	}

	//Make sure the player is in a valid position.
	if (g_player.x < g_player.width / 2)
		g_player.x = g_player.width / 2;
	else
		if (g_player.x > canvas.width - g_player.width / 2)
			g_player.x = canvas.width - g_player.width / 2;

	
	/////////////////////////////////
	//PLAYER PROJECTILES
	/////////////////////////////////
	//Check to see if we should create a projectile.
	if (32 in g_keysDown)		//Fire projectile on space.
	{
		if (g_playerProjectiles.length < g_playerMaxProjectiles)
		{
			g_playerProjectiles.push(g_projectile.create(g_player.x,
														 g_player.y - 20,
														 "#FFFFFF"));
		}
	}

	//Update projectile movement.
	for (var i = 0; i < g_playerProjectiles.length; i++)
	{
		var projDie = false;
		g_playerProjectiles[i].y -= g_projectile.moveSpeed * delta;

		//If we're out of bounds, delete us.
		if (g_playerProjectiles[i].y < - 10)
		{
			g_playerProjectiles.splice(i, 1);
			continue;
		}


		//Check to see if we've hit a block.
		for (var b = 0; b < g_blocks.length; b++)
		{
			if (g_playerProjectiles[i].x >= g_blocks[b].x &&
				g_playerProjectiles[i].x <= g_blocks[b].x + g_block.width &&
				g_playerProjectiles[i].y <= g_blocks[b].y + g_block.height &&
				g_playerProjectiles[i].y >= g_blocks[b].y)
			{
				//Injure the block and the projectile.
				g_playerProjectiles.splice(i, 1);
				HurtBlock(b);
				
				projDie = true;
				break;
			}
		}


		//Check to see if we've killed a monster.
		if (projDie)
			continue;
		for (var m = 0; m < g_monsters.length; m++)
		{
			//Super crude collision detection at the moment.
			if (g_playerProjectiles[i].x >= ColumnToX(g_monsters[m].column) &&
				g_playerProjectiles[i].x <= ColumnToX(g_monsters[m].column) + g_monsterWidth &&
				g_playerProjectiles[i].y <= RowToY(g_monsters[m].row) + g_monsterHeight &&
				g_playerProjectiles[i].y >= RowToY(g_monsters[m].row))
			{
				//Kill the monster and the projectile.
				g_playerProjectiles.splice(i, 1);
				g_monsters.splice(m, 1);

				break;
			}
		}
	}


	/////////////////////////////////
	//MOVE THE MONSTERS
	/////////////////////////////////
	g_monsterMoveUpdateCounter += delta;

	if (g_monsterMoveUpdateCounter >= (g_monsterSpeed - ((g_monsterStartCount - g_monsters.length) * g_monsterAccelerateMultiplier))) //Time to update monsters.
	{
		g_monsterMoveUpdateCounter = 0;
		g_monsterAnimationSwitch = (g_monsterAnimationSwitch == 0 ? 1 : 0);
		

		//Figure out which direction we're moving.
		if (g_monsterMoveCounter > 42)
		{
			g_monsterDirectionFlag = 1;
			g_monsterHeightOffset++;
		}
		else
			if (g_monsterMoveCounter < 1)
			{
				g_monsterDirectionFlag = 0;
				g_monsterHeightOffset++;
			}

		//Update the position offset.
		if (g_monsterDirectionFlag == 0)
			g_monsterMoveCounter++;
		else
			g_monsterMoveCounter--;

	}


	/////////////////////////////////
	//MONSTER PROJECTILES
	/////////////////////////////////
	for (var i = 0; i < g_monsterFireCountdown.length; i++)
	{
		g_monsterFireCountdown[i] -= delta;

		if (g_monsterFireCountdown[i] < 0)
		{
			//Reset for next shot.
			g_monsterFireCountdown[i] = BoundedRandom(g_monsterFireMinTime, g_monsterFireMaxTime);

			//Find the appropriate monster to shoot from. Is this very slow? Yes. Do we care? Not really.
			var lowestMonster = -1; //-1 means no monster found.
			for (var m = 0; m < g_monsters.length; m++)
			{
				if (g_monsters[m].column == i)
				{
					if (lowestMonster == -1)
						lowestMonster = m;
					else
						if (g_monsters[m].row > g_monsters[lowestMonster].row)
							lowestMonster = m;
				}
			}

			//Fire from this monster.
			if (lowestMonster > -1)
			{
				var projColour = "#FFFFFF";
				switch(g_monsters[lowestMonster].type)
				{
					case 1:
						projColour = "#C80000";
						break;

					case 2:
						projColour = "#3366CC";
						break;

					case 3:
						projColour = "#9933FF";
						break;
				}

				g_monsterProjectiles.push(g_projectile.create(ColumnToX(g_monsters[lowestMonster].column) + (g_monsterWidth / 2),
														  	RowToY(g_monsters[lowestMonster].row) + 20,
														  	projColour));
			}
		}
	}

	//Update projectile movement.
	for (var i = 0; i < g_monsterProjectiles.length; i++)
	{
		var projDie = false;
		g_monsterProjectiles[i].y += g_projectile.moveSpeed * delta;

		//If we're out of bounds, delete us.
		if (g_monsterProjectiles[i].y > g_gameOptions.height + 10)
		{
			g_monsterProjectiles.splice(i, 1);
			continue;
		}

		//Check to see if we've hit a block.
		for (var b = 0; b < g_blocks.length; b++)
		{
			if (g_monsterProjectiles[i].x >= g_blocks[b].x &&
				g_monsterProjectiles[i].x <= g_blocks[b].x + g_block.width &&
				g_monsterProjectiles[i].y <= g_blocks[b].y + g_block.height &&
				g_monsterProjectiles[i].y >= g_blocks[b].y)
			{
				//Injure the block and the projectile.
				g_monsterProjectiles.splice(i, 1);
				HurtBlock(b);
				
				projDie = true;
				break;
			}
		}

		if (projDie)
			continue;
	}
}



function ColumnToX(column)
{
	return (column * g_monsterWidth) + (column * 15) + 15 + 
		(g_monsterMoveCounter * g_monsterMoveDistance);
}

function RowToY(row)
{
	return (row * g_monsterHeight) + (row * 30) + 60 +
		   (g_monsterHeightOffset * g_monsterHeight);
}

function BoundedRandom(min, max)
{
	return (Math.random() * (max - min)) + min;
}

function HurtBlock(block)
{
	g_blocks[block].health--;
	//Update the graphic, and remove if dead.
	if (g_blocks[block].health == 0)
		g_blocks.splice(block, 1);
	else
		for (var j = 0; j < (g_block.width * g_block.height / g_block.health); j++)
		{
			remove: while(true)
			{
				var dx = BoundedRandom(0, g_block.width) | 0; //Cast to int.
				var dy = BoundedRandom(0, g_block.height) | 0;

				if (g_blocks[block].pixels[dx][dy] == 0)
					continue remove;

				g_blocks[block].pixels[dx][dy] = 0;
				break;
			}

		}
}


function CreateBlock(x, y)
{
	g_blocks.push(g_block.create(x, g_gameOptions.height - y));
	g_blocks.push(g_block.create(x, g_gameOptions.height - y - g_block.height));
	g_blocks.push(g_block.create(x, g_gameOptions.height - y - g_block.height * 2));
	g_blocks.push(g_block.create(x + g_block.width, g_gameOptions.height - y - g_block.height));
	g_blocks.push(g_block.create(x + g_block.width, g_gameOptions.height - y - g_block.height * 2));
	g_blocks.push(g_block.create(x + g_block.width * 2, g_gameOptions.height - y - g_block.height));
	g_blocks.push(g_block.create(x + g_block.width * 2, g_gameOptions.height - y - g_block.height * 2));
	g_blocks.push(g_block.create(x + g_block.width * 3, g_gameOptions.height - y));
	g_blocks.push(g_block.create(x + g_block.width * 3, g_gameOptions.height - y - g_block.height));
	g_blocks.push(g_block.create(x + g_block.width * 3, g_gameOptions.height - y - g_block.height * 2));
}

function RenderAnim(x, y, anim, canvas)
{
	//Note - we have to flip the coords because javascript is
	//flipping row-major and column-major blah blah blah.
	var dy = anim.length;
	var dx = anim[0].length;

	for (var ix = 0; ix < dx; ix++)
		for (var iy = 0; iy < dy; iy++)
		{
			if (anim[iy][ix] == 1)
				canvas.fillRect(x + ix, y + iy, 1, 1);
		}
}


/**
 * Manages tracking all keydown events (key presses).
 */
addEventListener("keydown", 
	function (e)
	{
		g_keysDown[e.keyCode] = true;
	}, false
);

/**
 * Cancels all keypresses (keyup events).
 */
addEventListener("keyup",
	function (e)
	{
		delete g_keysDown[e.keyCode];
	}, false
);