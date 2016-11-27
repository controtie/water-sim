//Water physics simulator 2000!
//1. mapPlan is a simple map to flood.
//2. The numbers on the map indicate the depth of water on a given tile rounded to the nearest integer.
//3. 'X' Tiles are walls, 'S' tiles are water source tiles with an unchanging depth of 9, ' ' tiles are empty, and numbered tiles are water tiles.
//4. Every tile on the grid is discrete. It has its own input and outflow to the tiles around it.
//5. Every tile is referenced by using Vector object which holds the coordinates of the desired tile.

//This map will be kept in an array of arrays.
//coordinates go like this:
//   0 1 2 3 4 5 6 7
// 0
// 1
// 2       X
// 3
// 4
// 5
//object'X' is at [2][3]. 
//To move left and right, add and subtract from second array,
//To move up and down, add and subtract from the first array.

//Tiles are updated based on creationList/procedure. Creation list holds all known creations, procedure holds the one we're working on right now.
//Tiles which are created in the same 'tick' or turn are placed in the same array within creationList, and are eventually pushed to procedure to be worked on.


var circleMap = ['XXXXXXXXXXXXXXXXXXXXX',                  //Smaller maps can have larger flowCoefficient (1.4 - 1.7ish)
                 'XXXXXX         XXXXXX',
                 'XXXX             XXXX',
                 'XX                 XX',
                 'X                   X',
                 'X         S         X',
                 'X                   X',
                 'XX                 XX',
                 'XXXX             XXXX',
                 'XXXXXX         XXXXXX',
                 'XXXXXXXXXXXXXXXXXXXXX'];

