var connect4App = angular.module('connect4App', []);
var $topDisk = jQuery("#connect4block-top-disk");
var $connect4board = jQuery("#connect4block-board");


if (false && "WebSocket" in window) {
    var msg_count = 0;
    var player_username = 'p1';

    console.log("WebSocket is supported by your Browser!");

    // Let us open a web socket
    var ws = new WebSocket("ws://localhost:8765/");

    ws.onopen = function(){
        // Web Socket is connected, send data using send()
        ws.send(player_username);
        console.log("Message is sent...");
    };

    ws.onmessage = function (evt){
        var received_msg = evt.data;
        console.log("Message is received...");
        console.log(received_msg);
        if(msg_count == 0){
            if(received_msg === 'received:'+player_username){
                ws.send(player_username);
                console.log("Message is sent: "+player_username);
            }
            msg_count++;
        }
        return false;
    };

    ws.onclose = function(){
        // websocket is closed.
        console.log("Connection is closed...");
    };

    ws.onerror = function(evt){
        // websocket is error.
        console.log("Connection error...");
        console.log(evt);
    };
} else {
    // The browser doesn't support WebSocket
    console.log("WebSocket NOT supported by your Browser!");
}

connect4App.controller('Connect4Controller', function Connect4Controller($scope, $parse, $http) {
    $scope.winner = {
        name: '',
        color: '',
        type: 'user'
    };

    $scope.default_init = {
        color: 'red',
        game_mode: 'multiple', //multiple || single,
        game_level: 'easy'
    }

    $scope.default_player = {
        name: '',
        color: '',
        type: 'user'
    }

    $scope.config = {
        top: {
            width: 500,
            height: 80
        },
        board: {
            row: 6,
            col: 7
        },
        color: {
            red: 'player1',
            yellow: 'player2'
        },
        players: {
            player1: {
                name: '',
                color: '',
                type: 'user'
            },
            player2: {
                name: '',
                color: '',
                type: 'user'
            }
        },
        init: {},
        game_status: 'init'
    };

    $scope.config.init = jQuery.extend(true, {}, $scope.default_init);

    $scope.disk = {
        color: '',
        col: 1
    };

    $scope.board = [];

    $scope.syncInputs = function() {
        $scope.$applyAsync();
    };

    $scope.updateDisk = function(this_color,this_col) {
        $scope.disk.color = this_color;
        if(this_col >= 0){
            $scope.disk.col = this_col;
        }
        $scope.syncInputs();
    }

    $scope.swapDiskColor = function() {
        var new_color = 'red';
        if($scope.disk.color === 'red'){
            new_color = 'yellow';
        }
        $scope.updateDisk(new_color,-1);
    }

    $scope.initBoard = function() {
        $scope.board = [];

        $connect4board.find('.connect4-disk').remove();

        for (i = 0; i < $scope.config.board.row; i++) {
            if($scope.board[i] == undefined) {
                $scope.board[i] = [];
            }

            for (j = 0; j < $scope.config.board.col; j++) {
                if($scope.board[i][j] == undefined) {
                    $scope.board[i][j] = {};
                }

                $scope.board[i][j] = {
                    row: i,
                    col: j,
                    color: ''
                };
            }
        }

        $scope.config.game_status = 'running';

        $scope.updateDisk($scope.config.init.color,0);
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

        var this_color = $scope.board[this_row][this_col].color;

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
                        if($scope.board[go_left_row][go_left_col].color === this_color){
                            countMatcheItem++;
                        } else {
                            checkStatus.left = false
                        }
                    }

                    if(checkStatus.right && $scope.isInsideBoard(go_right_row,go_right_col)){
                        if($scope.board[go_right_row][go_right_col].color === this_color){
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
            $scope.gameover(this_color);
            //alert('matched');
        }

        return matchFound;
    }

    $scope.dropDisk = function() {
        var this_col = $scope.disk.col;

        var topDiskOffset = $topDisk.position();

        var startPos_left = topDiskOffset.left;//+5;
        var startPos_top = topDiskOffset.top;//+5;

        for (i = $scope.config.board.row - 1; i >= 0; i--) {
            if($scope.board[i][this_col].color === ''){
                var this_color = $scope.disk.color;
                var $newDisk = jQuery('<div class="connect4-disk connect4-disk-'+this_color+'"></div>');

                var $thisCell = $connect4board.find('#connect4block-board-cell-'+i+'-'+this_col);
                var thisCellOffset = $thisCell.position();

                var movePos_left = thisCellOffset.left+5;
                var movePos_top = thisCellOffset.top+5;

                $newDisk.css({left:startPos_left,top:startPos_top});

                $connect4board.append($newDisk);

                $newDisk.animate({left:movePos_left,top:movePos_top}, 350, function() {
                    $scope.board[i][this_col].color = this_color;

                    if($scope.isDiskMatched(i,this_col) === false){
                        $scope.swapDiskColor();
                    }
                });
                break;
            }
        }
    }

    $scope.gameover = function(this_color) {
        $scope.winner = jQuery.extend(true, {}, $scope.config.players[$scope.config.color[this_color]]);

        $scope.gameRunning('hide');

        $scope.config.game_status = 'gameover';

        $scope.syncInputs();
    }

    $scope.startGame = function() {
        var player1color = $scope.config.init.color;
        var player2color = player1color === 'red'? 'yellow':'red';

        //console.log(player1color,player2color);

        $scope.config.players.player1.color = player1color;
        $scope.config.players.player2.color = player2color;

        $scope.config.color[player1color] = 'player1';
        $scope.config.color[player2color] = 'player2';

        $scope.syncInputs();
        $scope.initBoard();
        $scope.moveTopDisk(0);
        $topDisk.hide();
        $scope.syncInputs();
    }

    $scope.initGame = function() {
        $scope.config.init = jQuery.extend(true, {}, $scope.default_init);
        $scope.config.players.player1 = jQuery.extend(true, {}, $scope.default_player);
        $scope.config.players.player2 = jQuery.extend(true, {}, $scope.default_player);

        $scope.config.game_status = 'init';
        $scope.syncInputs();
    }

    $scope.gameRunning = function(action,additional_v1) {
        if($scope.config.game_status === 'running'){
            switch(action) {
                case 'show':
                    $topDisk.show();
                    break;

                case 'hide':
                    $topDisk.hide();
                    break;

                case 'dropDisk':
                    $scope.dropDisk();
                    break;
                case 'moveTopDisk':
                    var this_col = additional_v1;
                    $scope.moveTopDisk(this_col);
                    break;
            }
        }
    }

    jQuery(function(){
        //$scope.startGame();

        jQuery(document).on({
                mouseenter: function(e){
                    var this_col = jQuery(this).attr('data-col');
                    $scope.gameRunning('moveTopDisk',this_col);
                },
                click: function(e){
                    $scope.gameRunning('dropDisk');
                }
            },
            '.connect4-top-disk-col'
        );
        jQuery(document).on({
                mouseenter: function(e){
                    var this_col = jQuery(this).attr('data-col');
                    $scope.gameRunning('moveTopDisk',this_col);
                },
                click: function(e){
                    $scope.gameRunning('dropDisk');
                }
            },
            '.connect4block-board-col'
        );
        $topDisk.on( "click", function() {
            $scope.gameRunning('dropDisk');
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