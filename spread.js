
var x_width = 160;
var y_width = 112;
var block_size = 4;
var running = false;
var lasttime = "0";
var bufData = new Array();
var bufGroup = new Array();
var bufHole = new Array();
var bufDrop = new Array();
var fieldData = new Array(2);
var rectData = new Array(2);
var current = 0;
var prev = 1;

// init field array:
fieldData[0] = new Array();
fieldData[1] = new Array();
for ( x = 0; x < x_width; ++x) {
    fieldData[0][x] = new Array(y_width);
    fieldData[1][x] = new Array(y_width);
}
rectData[0] = new Array();
rectData[1] = new Array();

//         0         10        20        30        40        50        60
//         +----+----+----+----+----+----+----+----+----+----+----+----+---
var ref = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";

if (window.ActiveXObject && !window.XMLHttpRequest)
{
    window.XMLHttpRequest = function() {
        try {
          return (new ActiveXObject('Msxml2.XMLHTTP'));
        }
        catch (e) {}
        try {
          retrurn (new ActiveXObject('Microsoft.XMLHTTP'));
        }
        catch (e) {}
        return (null);
    }
}

function init_field() {
    for ( x = 0; x < x_width; x++ ) {
        for ( y = 0; y < y_width; y++ ) {
            fieldData[current][x][y] = 0;
            fieldData[prev][x][y] = 0;
        }
    }
    rectData[0].length = 0;
    rectData[1].length = 0;
}

function start() {
    running = true;
    init_field();
    request_spread_data();
    update_field();
    document.getElementById("btn_start").disabled = true;
    document.getElementById("btn_stop").disabled = false;
}

function stop() {
    running = false;
    document.getElementById("btn_stop").disabled = true;
    document.getElementById("btn_start").disabled = false;
}

function request_spread_data()
{
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', '/foo/?req=continue&lasttime=' + lasttime + '&posx=25&posy=50', true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4  && xmlhttp.status == 200) {
            update_buffer(xmlhttp.responseText);
        }
    }
    xmlhttp.send(null);
}

function en64code(str) {
    //         0         10        20        30        40        50        60
    //         +----+----+----+----+----+----+----+----+----+----+----+----+---
    //var ref = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    var encoded = "";
    var flag = false;
    var cnt = 0;
    for ( i = 0; i < str.length; i++ ) {
        c = ("1" == str.charAt(i));
        if ( c == flag ) {
            cnt++;
        } else {
            flag = !flag;
            encoded = encoded + ref.charAt(cnt);
            cnt = 1;
        }
        if (cnt == 63) {
            encoded = encoded + "/";
            cnt = 0;
        }
    }
    if (cnt > 0) {
        encoded = encoded + ref.charAt(cnt);
    }
    return encoded;
}

function notc(str) {
    if ( str == "0" ) {
        return "1";
    } else {
        return "0";
    }
}

function ref2int(char) {
    var val = 0;
    while ( ref.charAt(val) != char ) {
        val++;
        if ( val == 64 ) break;
    }
    return val;
}

function de64code(str, groupStr) {
//function de64code(str) {
    //         0         10        20        30        40        50        60
    //         +----+----+----+----+----+----+----+----+----+----+----+----+---
    //var ref = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    var pos = 0;
    var field_x = 0;
    var field_y = 0;
    var groupPos = 0;
    var addchar = "0";
    for ( i = 0; i < str.length; i++ ) {
        c = str.charAt(i);
        var pos = 0;
        while ( ref.charAt(pos++) != c ) {
            fieldData[current][field_x][field_y] = ref2int(addchar);
            if ( ++field_y == y_width ) {
                field_y = 0;
                field_x++;
            }
        }
        if ( c != "/" ) {
            addchar = notc(addchar);
            if ( addchar == "1" ) {
                addchar = groupStr.charAt(groupPos++);
            }
        }
    }
}

function clean_field() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var image = context.getImageData(0, 0, 800, 560);
    var pos = 0;
    for ( x = 0; x < x_width; x++ ) {
        for ( y = 0; y < y_width; y++ ) {
             draw_block(image, x, y, 255, 0, 0, 20);
        }
    }
    context.putImageData(image, 0, 0);
    bufData.length = 0;
    init_field();
}

function toggleCurrentField() {
    if ( current == 0 ) {
        current = 1;
        prev = 0;
    } else {
        current = 0;
        prev = 1;
    }
}

