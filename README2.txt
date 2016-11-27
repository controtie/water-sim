This program is based on eloquent javascript's chapter 7 Electronic Life project. I've hand-coded 
99% of what is in water_sim.js and that's what you should mainly use to gauage my growth as a 
developer. index.html is rather simple and animatewatersim.js + animatewateredge.js were hacked 
together from the animateWorld.js in the Electronic Life  project in order to make presentation 
a bit more polished (i.e. not reading the out of the console). 

Using the program:
1. Just execute index.html on a browser to run it.

2. If you want to choose a different map, just set var mapPlan in water_sim.js to a different 
map of array strings (e.g. circleMap or longAlley).

3. My program is fragile! and sometimes buggy. You can draw your own map and set it to mapPlan,
but make sure that there are no holes at the edges of the map, and don't include any characters 
besides 'X' (wall tile), ' '(space), 'S' SourceTile, or numbers (existing non-source WaterTiles).
Also, keep it in the shape of a square/rectangle.

4.The larger the map (or more accurately the longer the flow distance from source to edge), the 
lower var flowCoefficient needs to be in order for flow to reach the edges. Don't forget to change 
it if necessary!

I'm really happy with this program; it was more or less inspired by the water physics systems in 
minecraft and dwarf fortress. I hope you guys like it too!


