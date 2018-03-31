var connect4App = angular.module('connect4App', []);
var $topDisk = jQuery("#connect4block-top-disk");
var $connect4board = jQuery("#connect4block-board");

connect4App.controller('Connect4Controller', function Connect4Controller($scope, $parse, $http) {
    $scope.default_player = {
        name: '',
        color: '',
        type: 'user'
    }

    $scope.config = {
        board_top_size: {
            width: 500,
            height: 80
        },
        board: {
            row: 6,
            col: 7
        },
        colors: ['red', 'yellow'],
        ai_players: {
            random_ai: {
                name: 'AI - Random',
                source: 'local',
            },
            // js_ai: {
            //     name: 'AI - Javascript',
            //     source: 'local',
            // },
            // java_ai: {
            //     name: 'AI - Java',
            //     source: 'remote',
            // },
            // py_ai: {
            //     name: 'AI - Python',
            //     source: 'remote',
            // }
        },
    }

    $scope.game = {
        status: 'init',
        mode: 'multiple', //multiple || single
        level: 'easy',
        starting_player: 'player1',
        winner: {
            name: '',
            color: '',
            type: 'user'
        },
        players: {
            player1: {
                name: '',
                color: 'red',
                type: 'user'
            },
            player2: {
                name: '',
                color: '',
                type: 'user'
            }
        }
    }

    $scope.disk = {
        player: '',
        color: '',
        col: 0
    };

    $scope.board_drop_space = [];
    $scope.board = [];

    $scope.syncInputs = function() {
        $scope.$applyAsync();
    };

    $scope.gameFormInit = function() {
        $scope.game.status = 'init';
        $scope.game.mode = 'multiple';
        $scope.game.level = 'easy';
        $scope.game.starting_player = 'player1';
        $scope.game.winner = jQuery.extend(true, {}, $scope.default_player);
        $scope.game.players.player1 = jQuery.extend(true, {}, $scope.default_player);
        $scope.game.players.player1.color = 'red';
        $scope.game.players.player2 = jQuery.extend(true, {}, $scope.default_player);
    }

    $scope.getAvailableDropSpaces = function() {
        var available_places = [];

        for (var j = 0; j < $scope.config.board.col; j++) {
            if($scope.board_drop_space[j] >= 0) {
                available_places.push(j);
            }
        }

        return available_places;
    }

    $scope.playerMove = function() {
        var player_type = $scope.game.players[$scope.disk.player].type;
        if(jQuery.inArray( player_type, $scope.config.ai_players )){
            switch (player_type) {
                case 'random_ai':
                    var available_places = $scope.getAvailableDropSpaces();
                    console.log(available_places);

                    if(available_places.length){
                        var drop_col = available_places[Math.floor(Math.random()*available_places.length)];
                        console.log(drop_col);
                        $scope.dropDisk(drop_col);
                    }
                    break;
                case 'java_ai':
                    break;
                case 'py_ai':
                    break;
                default:
                    break;
            }

            $scope.syncInputs();
        }
    }

    $scope.updateDisk = function(this_player,this_col,player_move) {
        var this_color = $scope.game.players[this_player].color;

        $scope.disk.player = this_player;
        $scope.disk.color = this_color;
        if(this_col >= 0){
            $scope.disk.col = this_col;
        }
        $scope.syncInputs();
        if(player_move === true){
            $scope.playerMove();
        }
    }

    $scope.changePlayer = function() {
        var new_player = 'player1';
        if($scope.disk.player === 'player1'){
            new_player = 'player2';
        }
        $scope.updateDisk(new_player,-1,true);
    }

    $scope.initBoard = function() {
        $scope.board = [];
        $scope.board_drop_space = [];

        $connect4board.find('.connect4-disk').remove();

        for (var i = 0; i < $scope.config.board.col; i++) {
            $scope.board_drop_space[i] = $scope.config.board.row - 1;
        }

        for (var i = 0; i < $scope.config.board.row; i++) {
            if($scope.board[i] == undefined) {
                $scope.board[i] = [];
            }

            for (var j = 0; j < $scope.config.board.col; j++) {
                if($scope.board[i][j] == undefined) {
                    $scope.board[i][j] = {};
                }

                $scope.board[i][j] = {
                    row: i,
                    col: j,
                    player: ''
                };
            }
        }

        $scope.game.status = 'running';

        $scope.updateDisk($scope.game.starting_player,0,false);
    }

    $scope.moveTopDisk = function(this_col) {
        var topDiskColOffset = jQuery("#connect4-top-disk-col-"+this_col).position();

        var movePos_left = topDiskColOffset.left+5;
        var movePos_top = topDiskColOffset.top+5;

        $topDisk.animate({left:movePos_left,top:movePos_top}, 100, function() {
            $scope.disk.col = this_col;
        });
    }

    $scope.isInsideBoard = function(this_row,this_col){
        var isInsideBoard_row = false;
        var isInsideBoard_col = false;

        if(0 <= this_row && this_row < $scope.config.board.row){
            isInsideBoard_row = true;
        }

        if(0 <= this_col && this_col < $scope.config.board.col){
            isInsideBoard_col = true;
        }

        return (isInsideBoard_row && isInsideBoard_col);
    }

    $scope.isDiskMatched = function(this_row,this_col){
        var matchFound = false;

        this_row = parseInt(this_row);
        this_col = parseInt(this_col);

        var this_player = $scope.board[this_row][this_col].player;

        angular.forEach(['hor','ver','dia_up','dia_down'], function(check_type) {
            if(!matchFound){
                var countMatcheItem = 1;

                var go_left_row = 0;
                var go_left_col = 0;

                var go_right_row = 0;
                var go_right_col = 0;

                if(check_type === 'hor'){
                    go_left_row = this_row;
                    go_right_row = this_row;
                } else if(check_type === 'ver'){
                    go_left_col = this_col;
                    go_right_col = this_col;
                }

                var checkStatus = {
                    left: true,
                    right: true
                };

                for(var i=1; i < 4; i++){
                    if(check_type === 'dia_up'){

                        go_left_row = 1 * this_row + i;
                        go_left_col = this_col - i;

                        go_right_row = this_row - i;
                        go_right_col = 1 * this_col + i;
                    } else {
                        if(check_type === 'ver' || check_type === 'dia_down'){
                            go_left_row = this_row - i;
                            go_right_row = 1 * this_row + i;
                        }

                        if(check_type === 'hor' || check_type === 'dia_down'){
                            go_left_col = this_col - i;
                            go_right_col = 1 * this_col + i;
                        }
                    }

                    if(checkStatus.left && $scope.isInsideBoard(go_left_row,go_left_col)){
                        if($scope.board[go_left_row][go_left_col].player === this_player){
                            countMatcheItem++;
                        } else {
                            checkStatus.left = false
                        }
                    }

                    if(checkStatus.right && $scope.isInsideBoard(go_right_row,go_right_col)){
                        if($scope.board[go_right_row][go_right_col].player === this_player){
                            countMatcheItem++;
                        } else {
                            checkStatus.right = false
                        }
                    }
                }

                if(countMatcheItem == 4){
                    matchFound = true;
                }
            }
        });

        if(matchFound){
            $scope.gameover(this_player);
            //alert('matched');
        }

        return matchFound;
    }

    $scope.dropDisk = function(this_col) {

        var invalid_drop = true;

        if(this_col !== undefined && $scope.board_drop_space[this_col] >= 0){
            invalid_drop = false;

            var startPosOffset = jQuery("#connect4-top-disk-col-"+this_col).position();

            var startPos_left = startPosOffset.left+5;
            var startPos_top = startPosOffset.top+5;

            var this_row = $scope.board_drop_space[this_col];

            console.log(this_row, this_col);

            console.log('#connect4block-board-cell-'+this_row+'-'+this_col);

            var this_player = $scope.disk.player;
            var this_color = $scope.disk.color;
            var $newDisk = jQuery('<div class="connect4-disk connect4-disk-'+this_color+'"></div>');

            var $thisCell = $connect4board.find('#connect4block-board-cell-'+this_row+'-'+this_col);
            //console.log('$thisCell',$thisCell);
            var thisCellOffset = $thisCell.position();

            var movePos_left = thisCellOffset.left+5;
            var movePos_top = thisCellOffset.top+5;

            $newDisk.css({left:startPos_left,top:startPos_top});

            $connect4board.append($newDisk);

            $scope.board_drop_space[this_col] = $scope.board_drop_space[this_col] - 1;

            $newDisk.animate({left:movePos_left,top:movePos_top}, 350, function() {
                $scope.board[this_row][this_col].player = this_player;

                if($scope.isDiskMatched(this_row,this_col) === false){
                    $scope.changePlayer();
                }
            });
        }

        if(invalid_drop){
            alert('Invalid Drop');
        }
    }

    $scope.gameover = function(this_player) {
        $scope.game.winner = jQuery.extend(true, {}, $scope.game.players[this_player]);

        $scope.gameRunning('hide');

        $scope.game.status = 'gameover';

        $scope.syncInputs();
    }

    $scope.startGame = function() {
        if($scope.game.mode === 'single'){
            $scope.game.players.player2.name = $scope.config.ai_players[$scope.game.players.player2.type].name;
        }
        var player1color = $scope.game.players.player1.color;
        var player2color = player1color === 'red'? 'yellow':'red';

        $scope.game.players.player2.color = player2color;

        $scope.syncInputs();

        $scope.initBoard();
        $scope.moveTopDisk(0);
        $topDisk.hide();

        $scope.playerMove();

        $scope.syncInputs();
    };

    $scope.exitGame = function() {
        $scope.gameFormInit();

        $scope.syncInputs();
    };

    $scope.gameRunning = function(action,thisPointer) {
        if($scope.game.status === 'running'){
            switch(action) {
                case 'show':
                    $topDisk.show();
                    break;

                case 'hide':
                    $topDisk.hide();
                    break;

                default:
                    if(action === 'moveTopDisk' || action === 'dropDisk'){
                        var this_col = jQuery(thisPointer).attr('data-col');
                        if(this_col !== undefined && this_col >= 0 && this_col < $scope.config.board.col){
                            $scope.moveTopDisk(this_col);
                        } else {
                            action = '';
                        }
                        if(action === 'dropDisk'){
                            $scope.dropDisk(this_col);
                        }
                    }
                    break;
            }
        }
    }

    jQuery(function(){
        jQuery(document).on({
                mouseenter: function(e){
                    $scope.gameRunning('moveTopDisk',this);
                },
                click: function(e){
                    $scope.gameRunning('dropDisk',this);
                }
            },
            '.connect4-top-disk-col'
        );
        jQuery(document).on({
                mouseenter: function(e){
                    $scope.gameRunning('moveTopDisk',this);
                },
                click: function(e){
                    $scope.gameRunning('dropDisk',this);
                }
            },
            '.connect4block-board-col'
        );
        $topDisk.on( "click", function() {
            $scope.gameRunning('dropDisk',this);
        });
        jQuery(document).on({
                mouseenter: function(e){
                    $scope.gameRunning('show');
                },
                mouseleave: function(e){
                    $scope.gameRunning('hide');
                },
            },
            '#connect4block-top'
        );
        jQuery(document).on({
                mouseenter: function(e){
                    $scope.gameRunning('show');
                },
                mouseleave: function(e){
                    $scope.gameRunning('hide');
                },
            },
            '.connect4block-board-container'
        );
    });
});