function update_field()
{
    var groupStr = "";
    var holes = new Array();
    var drops = new Array();
    var updated = 0;
    if ( bufData.length > 0 ) {
        str = bufData[0];
        bufData.shift();
        groupStr = bufGroup[0];
        bufGroup.shift();
        holes = bufHole[0];
        bufHole.shift();
        drops = bufDrop[0];
        bufDrop.shift();
        toggleCurrentField();
        de64code(str, groupStr);
        clear_rect_data();
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        var image = context.getImageData(0, 0, block_size*x_width, block_size*y_width);
        for (var x = 0; x < x_width; x++) {
            for (var y = 0; y < y_width; y++) {
                if ( is_block_changed(x, y) ) {
                   filter_alpha_block(image, x, y);
                   updated++;
                }
            }
        }
        context.putImageData(image, 0, 0);

        // holes:
        for (var i = 0; i < 2; i++) {
            var holeDiv = document.getElementById("bottle_" + ("0" + i).slice(-2));
            if ( i < holes.length ) {
                holeDiv.style.left = (block_size*holes[i].x - 28) + "px";
                holeDiv.style.top = (block_size*holes[i].y - 10) + "px";
                var holeCount = document.getElementById("bottle_" + ("0" + i).slice(-2) + "_count");
                holeCount.innerHTML = holes[i].count.toString();
                holeDiv.style.visibility = "visible";
            } else {
                holeDiv.style.visibility = "hidden";
            }
        }

        // drops:
        for (var i = 0; i < 2; i++) {
            var dropDiv = document.getElementById("drop_" + ("0" + i).slice(-2));
            if ( i < drops.length ) {
                dropDiv.style.left = (block_size*drops[i].x - 18) + "px";
                dropDiv.style.top = (block_size*drops[i].y - 18) + "px";
                dropDiv.style.visibility = "visible";
            } else {
                dropDiv.style.visibility = "hidden";
            }
        }
    }
    
    //// debug strings:
    var parsedStr = "buffer num : " + bufData.length + " (update : " + updated + ")<br>";
    for (var i = 0; i < bufData.length; i++) {
        parsedStr += "#";
    }
    parsedStr += "<br>";
    parsedStr += "num holes: " + holes.length + " ";
    for (var i = 0; i < holes.length; i++) {
        parsedStr += " [" + i + "] x:" + holes[i].x + " y:" + holes[i].y + " count:" + holes[i].count;
    }
    parsedStr += "<br>";
    parsedStr += "num drops: " + drops.length + " ";
    for (var i = 0; i < drops.length; i++) {
        parsedStr += " [" + i + "] x:" + drops[i].x + " y:" + drops[i].y + " spread:" + drops[i].spread;
    }
    parsedStr += "<br>";
    parsedStr += get_num_filter_data() + "<br>";

    el = document.getElementById("buffernum");
    el.innerHTML = parsedStr;

    //el = document.getElementById("debugfield");
    //el.innerHTML = groupStr;

    if ( running ) {
        setTimeout('update_field()', 70);
    }
}

function update_buffer(str)
{
    if (window.DOMParser) {
        parser = new DOMParser();
        dom = parser.parseFromString(str,"text/xml");
    } else { // Internet Explorer
        dom = new ActiveXObject("Microsoft.XMLDOM");
        dom.async = "false";
        dom .loadXML(text);
    }

    var parsedStr = "";

    parsedStr += "content length : " + str.length + "<br>";
    parsedStr += "continue :" + dom.getElementsByTagName("continue")[0].textContent + "<br>"; 
    if ( "no" == dom.getElementsByTagName("continue")[0].textContent ) {
        bufData.length = 0;
    }
    parsedStr += "data num :" + dom.getElementsByTagName("numdata")[0].textContent + "<br>"; 
    var data = dom.getElementsByTagName("data");
    for (var i = 0; i < data.length; i++) {
        //parsedStr += "timestamp:" + data[i].getElementsByTagName("timestamp")[0].textContent + "<br>";
        //parsedStr += "map:" + data[i].getElementsByTagName("map")[0].textContent + "<br>";
        bufData.push(data[i].getElementsByTagName("map")[0].textContent);
        bufGroup.push(data[i].getElementsByTagName("group")[0].textContent);
        // holes:
        var holes = new Array();
        var holesData = data[i].getElementsByTagName("holes")[0].getElementsByTagName("hole");
        for (var j = 0; j < holesData.length; j++) {
            var h = holesData[j].textContent.split("|");
            holes.push( { x:parseInt(h[0]), y:parseInt(h[1]), count:parseInt(h[2]) } );
        }
        bufHole.push(holes);
        // drops:
        var drops = new Array();
        var dropsData = data[i].getElementsByTagName("drops")[0].getElementsByTagName("drop");
        for (var j = 0; j < dropsData.length; j++) {
            var h = dropsData[j].textContent.split("|");
            drops.push( { x:parseInt(h[0]), y:parseInt(h[1]), spread:parseInt(h[2]) } );
        }
        bufDrop.push(drops);
    }
    if ( data.length > 0 ) {
        parsedStr += "timestamp : " + data[0].getElementsByTagName("timestamp")[0].textContent;
        parsedStr += " - " + data[data.length - 1].getElementsByTagName("timestamp")[0].textContent + "<br>";
        lasttime = data[data.length-1].getElementsByTagName("timestamp")[0].textContent
    }

    el = document.getElementById("datadump");
    el.innerHTML = parsedStr;

    if ( running ) {
        setTimeout('request_spread_data()', 2000);
    }
}

//// utils //////////////////////////////

function draw_block (image, x, y, r, g, b, alpha) {
    for (var i = y*block_size; i < (y + 1)*block_size; i++) {
        for (var j = x*block_size; j < (x + 1)*block_size; j++) {
            image.data[(i * image.width + j) * 4 + 0] = r;
            image.data[(i * image.width + j) * 4 + 1] = g;
            image.data[(i * image.width + j) * 4 + 2] = b;
            image.data[(i * image.width + j) * 4 + 3] = alpha;
        }
    }
}

function alpha_block (image, x, y, alpha) {
    for (var i = y*block_size; i < (y + 1)*block_size; i++) {
        for (var j = x*block_size; j < (x + 1)*block_size; j++) {
            image.data[(i * image.width + j) * 4 + 3] = alpha;
        }
    }
}

var rfrctd;

function draw_canvas () {
    var bg_img = document.getElementById("bg_img");

    var bg_canvas = document.getElementById("bg_canvas");
    var bg_context = bg_canvas.getContext("2d");
    bg_context.drawImage(bg_img, 0, 0);

    var src = bg_context.getImageData(0, 0, 640, 448);
    rfrctd = bg_context.createImageData(640, 448);
    refract(src, rfrctd);
    //greyer2(rfrctd, 0.1);
    normalize(rfrctd, 0.5);
    color_adjust(rfrctd,1.0,1.0,1.05);

    init_tables();
}
