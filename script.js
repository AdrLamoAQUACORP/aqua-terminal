/* =====================================
   AKWAOS SCRIPT
===================================== */



/* =====================================
   BOOT + SOUND
===================================== */


window.addEventListener("load",()=>{


const sound =
document.getElementById("bootSound");



setTimeout(()=>{


if(sound){


sound.volume = 0.7;


sound.play()
.catch(()=>{

console.log(
"Browser blocked autoplay"
);


});


}


},1200);





setTimeout(()=>{


const boot =
document.getElementById(
"bootScreen"
);



if(boot){


boot.style.opacity="0";


setTimeout(()=>{


boot.remove();


},1000);


}


},6000);



});









/* =====================================
   WINDOWS
===================================== */



let layer = 100;




function openWindow(id){


const win =
document.getElementById(id);



if(!win)
return;



win.classList.add(
"active"
);



layer++;


win.style.zIndex =
layer;



}







function closeWindow(id){


const win =
document.getElementById(id);



if(win){

win.classList.remove(
"active"
);

}


}









/* =====================================
   WINDOW MOVE
===================================== */


document
.querySelectorAll(".window")
.forEach(win=>{


let move=false;

let x=0;

let y=0;



const header =
win.querySelector(
".window-header"
);




header.addEventListener(
"mousedown",
(e)=>{


move=true;


x =
e.clientX -
win.offsetLeft;


y =
e.clientY -
win.offsetTop;



layer++;


win.style.zIndex =
layer;


});






document.addEventListener(
"mousemove",
(e)=>{


if(!move)
return;



win.style.left =
(e.clientX-x)
+"px";



win.style.top =
(e.clientY-y)
+"px";


});






document.addEventListener(
"mouseup",
()=>{


move=false;


});



});









/* =====================================
   CLOCK
===================================== */


function clock(){


let c =
document.getElementById(
"clock"
);



if(c){


c.innerHTML =
new Date()
.toLocaleTimeString();



}


}



setInterval(
clock,
1000
);


clock();









/* =====================================
   TERMINAL
===================================== */


const input =
document.getElementById(
"terminalInput"
);


const output =
document.getElementById(
"terminalOutput"
);





function terminalWrite(text){


output.textContent +=
"\n"+text;



output.scrollTop =
output.scrollHeight;


}





if(input){


input.addEventListener(
"keydown",
(e)=>{


if(e.key==="Enter"){


let cmd =
input.value
.trim()
.toLowerCase();



input.value="";



terminalWrite(
"AKWA_OS> "+cmd
);



runCommand(cmd);



}


});


}








function runCommand(cmd){



switch(cmd){



case "help":


terminalWrite(`

COMMANDS:

help
clear
status
whoami
scan
logs
boot

`);

break;





case "clear":


output.textContent="";


break;





case "status":


terminalWrite(`

SYSTEM STATUS

CPU : OK
RAM : OK
CORE : RUNNING
NETWORK : ONLINE

`);

break;





case "whoami":


terminalWrite(

"LAST USER: Adrian_lamo"

);


break;





case "scan":


terminalWrite(`

NETWORK SCAN

NODE_01 FOUND
NODE_04 FOUND
NODE_07 FOUND

UNKNOWN SIGNAL DETECTED

`);

break;





case "logs":


terminalWrite(`

SYSTEM LOG:

03:41 BOOT
03:42 NETWORK START
03:43 USER LOGIN

`);

break;





case "boot":


location.reload();


break;





default:


terminalWrite(
"ERROR: COMMAND NOT FOUND"
);



}



}









/* =====================================
   GAME 01
===================================== */


function startGame(){


let msg =
document.getElementById(
"gameMessage"
);



msg.innerHTML =
"CONNECTING...";




setTimeout(()=>{


msg.innerHTML =
"SEARCHING SERVER";


},1000);




setTimeout(()=>{


msg.innerHTML =
"ACCESS GRANTED";


},2500);





setTimeout(()=>{


msg.innerHTML =
"GAME STARTED";


},4000);



}









/* =====================================
   OLD PC HUM
===================================== */


let started=false;




document.addEventListener(
"click",
()=>{


if(started)
return;


started=true;



try{


let ctx =
new AudioContext();



let osc =
ctx.createOscillator();


let gain =
ctx.createGain();




osc.type="sine";


osc.frequency.value=55;



gain.gain.value=.03;



osc.connect(gain);


gain.connect(
ctx.destination
);



osc.start();





let fan =
ctx.createOscillator();


let fanGain =
ctx.createGain();



fan.type="sine";


fan.frequency.value=120;



fanGain.gain.value=.008;



fan.connect(
fanGain
);



fanGain.connect(
ctx.destination
);



fan.start();



}

catch(e){}



},
{
once:true
}

);
