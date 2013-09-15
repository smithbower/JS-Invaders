var t_delta = 0;				//Stores the diff in time between the previous frame and the current frame.
var t_lastFrame = Date.now();

var g_canvas = null;
var g_ctx = null;

var g_keysDown = {};


var g_player = {
	moveSpeed: 500,
	x: 50,
	y: 50
};


var g_gameOptions = {
	width: 800,
	height: 600
};


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
	canvas.fillRect(g_player.x - 30, g_player.y - 20, 60, 40);
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
	if (g_player.x < 30)
		g_player.x = 30;
	else
		if (g_player.x > canvas.width - 30)
			g_player.x = canvas.width - 30;
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
