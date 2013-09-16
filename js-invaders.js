/****************************************************************
 ****************************************************************
 ** JS-Invaders!
 **
 ** A very simple (and only mostly complete) space-invaders clone
 ** written as a toy example of HTML5 canvas.
 **
 ** Written by: Stephen Smithbower [smithy.s@gmail.com]
 ** Written on: September 15th, 2013.
 **
 ** Use as you wish!
 **
 **
 ** CONTROLS:
 ** --------------------------------------------------------------
 ** Left/Right Arrow		Move player's ship to the left/right
 ** Spacebar				Fire the player's projectile
 **	r 						Resets the game
 ** Enter 					Instawin (but no extra points)
 **
 *****************************************************************
 *****************************************************************/

/////////////////////////////////
//MISC GLOBALS
/////////////////////////////////
var t_delta = 0;	//Stores the diff in time between the previous frame and the current frame.
var t_lastFrame = Date.now();

var g_canvas = null; //Main canvas object.
var g_ctx = null;	//Canvas context.

var g_gameInterval = null;


var g_keysDown = {}; //Stores all current keypresses.


/////////////////////////////////
//MONSTERS
/////////////////////////////////
var g_monsterSpeed = 0.5;	//How many seconds between monster ticks.
var g_monsterMoveDistance = 4;	//How many pixels horizontally monsters move per tick.

var g_monsters = new Array(); //All active monsters in-game.
var g_monsterWidth = 40;
var g_monsterHeight = 35;
var g_monsterMoveCounter = 0; //Tracks number of ticks before monsters change direction and drop a row.
var g_monsterMoveUpdateCounter = 0; //Tracks s before a monster tick passes.
var g_monsterDirectionFlag = 0;	//0 = right, 1 = left.
var g_monsterHeightOffset = 0; //How many rows down have the monsters dropped.
var g_monsterStartCount = 0; //Number of monsters available at start of game.
var g_monsterAccelerateMultiplier = 0.0065; //How much do monsters speed up as more are killed.
var g_monsterAnimationSwitch = 0; //Track if we're on frame A or B.
var g_monsterExplodeFrames = 2; //How many ticks to keep a dead monster on-screen for.

var g_monsterFireCountdown = new Array(); //One countdown float per column.
var g_monsterFireMaxTime = 25;	//Max 25 seconds before a monster column shoots.
var g_monsterFireMinTime = 1; //Min 1 seconds between monster column shots.
var g_monsterProjectiles = new Array(); //Tracks all monster projectiles.

var g_monsterRoundAnim1Loaded = false;
var g_monsterRoundAnim2Loaded = false;
var g_monsterRoundAnim1Img = null;
var g_monsterRoundAnim2Img = null;
var g_monsterRoundExplodeLoaded = false;
var g_monsterRoundExplodeImg = null;

var g_monsterBugAnim1Loaded = false;
var g_monsterBugAnim2Loaded = false;
var g_monsterBugAnim1Img = null;
var g_monsterBugAnim2Img = null;
var g_monsterBugExplodeLoaded = false;
var g_monsterBugExplodeImg = null;

var g_monsterSquidAnim1Loaded = false;
var g_monsterSquidAnim2Loaded = false;
var g_monsterSquidAnim1Img = null;
var g_monsterSquidAnim2Img = null;
var g_monsterSquidExplodeLoaded = false;
var g_monsterSquidExplodeImg = null;


var p_monster = {
	column: 0,
	row: 0,
	type: -1, //1 = Round, 2 = Bug, 3 = Squid
	state: 1, //1 = Alive, else dead/animating.

	create: function(column, row, type)
		{
			var newMonster = new Object();
			newMonster.column = column;
			newMonster.row = row;
			newMonster.type = type;
			newMonster.state = p_monster.state;

			return newMonster;
		}
};


/////////////////////////////////
//SHIP
/////////////////////////////////
var g_ship = {
	x: 0,
	y: 0,
	moveSpeed: 200, //Pixels to move horizontally per second.
	width: 80,
	height: 35,
	state: 0, //0 = alive, >0 = dead/animating.
	direction: 0, //0 = left, 1 = right.
	countdown: 0 //S until ship makes an appearance.
}

var g_shipImgLoaded = false;
var g_shipImg = null;
var g_shipImgExplodedLoaded = false;
var g_shipImgExploded = null;

var g_maxShipAppearTime = 10; //Maximum interval between appearances in S.
var g_shipMaxExplodeLifetime = 50; //Time to leave exploded ship on-screen.



/////////////////////////////////
//PLAYER
/////////////////////////////////
var g_player = {
	moveSpeed: 200, //Pixels to move horizontally per second.
	x: 50,
	y: 50,
	width: 60,
	height: 40,
	state: 1, //1 = alive, else = dead/animating.
	score: 0
};