var eyeOfSauron = ['XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',                  //Smaller maps can have larger flowCoefficient (1.4 - 1.7ish)
                   'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                   'XXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXXXXXXXX',
                   'XXXXXXXXXXXXXXX                               XXXXXXXXXXXXXXX',
                   'XXXXXXXXXXXXX                                   XXXXXXXXXXXXX',
                   'XXXXXXXXXXX                                       XXXXXXXXXXX',
                   'XXXXXXXX                                             XXXXXXXX',
                   'XXXXXX                                                 XXXXXX',
                   'XXXXX                                                   XXXXX',
                   'XXXX                                                     XXXX',
                   'XXX                                                       XXX',
                   'XXX                                                       XXX',
                   'XX                                                         XX',
                   'XX                                                         XX',
                   'XX                                                         XX',
                   'XX                            S                            XX',
                   'XX                                                         XX',
                   'XX                                                         XX',
                   'XX                                                         XX',
                   'XXX                                                       XXX',
                   'XXXX                                                     XXXX',
                   'XXXXX                                                   XXXXX',
                   'XXXXXX                                                 XXXXXX',
                   'XXXXXXXX                                             XXXXXXXX',
                   'XXXXXXXXXX                                         XXXXXXXXXX',
                   'XXXXXXXXXXXX                                     XXXXXXXXXXXX',
                   'XXXXXXXXXXXXXXXX                             XXXXXXXXXXXXXXXX',
                   'XXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXXXX',
                   'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                   'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'];

var longAlley = ['XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',      //When using maps with long travel distance, decrease var flowCoefficient. (0.9- 1.1ish)
                 'X                              X',
                 'XS                             X',
                 'XXXXXXXXXXXXXXXXXXXXXXXXX      X',
                 'XS                             X',
                 'X                              X',
                 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'];

var simpleLab = ['XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',  //This one can use 1.20 coefficient.
      			     'X                     S    XXXXXXXXX',
			           'X     XXXXXXXXXX            XXXX   X',
			           'X             XX            XX     X',
			           'X             XX                   X',
			           'X             XX                   X',
		  	         'XXXXXXXX      XXXXXXXXXXXXXXXX     X',
			           'XS                XX         X     X',
                 'X                 XX         X     X',
                 'X                 XX         X     X',
                 'X                 XX         X     X',
                 'X                 XX               X',
                 'X                 XX               X',
			           'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'];

var mapPlan = simpleLab;      //****Assign the map you want to use here.****
var flowCoefficient = 1.2;   //decreasing this number increases the total distance water can flow from source tile.

//********************************************************* CODE *****************************************************************************

var procedure = [];           //This array is filled with an array of vectors corresponding the tiles to be updated on the next 'turn'.
var creationList = [];        //This array of arrays holds all known created waterTiles.
var firstCreation = [];       //This holds all waterSource tiles read from the mapPlan.

var waterWorld = new Grid(mapPlan);
var waterList = '123456789';        

function Vector(x, y) {       //The coordinate system for referencing tiles.
	this.x = x;
	this.y = y;
}
Vector.prototype.plus = function(addend) {
	var x = addend.x + this.x;
	var y = addend.y + this.y; 
	return new Vector(x, y);
}

function Grid(map) {              //The main constructor for the world object.
	var width = map[0].length;
  var height = map.length;
  this.space = new Array(height);   //Makes an empty array ready to hold elements, e.g. WaterTiles, SourceTiles, WallTiles, open (null) tiles.
	for (var i = 0; i < height; i++)   	 	
		this.space[i] = new Array(width);
	this.width = width;
	this.height = height;
}
Grid.prototype.get = function(vector) {           //Returns a value at a given vector coordinate.
	return this.space[vector.y][vector.x];
}
Grid.prototype.set = function(vector, value) {    //Sets a value at a given vector coordinate.
	this.space[vector.y][vector.x] = value;
}
Grid.prototype.translateFromMap = function(map) { //Translates the given 'mapPlan' to grid elements like WallTile or SourceTile.
    for (var y = 0; y < map.length; y++) {        //Ideally, this function only runs once everytime the program is executed.
		for (var x = 0; x < map[0].length; x++) {
            if (map[y].charAt(x) == ' ') 
				this.space[y][x] = null;
            if (map[y].charAt(x) == 'X') 
				this.space[y][x] = new WallTile(new Vector(x, y));
             if (map[y].charAt(x) == 'S')  {
             	this.space[y][x] = new SourceTile(new Vector(x, y));
             	firstCreation.push(new Vector(x, y));
             }
            if (waterList.indexOf(map[y].charAt(x)) != -1) { 
                var depth = Number(map[y].charAt(x));
                var tile = new WaterTile(new Vector(x, y), depth); 
				this.space[y][x] = tile;
            }
		}
    }
    procedure.push(firstCreation);              //The first set of coordinates we're gonna work on.
    creationList.push(firstCreation);           //The first set of tiles to be pushed to the list of all created tiles.
}

Grid.prototype.translateToMap = function() {    //This prints out the current state of the world map as a string.
	var string = '';
	for (var y = 0; y < this.height; y++) { 
		for (var x = 0; x < this.width; x++) { 
          var tile = this.get(new Vector(x, y));
          if (tile == null)
		  string += ' ';
          if (tile instanceof WaterTile)
          string += tile.intDepth;
          if (tile instanceof WallTile)
          string += '~';
          if (tile instanceof SourceTile)
          string += '*';
        }
	string += '\n';
    }
  //console.log(string);
  return string;
}

var directions = {
  'n': new Vector( 0, -1),
  'ne':new Vector( 1, -1), //north east
  'e': new Vector( 1,  0), //east
  'se': new Vector( 1,  1), //south east
  's': new Vector( 0,  1), //south
  'sw': new Vector(-1,  1), //south west
  'w': new Vector(-1,  0), //west
  'nw': new Vector(-1, -1)  //northwest
}

function setCall(set, callback) {     //Give this arrays of things to test for. Callback is an anonymous function to test for.
        return callback(set);
}

function removeDuplicates(procedure) {
  var cleanSet = [];                                    //This array holds VECTOR OBJECTS which can actually be worked on. It will have all duplicates removed.
  var rawSet = [];                                      //This array holds STRINGS of coordinates. Used to check against 'procedure' to remove duplicates.
  for (var j = 0; j < procedure[0].length; j++) {       //Removes duplicates, a little obfuscating, checks against their strings
      if (rawSet.indexOf([procedure[0][j].x, procedure[0][j].y].toString()) == -1) {
            cleanSet.push(procedure[0][j]);
            rawSet.push([procedure[0][j].x, procedure[0][j].y].toString());
      }
    }
  return cleanSet;
}

Grid.prototype.tick = function (procedure) {            //Everytime this is executed, the array in procedure will be executed.
    var addedSet = [];                                  //This set holds all newly created/updated tiles from WaterTile.prototype.flow.
    var workingSet = removeDuplicates(procedure);
	for (var i = 0; i < workingSet.length; i++) {
        this.get(workingSet[i]).flow(addedSet);
	}
    procedure.shift();
  if (procedure.length == 0 && addedSet.length > 0) {   //Only pushes NEWLY CREATED waterTiles to creationList and procedure.
      procedure.push(addedSet);                         //WaterTiles that are only 'updated' are not pushed to creationList.
  	  creationList.push(addedSet);
  }
    if (addedSet.length <= 0)
      for (var i = 0; i < creationList.length; i++) {   //If there is no newly created set of waterTiles, populate procedure with the creationList.
      procedure.push(creationList[i]);
    }
}

Grid.prototype.showEdge = function (procedure) {    //Very similar to Grid.prototype.translateToMap(), only difference is it writes out the working set as '.'                                
    var workingSet = removeDuplicates(procedure);   //This returns a set of vector objects.

    var rawSet = setCall(workingSet, function(set) {
      var passingSet = [];
      for (var t = 0; t < set.length; t++) {
        passingSet.push([set[t].x, set[t].y].toString());  //We convert the vectors in workingSet into strings of coordinates so we can check against them
      }                                                    //as we read the grid object. If there's a match, that grid is being worked on, and is replaced with
      return passingSet;                                   //a '.' symbol.
    })

    var string = '';
	  for (var y = 0; y < this.height; y++) { 
		  for (var x = 0; x < this.width; x++) {
          if (rawSet.indexOf([x, y].toString()) != -1) {  //If in working set, push '.' and continue.
              string+= '.';
          	  continue;
          }
          var tile = this.get(new Vector(x, y));
          if (tile == null)
		        string += ' ';
          if (tile instanceof WaterTile)
            string += tile.intDepth;
          if (tile instanceof WallTile)
            string += '~';
          if (tile instanceof SourceTile)
            string += '*';
        }
	string += '\n';
    }
  return string;
}

function WallTile(vector) {
	this.vector = vector;
	this.x = vector.x;
	this.y = vector.y;
}

function WaterTile(vector, depth) {
	this.depth = depth;
	this.intDepth = Math.round(this.depth);               //Rounded to closest integer for map representation.
	this.x = vector.x;
	this.y = vector.y;
  this.vector = vector;
	this.grid = waterWorld;
}

WaterTile.prototype.flow = function(set) { 
	var adj = this.checkAdjacent();                      //Checks and returns adjacent tiles which have lower depth properties.
    var dChanges = [];
  for (var each in adj) {                              //'each' holds a vector property and a value property.
    if (adj.hasOwnProperty(each)) {
      var depthChange = (this.depth - adj[each].value)/2;
      depthChange = Math.round(10*depthChange)/10;     //Rounds depth to the tenths place.
      if (depthChange <= 0)
        continue;
      this.grid.set(adj[each].vector, new WaterTile(adj[each].vector, 
      adj[each].value + depthChange/flowCoefficient));
      dChanges.push(depthChange);}              //Used to calculate flow outwards from a given tile e.g. tile 'a' loses a little water flowing to empty tile 'b'
      set.push(adj[each].vector);
  }
  var outFlow = 0;
  if (dChanges.length > 0) {
     for (var i = 0; i < dChanges.length; i++) {      //Calculates the average of the depthChanges.
  	     outFlow += dChanges[i];
     }
     outFlow = Math.floor((outFlow/dChanges.length)/2);
     if (this instanceof WaterTile)                   //Only draws water away from water Tiles (i.e. NOT SourceTiles)
     this.depth = this.depth - outFlow;
  }
}

WaterTile.prototype.checkAdjacent = function() {
	var x = this.x;
	var y = this.y;
	var adjacent = [];                                 //Populated with a series of objects. It contains their direction And their depth level.
	for (var dir in directions) {		                   //each var dir is a separate vector. If I add these vectors to the original, Ill have the new position I want to query.	
        var plusVector = this.vector.plus(directions[dir]);
        var target = this.grid.get(plusVector);      //Whats getting set to target here should either be a wall, empty tile, or a water tile.
        if (target == null) {
			adjacent.push({vector: plusVector, value: 0});
            continue;}
		if (target.depth && target.depth < this.depth)
			adjacent.push({vector: plusVector, value: target.depth});
	}
	return adjacent;
}

function SourceTile(vector) {           //I'm sure there's a better way to do this...
  WaterTile.call(this, vector, 9);
}
SourceTile.prototype.flow = WaterTile.prototype.flow;
SourceTile.prototype.checkAdjacent = WaterTile.prototype.checkAdjacent;


//Executing code to create the world.
waterWorld.translateFromMap(mapPlan);



