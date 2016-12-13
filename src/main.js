var game = new Phaser.Game(984, 672, Phaser.AUTO, 'tetris',
			   { preload: preload,
			     create: create,
			     update: update ,
			     render: render });

function preload() {
    game.load.image('tile_0',  'assets/img/whitetile.png'); // 0 (void)
    game.load.image('tile_8',   'assets/img/greytile.png'); // 8 (wall)
    game.load.image('tile_1',   'assets/img/bluetile.png'); // 1
    game.load.image('tile_2',  'assets/img/greentile.png'); // 2
    game.load.image('tile_3',  'assets/img/lbluetile.png'); // 3
    game.load.image('tile_4', 'assets/img/orangetile.png'); // 4
    game.load.image('tile_5', 'assets/img/purpletile.png'); // 5
    game.load.image('tile_6',    'assets/img/redtile.png'); // 6
    game.load.image('tile_7', 'assets/img/yellowtile.png'); // 7

    game.load.image('btn', 'assets/img/playbutton.png');
}
// position of the tetris grid
var ox = 300;
var oy = 0;

var score = 0;

// type of tetriminos (the one that is falling now and the next one)
var next_tet_to_spawn = rand_tet();
var tet_spawned = next_tet_to_spawn;

var game_state = Object.freeze({
    MENU: 0,
    TET_TO_SPAWN: 1,
    TET_TO_FALL: 2
});
var state = game_state.MENU;

// position and orientation of the falling tetriminos
var tet_ox = 4;
var tet_oy = 3;
var tet_orientation = 0;

// tetris grid
var map = [
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,0,0,0,0,0,0,0,0,0,0,8],
    [8,8,8,8,8,8,8,8,8,8,8,8],
];

// tetris grid with only the falling tetriminos
var tet_only_map = [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
];

// images grid
var images = [
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12)
];

// to handle inputs
var downKey;
var leftKey;
var rightKey;
var spaceKey;
var button;

// time of the next tetriminos falling/spawn
var next_fall = 0;

// time when we can accept another user action
var next_action = 0;

function create() {
    game.stage.backgroundColor = '#000';
    for(var x = 0; x < 12; ++x)
	for(var y = 0; y < 21; ++y)
	    images[y][x] = game.add.sprite(0, 0, 'tile_3');
    draw_map(ox, oy, map);

    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    button = game.add.button(-10, 20, 'btn', actionOnClick, this, 2, 1, 0);
}

function actionOnClick () {
    state = game_state.TET_TO_SPAWN;
    button.visible = false;
}

function update() {
    if(state != game_state.MENU) {
	var need_drawing = false;
	var new_spawn = false;
	if(downKey.isDown && game.time.now > next_action) {
	    if(state == game_state.TET_TO_FALL) {
		tet_fall();
		next_action = game.time.now + 100;
		need_drawing = true;
	    }
	}
	else if(leftKey.isDown && game.time.now > next_action) {
	    tet_left();
	    next_action = game.time.now + 200;
	    need_drawing = true;
	}
	else if(rightKey.isDown && game.time.now > next_action) {
	    tet_right();
	    next_action = game.time.now + 200;
	    need_drawing = true;
	}
	else if(spaceKey.isDown && game.time.now > next_action) {
	    tet_rotate();
	    next_action = game.time.now + 200;
	    need_drawing = true;
	}
	if(landing(map, tet_only_map))
	    state = game_state.TET_TO_SPAWN;
	else
	    state = game_state.TET_TO_FALL;
	if(game.time.now > next_fall) {
	    if(state == game_state.TET_TO_SPAWN) {
		new_spawn = true;
		need_drawing = true;
	    }
	    else if(state == game_state.TET_TO_FALL) {
		tet_fall();
		need_drawing = true;
	    }
	    next_fall = game.time.now + 500;
	}
	if(landing(map, tet_only_map))
	    state = game_state.TET_TO_SPAWN;
	if(need_drawing == true) {
	    if(new_spawn) {
		check_full_lines(map);
		tet_spawn();
	    }
	    draw_map(ox, oy, map);
	}
    }
}

function render() {
    this.game.debug.text('SCORE: '+score, 10, 14, 'red', 'Segoe UI');
    this.game.debug.text('Keys', 700, 14, 'red', 'Segoe UI');
    this.game.debug.text('----', 700, 22, 'red', 'Segoe UI');
    this.game.debug.text('Space: rotate', 700, 30, 'red', 'Segoe UI');
    this.game.debug.text('Down : go down quicker', 700, 42, 'red', 'Segoe UI');
    this.game.debug.text('Left : go left', 700, 54, 'red', 'Segoe UI');
    this.game.debug.text('Right: go right', 700, 66, 'red', 'Segoe UI');
}

