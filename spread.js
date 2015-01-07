
var x_width = 160;
var y_width = 112;
var block_size = 4;
var running = false;
var prev_str = "";
var lasttime = "0";
var bufData = new Array();
var bufGroup = new Array();

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

function init_prev_str() {
    prev_str = "";
    var tmp_str = "";   
    for ( x = 0; x < x_width; x++ ) {
        tmp_str += "0";
    }
    for ( y = 0; y < y_width; y++ ) {
        prev_str += tmp_str;
    }
}

/*
function changeImage(x, y, chk) {
  name = x.toString() + "_" + y.toString();
  el = document.getElementById(name);
  if ( chk ) {
    el.src = "on_mini.png";
  } else {
    el.src = "off_mini.png";
  }
}*/

function start() {
    running = true;
    init_prev_str();
    request_spread_data();
    update_field();
    document.getElementById("btn_start").disabled = true;
    document.getElementById("btn_stop").disabled = false;
}

function stop() {
    running = false;
    document.getElementById("btn_stop").disabled = true;
    document.getElementById("btn_start").disabled = false;
    //el = document.getElementById("filterdata");
    //el.innerHTML = dump_filter_data();
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

function de64code(str, groupStr) {
//function de64code(str) {
    //         0         10        20        30        40        50        60
    //         +----+----+----+----+----+----+----+----+----+----+----+----+---
    //var ref = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    var decoded = "";
    var pos = 0;
    var groupPos = 0;
    var addchar = "0";
    for ( i = 0; i < str.length; i++ ) {
        c = str.charAt(i);
        var pos = 0;
        while ( ref.charAt(pos++) != c ) {
            decoded = decoded + addchar;
        }
        if ( c != "/" ) {
            addchar = notc(addchar);
            if ( addchar == "1" ) {
                addchar = groupStr.charAt(groupPos++);
            }
        }
    }
    return decoded;
}

function clean_field() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var image = context.getImageData(0, 0, 800, 560);
    var pos = 0;
    for ( x = 0; x < x_width; x++ ) {
        for ( y = 0; y < y_width; y++ ) {
            //changeImage( x, y, false );
             draw_block(image, x, y, 255, 0, 0, 20);
        }
    }
    context.putImageData(image, 0, 0);
    bufData.length = 0;
    init_prev_str();
}

function update_field()
{
    var groupStr = "";
    var decoded = "";
    if ( bufData.length > 0 ) {
        str = bufData[0];
        bufData.shift();
        groupStr = bufGroup[0];
        bufGroup.shift();
        decoded = de64code(str, groupStr);
        //decoded = de64code(str);
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        var image = context.getImageData(0, 0, block_size*x_width, block_size*y_width);
        var pos = 0;
        for (var x = 0; x < x_width; x++) {
            for (var y = 0; y < y_width; y++) {
                /*
                c = decoded.charAt(pos);
                if ( c != prev_str.charAt(pos) ) {
                   //changeImage( x, y, ( c == "1" ) );
                   if ( c == "1" ) {
                      alpha_block(image, x, y, 100);
                   } else {
                      alpha_block(image, x, y, 10);
                   }
                }
                pos++;
                */
                if ( is_neighbors_changed(x, y, decoded) ) {
                   filter_alpha_block(image, x, y, decoded);
                }
            }
        }
        context.putImageData(image, 0, 0);

        prev_str = decoded;
    }

    var parsedStr = "buffer num : " + bufData.length + "<br>";
    for (var i = 0; i < bufData.length; i++) {
        parsedStr += "#";
    }
    parsedStr += "<br>";   
    parsedStr += get_num_filter_data() + "<br>";

    el = document.getElementById("buffernum");
    el.innerHTML = parsedStr;

    //el = document.getElementById("debugfield");
    //el.innerHTML = groupStr;

    if ( running ) {
        setTimeout('update_field()', 90);
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
            //image.data[(i * image.width + j) * 4 + 2] = 255;
            image.data[(i * image.width + j) * 4 + 3] = alpha;
        }
    }
}

function color_adjust ( image, by_red, by_grn, by_blu ) {
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            // red
            val = image.data[(y * image.width + x) * 4 + 0] * by_red;
            if ( val > 255 ) {
                val = 255
            }
            image.data[(y * image.width + x) * 4 + 0] = val;
            // green
            val = image.data[(y * image.width + x) * 4 + 1] * by_grn;
            if ( val > 255 ) {
                val = 255
            }
            image.data[(y * image.width + x) * 4 + 1] = val;
            // blue
            val = image.data[(y * image.width + x) * 4 + 2] * by_blu;
            if ( val > 255 ) {
                val = 255
            }
            image.data[(y * image.width + x) * 4 + 2] = val;	 
        }
    }
}

function greyer ( image, ratio ) {
    var m_red = 0;
    var m_grn = 0;
    var m_blu = 0;
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            m_red += image.data[(y * image.width + x) * 4 + 0];
            m_grn += image.data[(y * image.width + x) * 4 + 1];
            m_blu += image.data[(y * image.width + x) * 4 + 2];
        }
    }
    m_red /= image.width*image.height;
    m_grn /= image.width*image.height;
    m_blu /= image.width*image.height;

    color_adjust( image,
                 128/((m_red - 128)*ratio + 128),
                 128/((m_grn - 128)*ratio + 128),
                 128/((m_blu - 128)*ratio + 128) );
}

var rfrctd;
var rfrctd_blu;
var rfrctd_grn;

function draw_canvas () {
    var bg_img = document.getElementById("bg_img");

    var bg_canvas = document.getElementById("bg_canvas");
    var bg_context = bg_canvas.getContext("2d");
    bg_context.drawImage(bg_img, 0, 0);

    var src = bg_context.getImageData(0, 0, 640, 448);
    rfrctd = bg_context.createImageData(640, 448);
    refract(src, rfrctd);
    greyer(rfrctd, 0.2);
    color_adjust(rfrctd,1.2,1.0,1.0);

    rfrctd_blu = bg_context.createImageData(640, 448);
    refract(src, rfrctd_blu);
    greyer(rfrctd_blu, 0.2);
    color_adjust(rfrctd_blu,1.0,1.0,1.2);
    
    rfrctd_grn = bg_context.createImageData(640, 448);
    refract(src, rfrctd_grn);
    greyer(rfrctd_grn, 0.2);
    color_adjust(rfrctd_grn,1.0,1.2,1.0);
    
    init_tables();
}
