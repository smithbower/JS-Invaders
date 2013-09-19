JS-Invaders
===========

A very simple implementation of Space Invaders using pure Javascript and Canvas.

This software is provided as-is without warrenty. Feel free to slice, dice,
and otherwise transform the code as much as you like for your purposes
(though as always, credit is appreciated).

===========
Controls
===========
Left/Right arrow - move the player's ship horizontally.
Spacebar - player fires a projectile.
r - reset the game
enter - instawin (this was for debugging purposes)

===========
Issues
===========
Collision detection is crap. The code just checks to see if the projectile
(treated as a point but drawn as a line) is within the boundingbox of a
monster. This doesn't really affect gameplay much, and I'm not super interested
in fixing things, but it's good to be aware of.




Have fun!
- Stephen