function check_full_lines(map) {
    for(var y = 0; y < 20; ++y) {
	var hole = false;
	for(var x = 1; x < 11; ++x) {
	    if(map[y][x] == 0) {
		hole = true;
		break;
	    }
	}
	if(!hole) {
	    collapse(map, y);
	    score+=1;
	}
    }
}

function collapse(map, row) {
    for(var y = row; y > 0; --y)
	for(var x = 1; x < 11; ++x)
	    map[y][x] = map[y-1][x];
}

function tet_spawn() {
    undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
    tet_ox = 4;
    tet_oy = 3;
    draw_tet(tet_ox, tet_oy, tet_only_map, next_tet_to_spawn, next_tet_to_spawn, tet_orientation);
    undraw_tet(tet_ox, tet_oy, map, next_tet_to_spawn, next_tet_to_spawn, tet_orientation);
    if(collide(map, tet_only_map)) {
	game_over();
    }
    else {
	draw_tet(tet_ox, tet_oy, map, next_tet_to_spawn, next_tet_to_spawn, tet_orientation);
	tet_spawned = next_tet_to_spawn;
	next_tet_to_spawn = rand_tet();
	state = game_state.TET_TO_FALL;
    }
}

function game_over() {
    state = game_state.MENU;
    score = 0;
    button.visible = true;
    clean_board();
}

function clean_board() {
    for(var x = 1; x < 11; ++x)
	for(var y = 0; y < 20; ++y) {
	    map[y][x] = 0;
	    tet_only_map[y][x] = 0;
	}	    
}

function tet_rotate() {
    undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
    undraw_tet(tet_ox, tet_oy, map, tet_spawned, tet_orientation);
    tet_orientation_rotate();
    draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
    if(collide(map, tet_only_map)) {
	undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
	tet_orientation_rotate_undo();
	draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
	draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
    }
    else
	draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
}

function tet_orientation_rotate() {
    tet_orientation += 1;
    if(tet_orientation > 3)
	tet_orientation = 0;
}

function tet_orientation_rotate_undo() {
    tet_orientation_rotate();
    tet_orientation_rotate();
    tet_orientation_rotate();
}

function tet_left() {
    undraw_tet(tet_ox, tet_oy, map, tet_spawned, tet_orientation);
    undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
    tet_xy_move_left();
    draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
    if(collide(map, tet_only_map)) {
	undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
	tet_xy_move_left_undo();
	draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
	draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
    }
    else
	draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
}

function tet_right() {
    undraw_tet(tet_ox, tet_oy, map, tet_spawned, tet_orientation);
    undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
    tet_xy_move_right();
    draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
    if(collide(map, tet_only_map)) {
	undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
	tet_xy_move_right_undo();
	draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
	draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
    }
    else
	draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
}

function tet_fall() {
    undraw_tet(tet_ox, tet_oy, map, tet_spawned, tet_orientation);
    undraw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_orientation);
    tet_oy += 1;
    draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
    draw_tet(tet_ox, tet_oy, tet_only_map, tet_spawned, tet_spawned, tet_orientation);
}

function landing(map, tet_only_map) {
    undraw_tet(tet_ox, tet_oy, map, tet_spawned, tet_orientation);
    for(var x = 0; x < 12; ++x)
	for(var y = 0; y < 21; ++y)
	    if(tet_only_map[y][x] != 0 && map[y+1][x] != 0) {
		draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
		return true;
	    }
    draw_tet(tet_ox, tet_oy, map, tet_spawned, tet_spawned, tet_orientation);
    return false;
}

function collide(map, tet_only_map) {
    for(var x = 0; x < 12; ++x)
	for(var y = 0; y < 21; ++y)
	    if(map[y][x] != 0 && tet_only_map[y][x] != 0)
		return true;
    return false;
}


function tet_xy_move_left() {
    tet_ox -= 1;
}

function tet_xy_move_left_undo() {
    tet_ox += 1;
}

function tet_xy_move_right() {
    tet_ox += 1;
}

function tet_xy_move_right_undo() {
    tet_ox -= 1;
}

function tet_xy_move_down() {
    tet_oy += 1;
}

function tet_xy_move_down_undo() {
    tet_oy -= 1;
}

var images = [
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12),
    new Array(12)
];

function draw_map(ox, oy, map) {
    for(var x = 0; x < 12; ++x)
	for(var y = 0; y < 21; ++y) {
	    images[y][x].destroy();
	    images[y][x] = game.add.sprite(x*32+ox, y*32+oy, 'tile_'+String(map[y][x]));
	}
}

function rand_tet() {
    return Math.floor(Math.random() * 7) + 1;
}

function undraw_tet(ox, oy, map, n, orientation) {
    draw_tet(ox, oy, map, n, 0, orientation);
}

