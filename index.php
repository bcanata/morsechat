<!doctype html>
<html>
<head>
<title>morse chat</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no">
 <meta name="application-name" content="online morse radio"/>
<meta name="keywords" content="morse,telegraph,radio,frequency,chatroom,online,bugs" />
<meta name="description" content="an online morse radio" />
<meta name="msapplication-TileColor" content="#212121" />
<meta name="theme-color" content="#212121" />

<link href="css/style.css" rel="stylesheet" />
<link href="css/icons.css" rel="stylesheet" />

<link href="https://fonts.googleapis.com/css?family=Roboto:300" rel="stylesheet">
 <!--<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"> -->
<script>
var config = <?php
//############################################################
//transfer php data to js
$config = include('app/config.php');
//careful here!
$out = array(
	'PUSHER_KEY' => $config['APP_KEY'],
	'PUSHER_CLUSTER' => $config['APP_CLUSTER'],
	'MAX_CHANNELS' => $config['MAX_CHANNELS']
);
echo json_encode($out, JSON_HEX_TAG);
//############################################################
?>

</script>
<script src="js/main.js"></script>
<script src="js/gui.js"></script>
<script src="js/pusher_min.js"></script>
<!--<script src="js/min.js" defer ></script>-->
<!--<script src="js/pusher_min.js" defer ></script>-->
</head>
<body>

    <div id="nav">
		<button class="hamburger" onclick="openMenu()" ><i class="material-icons">menu</i></button>
		<a onclick="ch()">ch 1 <i class="material-icons">arrow_drop_down</i></a>
		<button class="settingsbt" onclick="openSettings()"><i class="material-icons">settings</i></button>
		<button class="showmorsebt" onclick="openMlSidebar()"><i class="material-icons">library_books</i></button>
    </div>

	<div id="container">
		<div id="timebar">
			<div id="timebar_bar"></div>
		</div>
		<p id="dispbar"><a id="phraseDisp"> </a> <a id="letterDisp"></a></p>
		<div id="chat">
		
			<div id="chatPopup">
			</div>
			
			<p id="connecting-msg">connecting...</p>
		</div>
		<div class="keyContainer">
		   <button id="key" style="cursor:pointer" onClick="" ></button>
		</div>
		<i onclick="scrollDown()" id="radiobt" class="material-icons">arrow_drop_down</i>
	</div>
 

	<!-- <div id="key" style="cursor:pointer" onClick="" >
	</div> -->
 
<div class="morseListContainer" id="morseListSideBar">
	<button onclick="closeMlSidebar()"><i class="material-icons">close</i></button>
	<button onclick="stretchMlSidebar()"><i class="material-icons">fullscreen</i></button>
	<button onclick="unstretchMlSidebar()"><i class="material-icons">keyboard_arrow_right</i></button>
	<div id="morseList">
		<p>A .-</p><p>B -...</p><p>C -.-.</p><p>D -..</p>
		<p>E .</p><p>F ..-.</p><p>G --.</p><p>H ....</p>
		<p>I ..</p><p>J .---</p><p>K -.-</p><p>L .-..</p>
		<p>M --</p><p>N -.</p><p>O ---</p><p>P .--.</p>
		<p>Q --.-</p><p>R .-.</p><p>S ...</p><p>T -</p>
		<p>U ..-</p><p>V ...-</p><p>W .--</p><p>X -..-</p>
		<p>Y -.--</p><p>Z --..</p><p>. .-.-.-</p><p>, --..--</p>
		<p>? ..--..</p><p>' .----.</p><p>! -.-.--</p><p>/ -..-.</p>
		<p>: ---...</p><p>; -.-.-.</p><p>= -...-</p><p>+ .-.-.</p>
		<p>- -....-</p><p>@ .--.-.</p><p>1 .----</p><p>2 ..---</p>
		<p>3 ...--</p><p>4 ....-</p><p>5 .....</p><p>6 -....</p>
		<p>7 --...</p><p>8 ---..</p><p>9 ----.</p><p>0 -----</p>
		<p><a onclick="popup('......','error (6 dots) - removes the last typed letter')" >error:</a><br> ......</p>
		<p><a target="_blank" href="https://en.wikipedia.org/wiki/Morse_code">wiki</a></p>
		<p><a target="_blank" href="https://en.wikipedia.org/wiki/Morse_code_mnemonics">wiki mnemonics</a></p>
		<p><a onclick="popup('morse visual chart','<img src=\'visual2.png\' alt=\'mnemonic img\' style=\'width:100%;height:auto\' >') " >mnemonic</a></p>
	</div>