var g_playerProjectiles = new Array();
var g_playerMaxProjectiles = 1;
var g_playerWins = false;

var g_playerImgLoaded = false;
var g_playerImg = null;
var g_playerDeathLoaded = false;
var g_playerDeathImg = null;


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
	health: 4, //Number of shots before death.
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
	height: 750
};






/////////////////////////////////
//GAME LOGIC
/////////////////////////////////
/**
 * Init function - gets the whole thing rolling.
 * Loads up required images, inits canvas.
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

	g_monsterRoundExplodeImg = new Image();
	g_monsterRoundExplodeImg.onload = function(){g_monsterRoundExplodeLoaded = true;}
	g_monsterRoundExplodeImg.src = "round_exp.png";

	g_monsterBugExplodeImg = new Image();
	g_monsterBugExplodeImg.onload = function(){g_monsterBugExplodeLoaded = true;}
	g_monsterBugExplodeImg.src = "bug_exp.png";

	g_monsterSquidExplodeImg = new Image();
	g_monsterSquidExplodeImg.onload = function(){g_monsterSquidExplodeLoaded = true;}
	g_monsterSquidExplodeImg.src = "squid_exp.png";

	g_playerImg = new Image();
	g_playerImg.onload = function(){g_playerImgLoaded = true;}
	g_playerImg.src = "player.png";

	g_playerDeathImg = new Image();
	g_playerDeathImg.onload = function(){g_playerDeathLoaded = true;}
	g_playerDeathImg.src = "death.png";

	g_shipImg = new Image();
	g_shipImg.onload = function(){g_shipImgLoaded = true;}
	g_shipImg.src = "ship.png";

	g_shipImgExploded = new Image();
	g_shipImgExploded.onload = function(){g_shipImgExplodedLoaded = true;}
	g_shipImgExploded.src = "ship_exp.png";


	//Canvas related stuff.
	g_canvas = document.createElement('canvas');
	g_ctx = g_canvas.getContext("2d");

	g_canvas.width = g_gameOptions.width;
	g_canvas.height = g_gameOptions.height;

	document.body.appendChild(g_canvas);

	InitGameState();
}

/**
 * Resets all game-state variables.
 */
function InitGameState()
{
	clearInterval(g_gameInterval);

	//Make sure to clear any old state.
	g_monsters = new Array();
	g_playerProjectiles = new Array();
	g_monsterProjectiles = new Array();
	g_monsterFireCountdown = new Array();
	g_blocks = new Array();

	//Set up the player.
	g_player.x = (g_gameOptions.width / 2) - (g_player.width / 2);
	g_player.y = g_gameOptions.height - 80;
	g_player.state = 1;
	g_player.score = 0;
	g_playerWins = false;


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

	g_monsterMoveUpdateCounter = 0;
	g_monsterDirectionFlag = 0;
	g_monsterHeightOffset = 0;


	//Create the blocks.
	var blockOffset = 160;
	CreateBlock(100 - 40, blockOffset);
	CreateBlock(300 - 40, blockOffset);
	CreateBlock(500 - 40, blockOffset);
	CreateBlock(700 - 40, blockOffset);


	//Reset the ship.
	g_ship.state = 0;
	g_ship.direction = 0;
	g_ship.countdown = BoundedRandom(1, g_maxShipAppearTime);


	//Start the game!
	g_gameInterval = setInterval(Main, 20); //Why 20? Less CPU, is fast enough for bullets to track properly.
}


/**
 * Main game loop.
 */
