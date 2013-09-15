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

var g_monsterFireCountdown = new Array();
var g_monsterFireMaxTime = 25;
var g_monsterFireMinTime = 1;
var g_monsterProjectiles = new Array();

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
		g_monsters.push(p_monster.create(i, 5, 3));
		g_monsters.push(p_monster.create(i, 4, 3));

		//Bugs.
		g_monsters.push(p_monster.create(i, 3, 2));
		g_monsters.push(p_monster.create(i, 2, 2));

		//Squids.
		g_monsters.push(p_monster.create(i, 1, 1));
		g_monsters.push(p_monster.create(i, 0, 1));

		//Setup the fire countdowns.
		g_monsterFireCountdown[i] = BoundedRandom(g_monsterFireMinTime, g_monsterFireMaxTime);
	}
	g_monsterStartCount = g_monsters.length;
	g_monsterMoveCounter = 22;


	//Start the game!
	setInterval(Main, 1);
}


/**
 * Main game loop.
 */
var Main = function()
{
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

	//Draw all monsters.
	for (var i = 0; i < g_monsters.length; i++)
	{
		switch(g_monsters[i].type)
		{
			case 1: //Round monster, first two rows.
				canvas.fillStyle = "#C80000";
				canvas.fillRect(ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row), g_monsterWidth, g_monsterHeight);
				break;

			case 2: //Bug monster, third and fourth row.
				canvas.fillStyle = "#3366CC";
				canvas.fillRect(ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row), g_monsterWidth, g_monsterHeight);
				break;

			case 3: //Squid monster, fifth and sixth row.
				canvas.fillStyle = "#9933FF";
				canvas.fillRect(ColumnToX(g_monsters[i].column), RowToY(g_monsters[i].row), g_monsterWidth, g_monsterHeight);
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
		g_playerProjectiles[i].y -= g_projectile.moveSpeed * delta;

		//If we're out of bounds, delete us.
		if (g_playerProjectiles[i].y < - 10)
		{
			g_playerProjectiles.splice(i, 1);
			continue;
		}


		//Check to see if we've killed a monster.
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
		g_monsterProjectiles[i].y += g_projectile.moveSpeed * delta;

		//If we're out of bounds, delete us.
		if (g_monsterProjectiles[i].y > g_gameOptions.height + 10)
		{
			g_monsterProjectiles.splice(i, 1);
			continue;
		}
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
