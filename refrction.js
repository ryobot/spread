// refraction.js

var x_freq = 100;
var y_freq = 50;
var x_amp = 3;
var y_amp = 5;

function get_pixel ( image, x, y ) {
   if ( x < 0 ) {
      x = 0;
   }
   if ( y < 0 ) {
      y = 0;
   }
   if ( x >= image.width ) {
      x = image.width - 1;
   }
   if ( y >= image.height ) {
      y = image.height - 1;
   }
   var rgba = { 
      r:image.data[(y * image.width + x) * 4 + 0],
      g:image.data[(y * image.width + x) * 4 + 1],
      b:image.data[(y * image.width + x) * 4 + 2],
      a:image.data[(y * image.width + x) * 4 + 3]
   };
   return rgba;
}

function get_float_pixel( image, fx, fy ) {
   var ix = Math.floor(fx);
   var iy = Math.floor(fy);
   var px_a = get_pixel(image, ix, iy);
   var px_b = get_pixel(image, ix + 1, iy);
   var px_c = get_pixel(image, ix, iy + 1);
   var px_d = get_pixel(image, ix + 1, iy + 1);
   var dx = fx - ix;
   var dy = fy - iy;
   var rgba = {
      r:px_a.r*(1 - dx)*(1 - dy) + px_b.r*dx*(1 - dy) + px_c.r*(1 - dx)*dy + px_d.r*dx*dy,
      g:px_a.g*(1 - dx)*(1 - dy) + px_b.g*dx*(1 - dy) + px_c.g*(1 - dx)*dy + px_d.g*dx*dy,
      b:px_a.b*(1 - dx)*(1 - dy) + px_b.b*dx*(1 - dy) + px_c.b*(1 - dx)*dy + px_d.b*dx*dy,
      a:px_a.a*(1 - dx)*(1 - dy) + px_b.a*dx*(1 - dy) + px_c.a*(1 - dx)*dy + px_d.a*dx*dy
   };
   return rgba;
}

function refracted( org_x, org_y ) {
   var pos = {
      x:org_x + y_amp*Math.sin(2*Math.PI*org_y/y_freq),
      y:org_y + x_amp*Math.sin(2*Math.PI*org_x/x_freq),
   };
   return pos;
}

function wave( x, y ) {
   var val = 0.7 + 0.3*Math.sin(2*Math.PI*(x + y)/300);
   return val;
}

function refract( src_image, dst_image ) {
   for (var i = 0; i < dst_image.height; i++) {
      for (var j = 0; j < dst_image.width; j++) {
	 var pos = refracted(j, i);
	 var rgba = get_float_pixel(src_image, pos.x, pos.y);
	 var val = wave(i, j);
	 dst_image.data[(i * dst_image.width + j) * 4 + 0] = rgba.r * val;
	 dst_image.data[(i * dst_image.width + j) * 4 + 1] = rgba.g * val;
	 dst_image.data[(i * dst_image.width + j) * 4 + 2] = rgba.b * val;
	 dst_image.data[(i * dst_image.width + j) * 4 + 3] = rgba.a * val;
      }
   }
}