function draw_tet(ox, oy, map, n, texture, orientation) {
    if(n == 1)
	draw_tet_J(ox, oy, map, texture, orientation);
    else if(n == 2)
	draw_tet_S(ox, oy, map, texture, orientation);
    else if(n == 3)
	draw_tet_I(ox, oy, map, texture, orientation);
    else if(n == 4)
	draw_tet_L(ox, oy, map, texture, orientation);
    else if(n == 5)
	draw_tet_T(ox, oy, map, texture, orientation);
    else if(n == 6)
	draw_tet_Z(ox, oy, map, texture, orientation);
    else if(n == 7)
	draw_tet_O(ox, oy, map, texture, orientation);
}

function draw_tet_J(ox, oy, map, texture, orientation) {
    if(orientation == 0) {
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy]   [ox+2] = texture;
	map[oy+1] [ox+2] = texture;
    }
    else if(orientation == 1) {
	map[oy-1] [ox+1] = texture;
	map[oy]   [ox+1] = texture;
	map[oy+1] [ox+1] = texture;
	map[oy+1] [ox]   = texture;
    }
    else if(orientation == 2) {
	map[oy]   [ox]   = texture;
	map[oy+1] [ox]   = texture;
	map[oy+1] [ox+1] = texture;
	map[oy+1] [ox+2] = texture;
    }
    else if(orientation == 3) {
	map[oy-1] [ox]   = texture;
	map[oy-1] [ox+1] = texture;
	map[oy]   [ox]   = texture;
	map[oy+1] [ox]   = texture;
    }
}
function draw_tet_S(ox, oy, map, texture, orientation) {
    if(orientation == 0 || orientation == 2) {
	map[oy]   [ox+1] = texture;
	map[oy]   [ox+2] = texture;
	map[oy+1] [ox]   = texture;
	map[oy+1] [ox+1] = texture;
    }
    else if(orientation == 1 || orientation == 3) {
	map[oy-1] [ox]   = texture;
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy+1] [ox+1] = texture;
    }
}
function draw_tet_I(ox, oy, map, texture, orientation) {
    if(orientation == 0 || orientation == 2) {
	map[oy] [ox]   = texture;
	map[oy] [ox+1] = texture;
	map[oy] [ox+2] = texture;
	map[oy] [ox+3] = texture;
    }
    else if(orientation == 1 || orientation == 3) {
	map[oy-3] [ox+1] = texture;
	map[oy-2] [ox+1] = texture;
	map[oy-1] [ox+1] = texture;
	map[oy]   [ox+1] = texture;
    }
}
function draw_tet_L(ox, oy, map, texture, orientation) {
    if(orientation == 0) {
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy]   [ox+2] = texture;
	map[oy+1] [ox]   = texture;
    }
    else if(orientation == 1) {
	map[oy-1] [ox]   = texture;
	map[oy-1] [ox+1] = texture;
	map[oy]   [ox+1] = texture;
	map[oy+1] [ox+1] = texture;
    }
    else if(orientation == 2) {
	map[oy+1] [ox]   = texture;
	map[oy+1] [ox+1] = texture;
	map[oy+1] [ox+2] = texture;
	map[oy]   [ox+2] = texture;
    }
    else if(orientation == 3) {
	map[oy-1] [ox]   = texture;
	map[oy]   [ox]   = texture;
	map[oy+1] [ox]   = texture;
	map[oy+1] [ox+1] = texture;
    }
}
function draw_tet_T(ox, oy, map, texture, orientation) {
    if(orientation == 0) {
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy]   [ox+2] = texture;
	map[oy-1] [ox+1] = texture;
    }
    else if(orientation == 1) {
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy-1] [ox]   = texture;
	map[oy+1] [ox]   = texture;
    }
    else if(orientation == 2) {
	map[oy]   [ox+1] = texture;
	map[oy-1] [ox]   = texture;
	map[oy-1] [ox+1] = texture;
	map[oy-1] [ox+2] = texture;
    }
    else if(orientation == 3) {
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy-1] [ox+1] = texture;
	map[oy+1] [ox+1] = texture;
    }
}
function draw_tet_Z(ox, oy, map, texture, orientation) {
    if(orientation == 0 || orientation == 2 ) {
	map[oy]   [ox]   = texture;
	map[oy]   [ox+1] = texture;
	map[oy+1] [ox+1] = texture;
	map[oy+1] [ox+2] = texture;
    }
    else if(orientation == 1 || orientation == 3) {
	map[oy-1] [ox+1] = texture;
	map[oy]   [ox+1]   = texture;
	map[oy]   [ox] = texture;
	map[oy+1] [ox] = texture;
    }
}
function draw_tet_O(ox, oy, map, texture, orientation) {
    map[oy]   [ox]   = texture;
    map[oy]   [ox+1] = texture;
    map[oy+1] [ox]   = texture;
    map[oy+1] [ox+1] = texture;
}