var Main = function()
{
	//Make sure we've loaded all images before starting.
	if (g_monsterRoundAnim1Loaded != true || g_monsterRoundAnim2Loaded != true ||
		g_monsterBugAnim1Loaded != true || g_monsterBugAnim2Loaded != true ||
		g_monsterSquidAnim1Loaded != true || g_monsterSquidAnim2Loaded != true ||
		g_playerImgLoaded != true || g_monsterRoundExplodeLoaded != true || g_playerDeathLoaded != true ||
		g_shipImgLoaded != true || g_shipImgExplodedLoaded != true)
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

	//Draw the player's score.
	canvas.font = "20px Arial";
	canvas.fillStyle = "#FFFFFF";
	canvas.fillText("Score: " + g_player.score, 40, g_gameOptions.height - 20);

	//Draw the player.
	canvas.fillStyle = "#00FF00";
	if (g_player.state == 1)
		canvas.drawImage(g_playerImg, g_player.x, g_player.y);
	else
		canvas.drawImage(g_playerDeathImg, g_player.x, g_player.y);

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
				if (g_monsters[i].state == 1)
					if (g_monsterAnimationSwitch == 0)
						canvas.drawImage(g_monsterRoundAnim1Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
					else
						canvas.drawImage(g_monsterRoundAnim2Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				else
					canvas.drawImage(g_monsterRoundExplodeImg, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				break;

			case 2: //Bug monster, third and fourth row.
				canvas.fillStyle = "#3366CC";
				if (g_monsters[i].state == 1)
					if (g_monsterAnimationSwitch == 0)
						canvas.drawImage(g_monsterBugAnim1Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
					else
						canvas.drawImage(g_monsterBugAnim2Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				else
					canvas.drawImage(g_monsterBugExplodeImg, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				break;

			case 3: //Squid monster, fifth and sixth row.
				canvas.fillStyle = "#9933FF";
				if (g_monsters[i].state == 1)
					if (g_monsterAnimationSwitch == 0)
						canvas.drawImage(g_monsterSquidAnim1Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
					else
						canvas.drawImage(g_monsterSquidAnim2Img, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				else
					canvas.drawImage(g_monsterSquidExplodeImg, ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row));
				break;
		}
	}

	//Render the ship.
	if (g_ship.state == 1)
		canvas.drawImage(g_shipImg, g_ship.x, g_ship.y);
	else
		if (g_ship.state > 1 && g_ship.state < g_shipMaxExplodeLifetime)
			canvas.drawImage(g_shipImgExploded, g_ship.x, g_ship.y);


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


	//If we won, show message!
	if (g_playerWins)
	{
		canvas.font = "100px Arial";
		canvas.fillStyle = "#FFFFFF";
		canvas.fillText("Player Wins!", 120, g_gameOptions.height/2);
	}

	//If we die, show message!
	if (g_player.state == 0)
	{
		canvas.font = "100px Arial";
		canvas.fillStyle = "#FFFFFF";
		canvas.fillText("Player Loses!", 110, g_gameOptions.height/2);
	}
}


/**
 * Perform all logic updates.
 */
var Update = function(delta, canvas)
{	
	/////////////////////////////////
	//CHECK FOR GAME RESET
	/////////////////////////////////
	if (82 in g_keysDown) //r to reset game.
	{
		ResetGame();
		return;
	}

	if (13 in g_keysDown) //Enter to win.
	{
		g_playerWins = true;
		return;
	}


	//Only continue updating if the player is alive!
	if (g_player.state == 0)
		return;


	/////////////////////////////////
	//CHECK FOR GAME WIN
	/////////////////////////////////
	if (g_monsters.length == 0 || g_playerWins) //Win if all the monsters are dead.
	{
		g_playerWins = true;
		return;
	}

	/////////////////////////////////
	//CHECK FOR GAME LOSE
	/////////////////////////////////
	if (g_monsterHeightOffset > 7) //Lose if the monsters get too low.
	{
		g_player.state = 0;
		return;
	}


	/////////////////////////////////
	//MOVE THE PLAYER
	/////////////////////////////////
	if (37 in g_keysDown) //Move the player to the left.
	{
		g_player.x -= g_player.moveSpeed * delta;
	}

	if (39 in g_keysDown) //Move the player to the right.
	{
		g_player.x += g_player.moveSpeed * delta;
	}

	//Make sure the player is in a valid position.
	if (g_player.x < g_player.width / 2)
		g_player.x = g_player.width / 2;
	else
		if (g_player.x > canvas.width - g_player.width * 1.5)
			g_player.x = canvas.width - g_player.width * 1.5;



	/////////////////////////////////
	//PLAYER PROJECTILES
	/////////////////////////////////
	//Check to see if we should create a projectile.
	if (32 in g_keysDown)		//Space - Fire projectile on space.
	{
		if (g_playerProjectiles.length < g_playerMaxProjectiles)
		{
			g_playerProjectiles.push(g_projectile.create(g_player.x + g_player.width / 2,
														 g_player.y + 20,
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
				g_playerProjectiles[i].y >= RowToY(g_monsters[m].row) && g_monsters[m].state == 1)
			{
				//Kill the projectile - kill the monster next update.
				g_playerProjectiles.splice(i, 1);
				g_monsters[m].state++; //Allows us to do death animation.

				//Update player score.
				switch(g_monsters[m].type)
				{
					case 1:
						g_player.score += 10;
						break;

					case 2:
						g_player.score += 20;
						break;

					case 3:
						g_player.score += 40;
						break;
				}

				projDie = true;
				break;
			}
		}


		//Check tp see if we've killed the ship.
		if (projDie)
			continue;
		if (g_ship.state == 1)
			if (g_playerProjectiles[i].x >= g_ship.x &&
				g_playerProjectiles[i].x <= g_ship.x + g_ship.width &&
				g_playerProjectiles[i].y <= g_ship.y + g_ship.height &&
				g_playerProjectiles[i].y >= g_ship.y)
			{
				g_ship.state++; //Death animation.
				g_player.score += 250;	
			}
	}


	/////////////////////////////////
	//MOVE THE MONSTERS
	/////////////////////////////////
	g_monsterMoveUpdateCounter += delta;

	//The fewer monsters that remain, the quicker they tick.
	//Original game had this effect because fewer monster == less drawing == hardware clocked faster.
	//We simulate it because it makes the game more tense.
	if (g_monsterMoveUpdateCounter >= (g_monsterSpeed - ((g_monsterStartCount - g_monsters.length) * g_monsterAccelerateMultiplier))) //Time to update monsters.
	{
		g_monsterMoveUpdateCounter = 0;
		g_monsterAnimationSwitch = (g_monsterAnimationSwitch == 0 ? 1 : 0); //Flip back and forth between animation frames.

		//Delete dead monsters.
		for (var i = 0; i < g_monsters.length; i++)
			if (g_monsters[i].state > 1)
				if (g_monsters[i].state < g_monsterExplodeFrames)
					g_monsters[i].state++;
				else
					g_monsters.splice(i, 1);
		

		//Figure out which direction we're moving.
		if (g_monsterMoveCounter > 44)
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

		//Update the position offset - move us left or right.
		if (g_monsterDirectionFlag == 0)
			g_monsterMoveCounter++;
		else
			g_monsterMoveCounter--;

	}


	/////////////////////////////////
	//MONSTER PROJECTILES
	/////////////////////////////////
	//Each monster column has its own countdown to when it will fire, set at random.
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
				if (g_monsters[m].column == i && g_monsters[m].state == 1) //Make sure not to shoot from dying monsters.
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

	//Update monster projectile movement.
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

		//Check to see if we hit the player.
		if (g_monsterProjectiles[i].x >= g_player.x &&
			g_monsterProjectiles[i].x <= g_player.x + g_player.width &&
			g_monsterProjectiles[i].y <= g_player.y + g_player.height &&
			g_monsterProjectiles[i].y >= g_player.y)
		{
			//Kill the projectile.
			g_monsterProjectiles.splice(i, 1);

			//Update the player state.
			g_player.state = 0;
			break;
		}
	}


	/////////////////////////////////
	//UPDATE THE SHIP
	/////////////////////////////////
	if (g_ship.state > 1 && g_ship.state < g_shipMaxExplodeLifetime)
		g_ship.state++; //Animate the ship if it's dead.

	if (g_ship.state == 0) //0 = hidden, 1 = flying, >1 = dead
		g_ship.countdown -= delta;

	if (g_ship.countdown <= 0 && g_ship.state < 2)
	{
		g_ship.state = 1;

		//Randomly select a direction.
		g_ship.direction = (Math.random() < 0.5) ? 0 : 1;

		if (g_ship.direction == 0)
			g_ship.x = -g_ship.width; //Start the ship offscreen so it "flies" onscreen.
		else
			g_ship.x = g_gameOptions.width + g_ship.width;
		g_ship.y = 10;

		//Randomly select a new time to show up.
		g_ship.countdown = BoundedRandom(1, g_maxShipAppearTime);
	}


	//Move the ship.
	if (g_ship.state == 1)
	{
		if (g_ship.direction == 0)
			g_ship.x += g_ship.moveSpeed * delta;
		else
			g_ship.x -= g_ship.moveSpeed * delta;

		//Check to see if we're off-screen. If this is the case, then we disappear
		//and start counting down again.
		if (g_ship.x < -g_ship.width && g_ship.direction == 1)
			g_ship.state = 0;
		
		if (g_ship.x > g_gameOptions.width && g_ship.direction == 0)
			g_ship.state = 0;
	}
}


/**
 * Converts a monster's column index to an on-screen X position.
 */
function ColumnToX(column)
{
	//15px is the gap between rows.
	return (column * g_monsterWidth) + (column * 15) + 15 + 
		(g_monsterMoveCounter * g_monsterMoveDistance);
}

/**
 * Converts a monster's row index to an on-screen Y position.
 */
function RowToY(row)
{
	return (row * g_monsterHeight) + (row * 30) + 60 +
		   (g_monsterHeightOffset * g_monsterHeight);
}

/**
 * Generates a random number between a min and max value.
 */
function BoundedRandom(min, max)
{
	return (Math.random() * (max - min)) + min;
}

/**
 * Handles damaging a block.
 */
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


/**
 * Creates a block at a given position.
 */
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

/**
 * Resets the game logic. Leaves the current canvas context, does not reload images.
 */
function ResetGame()
{
	clearInterval(g_gameInterval);

	InitGameState();
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