
var neighborsData = new Array();
var alphasData = new Array();
var heightsData = new Array();

function filter_alpha_block (image, x, y, decoded) {
    var n = get_neighbors(x, y, decoded);
    var g = get_group(x, y, decoded);
    var dataFound = -1;
    for ( var i = 0; i < neighborsData.length; i++) {
        if ( neighborsData[i] == n ) {
           dataFound = i;
           break;
        }
    }
    if ( dataFound >= 0 ) {
        set_alpha_block(image, x, y, alphasData[dataFound], heightsData[dataFound], g);
    } else {
        var maps = get_alphas(n);
        var alphas = maps.a;
        var heights = maps.h;
        set_alpha_block(image, x, y, alphas, heights, g);
        neighborsData.push(n);
        alphasData.push(alphas);
        heightsData.push(heights);
    }
}

function is_neighbors_changed (x, y, decoded) {
    var pos = x*y_width + y;
    if ( decoded.charAt(pos) != prev_str.charAt(pos) ) {
        return true;
    }
    for ( var i = -2; i <= 2; i++ ) {
        for ( var j = -2; j <= 2; j++ ) {
            if ( x + i < 0 || y + j < 0 || x + i >= x_width || y + j >= y_width ) {
                continue;
            }
            pos = (x + i)*y_width + y + j;
            if ( decoded.charAt(pos) == "0" && prev_str.charAt(pos) != "0" ) {
                return true;
            }
            if ( decoded.charAt(pos) != "0" && prev_str.charAt(pos) == "0" ) {
                return true;
            }
        }
    }
    return false;
}

function get_group (x, y, decoded) {
    var pos = x*y_width + y;
    return decoded.charAt(pos);
}

function get_neighbors (x, y, decoded) {
    var neighbors = "";
    for ( var i = -2; i <= 2; i++ ) {
        for ( var j = -2; j <= 2; j++ ) {
            //if (x + i < 0 || y + j < 0 || x + i >= x_width || y + j >= y_width || x*x + y*y == 4 ) {
            if (x + i < 0 || y + j < 0 || x + i >= x_width || y + j >= y_width ) {
                neighbors += "0";
                continue;
            }
            var pos = (x + i)*y_width + y + j;
            if ( decoded.charAt(pos) == "0" ) {
                neighbors += "0";
            } else {
                neighbors += "1";
            }
        }
    }
    return neighbors;
}

var roundTable = new Array(8);
roundTable[0] = [ 4, 4, 4, 3, 3, 3, 2, 1 ];
roundTable[1] = [ 4, 4, 4, 3, 3, 3, 2, 1 ];
roundTable[2] = [ 4, 4, 3, 3, 3, 3, 2, 1 ];
roundTable[3] = [ 3, 3, 3, 3, 3, 2, 1, 0 ];
roundTable[4] = [ 3, 3, 3, 3, 2, 2, 1, 0 ];
roundTable[5] = [ 3, 3, 3, 2, 2, 1, 0, 0 ];
roundTable[6] = [ 2, 2, 2, 1, 1, 0, 0, 0 ];
roundTable[7] = [ 1, 1, 1, 0, 0, 0, 0, 0 ];
var roundSum = 432;

function curve ( sum, max, numSeq ) {
    var x = sum/max;
    var curve = 11.0;
    if ( x < 0.5 ) {
        return Math.floor(numSeq*Math.pow(2*x, curve)/2);
    }
    return Math.floor(numSeq*(1 - Math.pow((1 - x)*2, curve)/2));
}

function linar ( sum, max, numSeq ) {
    return Math.floor(numSeq*sum/max);
}

function get_alphas (neighbors) {
    var heights = "";
    var alphas = "";
    var emb_ref = new Array(16);
    for ( var i = -1; i < block_size; i++ ) {
        for ( var j = -1; j < block_size; j++ ) {
            var x = block_size*2 + i;
            var y = block_size*2 + j;
            var sum = 0;
            for ( var dx = -7; dx <= 7; dx++ ) {
                for ( var dy = -7; dy <= 7; dy++ ) {
                    var abx = Math.abs(dx);
                    var aby = Math.abs(dy);
                    if ( roundTable[abx][aby] == 0 ) {
                        continue;
                    }
                    var xpos = Math.floor((x + dx)/block_size);
                    var ypos = Math.floor((y + dy)/block_size);
                    if ( neighbors.charAt(xpos*5 + ypos) == "1" ) {
                        sum += roundTable[abx][aby];
                    }
                }
            }
            if ( i >= 0 && j >= 0 ) {
                alphas += ref.charAt(curve(sum, roundSum, 60));
                var diff = 30 + (sum - emb_ref[i*block_size + j])*30/roundSum;
                if ( diff < 0 ) {
                    diff = 0;
                }
                if ( diff > 60 ) {
                    diff = 60;
                }
                heights += ref.charAt(diff);
            }
            if ( i + 1 < block_size && j + 1 < block_size ) {
                emb_ref[(i + 1)*block_size + (j + 1)] = sum;
            }
        }
    }
    var block_maps = { h:heights, a:alphas };
    return block_maps;
}
/*
var linar255tbl = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 
		   a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, j:0,
		   k:0, l:0, m:0, n:0, o:0, p:0, q:0, r:0, s:0, t:0,
		   u:0, v:0, w:0, x:0, y:0, z:0, A:0, B:0, C:0, D:0,
		   E:0, F:0, G:0, H:0, I:0, J:0, K:0, L:0, M:0, N:0, 
		   O:0, P:0, Q:0, R:0, S:0, T:0, U:0, V:0, W:0, X:0,
		   Y:0, Z:0, length:62 };
*/
var linar255tbl = new Array();
var linarByTbl = new Array();

function init_tables () {
    for ( var i = 0; i < 62; i++ ) {
        var val = 255*i/60;
        if ( val > 255 ) {
            val = 255;
        }
        linar255tbl[ref.charAt(i)] = val;
    }
    for ( var i = 0; i < 62; i++ ) {
        var val = 1.0 + (i - 30)/30/2;
        linarByTbl[ref.charAt(i)] = val;
    }
}

function byColor ( col, by ) {
    var val = col*by;
    if ( val > 255 ) {
        val = 255;
    }
    return val;
}

function set_alpha_block (image, x, y, alphas, heights, group) {
    var cur = 0;
    var layer = rfrctd;
    if ( group == '2' ) {
        layer = rfrctd_blu;
    }
    if ( group == '3' ) {
        layer = rfrctd_grn;
    }
    for (var j = x*block_size; j < (x + 1)*block_size; j++) {
        for (var i = y*block_size; i < (y + 1)*block_size; i++) {
            alpha = linar255tbl[alphas.charAt(cur)];
            by = linarByTbl[heights.charAt(cur++)];
            image.data[(i * image.width + j) * 4 + 0] = byColor(layer.data[(i * image.width + j) * 4 + 0], by);
            image.data[(i * image.width + j) * 4 + 1] = byColor(layer.data[(i * image.width + j) * 4 + 1], by);
            image.data[(i * image.width + j) * 4 + 2] = byColor(layer.data[(i * image.width + j) * 4 + 2], by);
            image.data[(i * image.width + j) * 4 + 3] = alpha;
        }
    }
}

function get_num_filter_data () {
    var str = "num filter data : " + neighborsData.length;
    return str;
}

function dump_filter_data () {
    var dumpStr = "";
    for ( var i = 0; i < neighborsData.length; i++ ) {
        dumpStr += "num:" + i + " n:" + neighborsData[i] + " a:" + alphasData[i] + "<br>";
    }
    return dumpStr;
}
