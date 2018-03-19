var connect4App = angular.module('connect4App', []);
var $topDisk = jQuery("#connect4block-top-disk");

connect4App.controller('Connect4Controller', function Connect4Controller($scope, $parse, $http) {
    $scope.config = {
        top: {
            width: 500,
            height: 80
        },
        board: {
            row: 6,
            col: 7
        }
    };

    $scope.board = [];
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
                    player: {
                        user: '',
                        color: ''
                    }
                };
            }
        }
    }

    $scope.initBoard();

    $scope.moveTopDisk = function(this_col) {
        var topDiskColOffset = jQuery("#connect4-top-disk-col-"+this_col).position();
        var movePos_left = topDiskColOffset.left+5;
        var movePos_top = topDiskColOffset.top+5;
        //console.log(movePos_left,movePos_top);
        $topDisk.animate({left:movePos_left,top:movePos_top}, 100, function() {
            $topDisk.attr('data-col',this_col);
        });
    }

    $scope.moveTopDisk = function(this_col) {
        var topDiskColOffset = jQuery("#connect4-top-disk-col-"+this_col).position();
        var movePos_left = topDiskColOffset.left+5;
        var movePos_top = topDiskColOffset.top+5;
        //console.log(movePos_left,movePos_top);
        $topDisk.animate({left:movePos_left,top:movePos_top}, 100, function() {
            $topDisk.attr('data-col',this_col);
        });
    }

    jQuery(function(){
        $topDisk.hide();

        jQuery(document).on({
                mouseenter: function(e){
                    var this_col = jQuery(this).attr('data-col');
                    $scope.moveTopDisk(this_col);
                },
                click: function(e){
                }
            },
            '.connect4-top-disk-col'
        );
        $topDisk.on( "click", function() {
            var this_col = jQuery(this).attr('data-col');
            console.log(this_col);
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
    });
});