</div>

<div class="menuContainer" id="menu">
	<div class="menuHeader">
		<button onclick="this.parentNode.parentNode.style.display='none'"><i class="material-icons">close</i></button>
		<p id="sidebar_username_disp">[connecting..]</p>
		<!--<a onclick="changeUsername()">change username</a>-->
	</div>
  <hr>
	<div class="links">
		<p><a href="http://halb.it">homepage</a></p>
		<p><a href="javascript:alert('coming soon')">practice</a></p>
		<p><a href="about.php">about</a></p>
		<p><a href="bug.php">bug</a></p>
		<p><a href="https://github.com/robalb/morsechat"><img class="icon-32" src="css/GitHub-Mark-Light-32px.png"></a></p>
	</div>
</div>


<div class="settingsContainer" id="settings">
	<div id="container2">
<button class="stbt" onclick="document.getElementById('settings').style.display='none'"><i class="material-icons">close</i></button>
	<h2 class="stt">settings</h2>

	<h3>timings</h3>
<p>The basic element of Morse code is the dot, all the other elements can be defined in terms of multiples of the dot length.
<!-- <a href="http://www.nu-ware.com/NuCode%20Help/index.html?morse_code_structure_and_timing_.htm">more info</a>--> </p>
		<h4>dot speed</h4>
	<p id="rangeCont"><input type="range" id="speedRange" min="10" value="80" onInput="settings.updateMultiplier(0,this.value)" max="500">
	<br><br>
	<a id="dotSpeedDisp">80</a> ms ( <a id="dotWpmDisp">15</a> wpm )
	</p>
	<br>
	
<p>This is the table of the other elements. increasing the value of <i>[pause between words]</i> and <i>[pause before sending]</i>
can be useful while learning the code</p>

	<table>
	  <tbody>
	   <tr>
	    <th>code element</th>
	    <th>dot speed multiplier</th>
	   </tr>	   
	   <tr>
	    <td>dash length</td>
	    <td><input class="tElement" step="0.1" autocomplete="off" min="0.1" max="500" type="number" onInput="settings.updateMultiplier(1,this.value)" value="3"></input></td>
	   </tr>	   
	   <tr>
	    <td>pause between elements</td>
	    <td><input class="tElement" step="0.1" autocomplete="off" min="0.1" max="500" type="number" onInput="settings.updateMultiplier(2,this.value)" value="1"></input></td>
	   </tr>	   
	   <tr>
	    <td>pause between characters</td>
	    <td><input class="tElement" step="0.1" autocomplete="off" min="0.1" max="500" type="number" onInput="settings.updateMultiplier(3,this.value)" value="3"></input></td>
	   </tr>	   
	   <tr>
	    <td>pause between words</td>
	    <td><input class="tElement" step="0.1" autocomplete="off" min="0.1" max="500" type="number" onInput="settings.updateMultiplier(4,this.value)" value="5"></input></td>
	   </tr>
	   <tr>
	    <td>pause before sending</td>
	    <td><input class="tElement" step="0.1" autocomplete="off" min="0.1" max="4000" type="number" onInput="settings.updateMultiplier(5,this.value)" value="2000"></input></td>
	   </tr>
	  </tbody>
	</table>
		<p>the values in this table are multiplied with the dot speed</p>

		<button class="button button-positive" onclick="settings.restoreDefaultMultipliers()">restore default settings</button><br><br>
	<button class="button" onclick="settings.dumpAsString()">export configuration</button>
	<button class="button" onclick="settings.importFromString()">import configuration code</button><br>
	<input type="text" autocomplete="off" id="stringInput" placeholder="paste here your code"><br>
	<h3>sound settings</h3>
	<button class="button" id="ksbutton" onclick="settings.toggleKeySound()">disable key sound</button>
	<button class="button" id="rmbutton" onclick="settings.toggleReceivedSound()">mute received morse</button><br>
	<br><br>
	<br><br>
	<br><br>
	</div>
</div>




  
<div id="popup" class="modal">
  <div class="vcenter">
  <div class="modalContent">
	<button class="modalBt" onclick="document.getElementById('popup').style.display ='none'"><i class="material-icons">close</i></button>
    <h2 id="popupTitle">title</h2>
	<div id="popupContent"> <p>hello</p> </div>
  </div>
  </div>
</div>
 




</body>
</html>