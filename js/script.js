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

        $scope.updateDisk('yellow',0);
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

    $scope.dropDisk = function() {
        var this_col = $scope.disk.col;

        console.log(this_col);

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
                    console.log(this_col);
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