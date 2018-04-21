var connect4App = angular.module('connect4App', ['initialValue']);
var $topDisk = jQuery("#connect4block-top-disk");
var $connect4board = jQuery("#connect4block-board");
var $connect4initForm = jQuery('#connect4initForm');

connect4App.controller('Connect4Controller', function Connect4Controller($scope, $parse, $http) {
    $scope.default_player = {
        name: '',
        color: '',
        type: 'human'
    }

    $scope.prev_player_move = {
        row: -1,
        col: -1,
        player: ''
    }

    $scope.loading_obj = {
        show: true,
        text: '',
        default: 'Loading...'
    }

    $scope.config = {
        websocket: {
            active: false,
            server_address: "ws://10.35.4.38:8765/",
            username: 'game_player',
            join_success: false
        },
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
                active: true,
                source: 'local',
            },
            random_ai2: {
                name: 'AI - Random 2',
                active: true,
                source: 'local',
            },
            py_ai: {
                name: 'AI - Python',
                active: true,
                source: 'remote',
                remote_server: 'localhost',
                remote_port: 8765,
            },
            py_ai2: {
                name: 'AI - Python 2',
                active: true,
                source: 'remote',
                remote_server: 'localhost',
                remote_port: 8765,
            },
            minimax: {
                name: 'AI - Minimax (Java)',
                active: true,
                source: 'remote',
                remote_server: 'localhost',
                remote_port: 8765,
            },
            MCTS: {
                name: 'AI - MCTS (Java)',
                active: true,
                source: 'remote',
                remote_server: 'localhost',
                remote_port: 8765,
            }
        },
    }

    $scope.game = {
        status: 'init',
        mode: 'human-vs-human', //human-vs-human || human-vs-ai || ai-vs-ai
        level: 'easy',
        starting_player: 'player1',
        winner: {
            name: '',
            color: '',
            type: 'human'
        },
        players: {
            player1: {
                name: '',
                color: 'red',
                type: 'human'
            },
            player2: {
                name: '',
                color: '',
                type: 'human'
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

    $scope.syncInputs = function () {
        $scope.$applyAsync();
    };

    $scope.defaultFor = function(arg, val) {
        return typeof arg !== 'undefined' ? arg : val;
    }

    $scope.loadingBlockUpdate = function(show_loading, loading_text) {
        show_loading = $scope.defaultFor(show_loading,false);
        loading_text = $scope.defaultFor(loading_text,$scope.loading_obj.default);

        $scope.loading_obj.show = show_loading;
        $scope.loading_obj.text = loading_text;

        $scope.syncInputs();
    }

    $scope.create_output = function(type, username, move, to_username){
        var output_data = {
            type: $scope.defaultFor(type,''),
            username: $scope.defaultFor(username,''),
            move: $scope.defaultFor(move,-1),
            to_username: $scope.defaultFor(to_username,''),
            from_game_player: 1
        }

        return output_data
    }

    if ("WebSocket" in window) {
        $scope.config.websocket.active = true;
        console.log("WebSocket is supported by your Browser!");

        // Let us open a web socket
        $scope.ws = new WebSocket($scope.config.websocket.server_address);

        $scope.ws.onopen = function(){
            // Web Socket is connected, send data using send()
            var join_data = $scope.create_output('join', $scope.config.websocket.username)
            $scope.ws.send(JSON.stringify(join_data));
            console.log("Join:",join_data);
        };

        $scope.ws.onmessage = function (evt){
            var received_str = evt.data;
            var received_data = JSON.parse(received_str);

            console.log("Received: ", received_data);

            if(received_data.type === 'join'){
                $scope.config.websocket.join_success = true;
                $scope.gameAiCheck();
            } else if(received_data.type === 'move'){
                $scope.loadingBlockUpdate(false);
                var $this_playerObj = $scope.game.players[$scope.disk.player];

                if($this_playerObj.type === received_data.username){
                    $scope.dropDisk(received_data.move);
                }
            }

            return false;
        };

        $scope.ws.onclose = function(){
            $scope.config.websocket.join_success = false;
            // websocket is closed.
            console.log("Connection is closed...");
        };

        $scope.ws.onerror = function(evt){
            $scope.config.websocket.join_success = false;
            // websocket is error.
            console.log("Connection error...");
            console.log(evt);
        };
    } else {
        // The browser doesn't support WebSocket
        console.log("WebSocket NOT supported by your Browser!");
    }

    $scope.updateGameMode = function() {
        if($scope.game.mode === 'human-vs-human'){
            jQuery.each( $scope.config.ai_players, function( ai_player_key, ai_player ) {
                if(ai_player.active){
                    $scope.game.players.player2.type = ai_player_key;
                    return false;
                }
            });
        } else {
            $scope.game.players.player2.type = 'human';
        }
        $scope.syncInputs();
    }

    $scope.gameAiCheck = function() {
        if($scope.config.websocket.join_success){
            angular.forEach($scope.config.ai_players, function(ai_player, ai_player_key) {
                if(ai_player.source === 'remote'){
                    $scope.config.ai_players[ai_player_key].active = true;
                }
            });
        } else {
            angular.forEach($scope.config.ai_players, function(ai_player, ai_player_key) {
                if(ai_player.source === 'remote'){
                    $scope.config.ai_players[ai_player_key].active = false;
                }
            });
        }

        $scope.syncInputs();
    }

    $scope.gameFormInit = function() {
        $scope.game.status = 'init';
        $scope.game.mode = 'human-vs-human';
        $scope.updateGameMode();
        $scope.game.level = 'easy';
        $scope.game.starting_player = 'player1';
        $scope.game.winner = jQuery.extend(true, {}, $scope.default_player);
        $scope.game.players.player1 = jQuery.extend(true, {}, $scope.default_player);
        $scope.game.players.player1.color = 'red';
        $scope.game.players.player2 = jQuery.extend(true, {}, $scope.default_player);

        $scope.gameAiCheck();

        $scope.syncInputs();
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
        var $this_playerObj = $scope.game.players[$scope.disk.player];
        var opp_player = $scope.disk.player == 'player1'? 'player2':'player1';
        var $opp_playerObj = $scope.game.players[opp_player];
        var $prev_playerObj = false;

        if($scope.prev_player_move.player !== ''){
            $prev_playerObj = $scope.game.players[$scope.prev_player_move.player];
        }

        if(jQuery.inArray( $this_playerObj.type, $scope.config.ai_players )){
            switch ($this_playerObj.type) {
                case 'random_ai':
                case 'random_ai2':
                    var available_places = $scope.getAvailableDropSpaces();
                    //console.log(available_places);

                    if(available_places.length){
                        var drop_col = available_places[Math.floor(Math.random()*available_places.length)];
                        //console.log(drop_col);
                        $scope.dropDisk(drop_col);

                        if($opp_playerObj.source == 'remote'){
                            var move_data = $scope.create_output('move', $this_playerObj.type, drop_col, $opp_playerObj.type);
                            $scope.ws.send(JSON.stringify(move_data));
                        }
                    }
                    break;
                case 'minimax':
                case 'MCTS':
                case 'py_ai':
                case 'py_ai2':
                    var this_player_username = $scope.config.websocket.username;

                    var prev_col = $scope.prev_player_move.col;
                    var prev_player_username = $scope.config.websocket.username;

                    if(prev_col == -1){
                            if($opp_playerObj.type !== 'human'){
                                prev_player_username = $opp_playerObj.type;
                            }
                    } else if($prev_playerObj){
                        if($prev_playerObj.type !== 'human'){
                            prev_player_username = $prev_playerObj.type;
                        }
                    }

                    if($this_playerObj.type !== 'human'){
                        this_player_username = $this_playerObj.type;
                    }

                    $scope.loadingBlockUpdate(true,$this_playerObj.name+' thinking');

                    var move_data = $scope.create_output('move', prev_player_username, prev_col, this_player_username);
                    $scope.ws.send(JSON.stringify(move_data));

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

        $scope.prev_player_move.row = -1;
        $scope.prev_player_move.col = -1;
        $scope.prev_player_move.player = '';

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
        var matched_cells = [];

        this_row = parseInt(this_row);
        this_col = parseInt(this_col);

        var this_player = $scope.board[this_row][this_col].player;

        angular.forEach(['hor','ver','dia_up','dia_down'], function(check_type) {
            if(!matchFound){
                matched_cells = [];

                var countMatchedItem = 1;


                matched_cells.push({
                    row: this_row,
                    col: this_col
                });

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
                            matched_cells.push({
                                row: go_left_row,
                                col: go_left_col
                            });
                            countMatchedItem++;
                        } else {
                            checkStatus.left = false
                        }
                    }

                    if(checkStatus.right && $scope.isInsideBoard(go_right_row,go_right_col)){
                        if($scope.board[go_right_row][go_right_col].player === this_player){
                            matched_cells.push({
                                row: go_right_row,
                                col: go_right_col
                            });
                            countMatchedItem++;
                        } else {
                            checkStatus.right = false
                        }
                    }
                }

                if(countMatchedItem >= 4){
                    matchFound = true;
                }
            }
        });

        if(matchFound){
            $scope.gameover(this_player,matched_cells);
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

            //console.log(this_row, this_col);

            //console.log('#connect4block-board-cell-'+this_row+'-'+this_col);

            var this_player = $scope.disk.player;
            var this_color = $scope.disk.color;
            var $newDisk = jQuery('<div id="connect4-disk-cell-'+this_row+'-'+this_col+'" class="connect4-disk connect4-disk-'+this_color+'"></div>');

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

                $scope.prev_player_move.row = this_row;
                $scope.prev_player_move.col = this_col;
                $scope.prev_player_move.player = this_player;

                if($scope.isDiskMatched(this_row,this_col) === false){
                    $scope.changePlayer();

                    //var test_data = $scope.create_output($scope.config.websocket.username, 'move',Math.floor(Math.random() * 1000) + 1)
                    //$scope.ws.send(JSON.stringify(test_data));
                }
            });
        }

        if(invalid_drop){
            alert('Invalid Drop');
        }
    }

    $scope.gameover = function(this_player,matched_cells) {
        $scope.game.winner = jQuery.extend(true, {}, $scope.game.players[this_player]);

        $scope.gameRunning('hide');

        $scope.game.status = 'gameover';

        $scope.syncInputs();

        console.log(matched_cells);

        angular.forEach(matched_cells, function(matched_cell) {
            if(!jQuery('#connect4-disk-cell-'+matched_cell.row+'-'+matched_cell.col).hasClass()){
                jQuery('#connect4-disk-cell-'+matched_cell.row+'-'+matched_cell.col).addClass('connect4-disk-cell-matched');
            }
        });
    }

    $scope.startGame = function() {
        $scope.loadingBlockUpdate(true);

        if($scope.game.mode === 'ai-vs-ai'){
            $scope.game.players.player1.name = $scope.config.ai_players[$scope.game.players.player1.type].name;
        }

        if($scope.game.mode !== 'human-vs-human'){
            $scope.game.players.player2.name = $scope.config.ai_players[$scope.game.players.player2.type].name;
        }

        $scope.game.players.player2.color = $scope.game.players.player1.color === 'red'? 'yellow':'red';

        $scope.syncInputs();

        $scope.initBoard();
        $scope.moveTopDisk(0);
        $topDisk.hide();

        setTimeout(function(){
            $scope.loadingBlockUpdate(false);
            $scope.playerMove();
            $scope.syncInputs();
        }, 1000);

        $scope.syncInputs();
    };

    $scope.exitGame = function() {
        $scope.gameFormInit();
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
        $scope.gameFormInit();

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