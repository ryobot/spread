<?php
$uiStr = "";
$img_url = "sample_map.png";
if (isset($_GET['img_url'])) {
   $img_url = $_GET['img_url'];
}
/*
for ($y = 0; $y < 112; $y++) {
  for ($x = 0; $x < 160; $x++) {
    $name = $x . "_" . $y;
    $uiStr .= "<img src='off_mini.png' id='" . $name . "' onClick='changeImage(".$x.", ".$y.", true)'>";
  }
  $uiStr .= "<br>";
}*/
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>spread test</title>
<script src="filter.js" language="javascript"></script>
<script src="refrction.js" language="javascript"></script>
<script src="img_utils.js" language="javascript"></script>
<script src="spread.js" language="javascript"></script>
<script type="text/javascript">
<!--
window.onload = function() {
   draw_canvas();
}
function changeImage(img_url) {
   location.href = "spread.php?img_url=" + document.getElementById("img_url").value;
}
-->
</script>
</head>
<body>
<div align="center">
<p>
<button id="btn_start" onclick="start()">start</button>
<button id="btn_stop" onclick="stop()" disabled>stop</button>
</p>
<div align='center' style="height: 448px;">
<div style="position: relative; width: 640px;">
<img src="<?php echo $img_url; ?>" id="bg_img" width="640" height="448" style="position: absolute; left: 0; top: 0; z-index: 0;">
<canvas id="bg_canvas" width="640" height="448" style="position: absolute; left: 0; top: 0; z-index: 1;"></canvas>
<canvas id="canvas" width="640" height="448" style="position: absolute; left: 0; top: 0; z-index: 2;"></canvas>
<div id="bottle_00" style="position: absolute; z-index: 3; visibility: hidden;"><img src="bottle.png"><span id="bottle_00_count">0</span></div>
<div id="bottle_01" style="position: absolute; z-index: 3; visibility: hidden;"><img src="bottle.png"><span id="bottle_01_count">0</span></div>
<div id="drop_00" style="position: absolute; z-index: 3; visibility: hidden;"><img src="drop.png"></div>
<div id="drop_01" style="position: absolute; z-index: 3; visibility: hidden;"><img src="drop.png"></div>
</div>
</div>
<!-- 
<?php echo $uiStr; ?>
-->
<table><tr><td>
<td width=200><font size="-2"><span id="datadump">response data</span></font></td>
<td width=400><font size="-2"><span id="buffernum">buffer data</span></font></td>
</tr><tr>
<td colspan=2><font size="-2"><span id="filterdata">filter data</span></font></td>
</tr></table>
</div>
<p>
<button id="btn_chg_img" onclick="changeImage()">change img</button>
<input type=text id="img_url" value="sample_map.png">
</p>
<span id="debugfield">data</span>
</body>
</html>
