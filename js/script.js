var connect4App = angular.module('connect4App', []);
var $topDisk = jQuery("#connect4block-top-disk");
var $connect4board = jQuery("#connect4block-board");

connect4App.controller('Connect4Controller', function Connect4Controller($scope, $parse, $http) {
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
            red: 'p1',
            yellow: 'p2'
        },
        status: 'pending'
    };

    $scope.disk = {
        color: '',
        player: '',
        col: 1
    };

    $scope.board = [];

    $scope.syncInputs = function() {
        $scope.$applyAsync();
    };

    $scope.updateDisk = function(this_color,this_col) {
        $scope.disk.color = this_color;
        $scope.disk.player = $scope.config.color[this_color];
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

        $scope.updateDisk('red',0);
    }

    $scope.initBoard();

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
            alert('matched');
            $scope.initBoard();
        }
    }

    $scope.dropDisk = function() {
        var this_col = $scope.disk.col;

        for (i = $scope.config.board.row - 1; i >= 0; i--) {
            if($scope.board[i][this_col].color === ''){
                var this_color = $scope.disk.color;

                var $thisCell = $connect4board.find('#connect4block-board-cell-'+i+'-'+this_col);
                var $newDisk = jQuery('<div class="connect4-disk connect4-disk-'+this_color+'"></div>');

                var cellOffset = $thisCell.position();

                var movePos_left = cellOffset.left+5;
                var movePos_top = cellOffset.top+5;

                $newDisk.css({left:movePos_left,top:movePos_top});

                $connect4board.append($newDisk);

                $scope.board[i][this_col].color = this_color;

                $scope.swapDiskColor();

                $scope.isDiskMatched(i,this_col);
                break;
            }
        }
    }

    jQuery(function(){
        $scope.moveTopDisk(0);
        $topDisk.hide();

        jQuery(document).on({
                mouseenter: function(e){
                    var this_col = jQuery(this).attr('data-col');
                    $scope.moveTopDisk(this_col);
                },
                click: function(e){
                    $scope.dropDisk();
                }
            },
            '.connect4-top-disk-col'
        );
        jQuery(document).on({
                mouseenter: function(e){
                    var this_col = jQuery(this).attr('data-col');
                    $scope.moveTopDisk(this_col);
                },
                click: function(e){
                    $scope.dropDisk();
                }
            },
            '.connect4block-board-col'
        );
        $topDisk.on( "click", function() {
            $scope.dropDisk();
        });
        jQuery(document).on({
                mouseenter: function(e){
                    $topDisk.show();
                },
                mouseleave: function(e){
                    $topDisk.hide();
                },
            },
            '#connect4block-top'
        );
        jQuery(document).on({
                mouseenter: function(e){
                    $topDisk.show();
                },
                mouseleave: function(e){
                    $topDisk.hide();
                },
            },
            '.connect4block-board-container'
        );
    });
});