/* =====================================
   AKWA OS v1.0
   SYSTEM CORE
===================================== */



/* =====================================
   BOOT + SOUND
===================================== */


window.addEventListener("load",()=>{


const sound =
document.getElementById("bootSound");


let started=false;



function startSound(){


if(started)
return;


started=true;



if(sound){


sound.volume=0.8;


sound.play()
.catch(()=>{

console.log(
"Audio blocked"
);

});


}



}




// первое нажатие = POWER ON

document.addEventListener(
"click",
startSound,
{
once:true
}

);





// убрать BIOS

setTimeout(()=>{


let boot =
document.getElementById(
"bootScreen"
);



if(boot){


boot.style.opacity="0";


setTimeout(()=>{


boot.remove();


},1500);


}



},8500);




});









/* =====================================
   WINDOWS
===================================== */


let topLayer=100;



function openWindow(id){


let win =
document.getElementById(id);



if(!win)
return;



win.classList.add(
"active"
);



topLayer++;


win.style.zIndex=
topLayer;


}



function closeWindow(id){


let win =
document.getElementById(id);



if(win)

win.classList.remove(
"active"
);


}









/* =====================================
   DRAG WINDOWS
===================================== */


document
.querySelectorAll(".window")
.forEach(win=>{


let moving=false;

let offsetX=0;

let offsetY=0;



let header =
win.querySelector(
".window-header"
);





header.addEventListener(
"mousedown",
e=>{


moving=true;


offsetX =
e.clientX -
win.offsetLeft;


offsetY =
e.clientY -
win.offsetTop;



topLayer++;

win.style.zIndex=
topLayer;



});







document.addEventListener(
"mousemove",
e=>{


if(!moving)
return;



win.style.left =
e.clientX-offsetX+"px";


win.style.top =
e.clientY-offsetY+"px";


});






document.addEventListener(
"mouseup",
()=>{


moving=false;


});



});









/* =====================================
   CLOCK
===================================== */


function updateClock(){


let clock =
document.getElementById(
"clock"
);



if(clock){


clock.innerHTML =
new Date()
.toLocaleTimeString();


}


}



setInterval(
updateClock,
1000
);


updateClock();









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





function print(text){


output.textContent +=
"\n"+text;


output.scrollTop =
output.scrollHeight;


}







if(input){


input.addEventListener(
"keydown",
e=>{


if(e.key==="Enter"){



let command =
input.value
.toLowerCase()
.trim();



input.value="";



print(
"AKWA_OS> "+command
);



runCommand(command);



}



});


}









function runCommand(cmd){



switch(cmd){



case "help":


print(`

AVAILABLE COMMANDS:


help

clear

status

whoami

scan

logs

files

shutdown


`);


break;








case "clear":


output.textContent="";


break;








case "status":


print(`


SYSTEM STATUS


CPU ........ OK

MEMORY ..... OK

CORE ....... RUNNING

NETWORK .... ONLINE


`);


break;








case "whoami":


print(`


LAST USER:


Adrian_lamo


STATUS:

ARCHIVED


`);


break;








case "scan":


print(`


NETWORK SCAN


NODE_01 FOUND

NODE_02 FOUND


UNKNOWN SIGNAL


ACCESS LEVEL:

UNKNOWN


`);


break;








case "logs":


openWindow(
"logs"
);


break;








case "files":


print(`


DIRECTORY:


/SYSTEM

/BACKUP

/CONFIG

/UNKNOWN


`);


break;








case "shutdown":


shutdown();


break;








default:


print(

"ERROR:

COMMAND NOT FOUND"

);



}



}









/* =====================================
   GAME
===================================== */


function startGame(){


let msg =
document.getElementById(
"gameMessage"
);



msg.innerHTML=
"INITIALIZING...";




setTimeout(()=>{


msg.innerHTML=
"CONNECTING SERVER...";


},1500);





setTimeout(()=>{


msg.innerHTML=
"ACCESS GRANTED";


},3000);





setTimeout(()=>{


msg.innerHTML=
"GAME STARTED";


},4500);



}









/* =====================================
   SHUTDOWN
===================================== */


function shutdown(){



document.body.style.transition=
"2s";


document.body.style.filter=
"brightness(0)";



setTimeout(()=>{


location.reload();


},3000);


}









/* =====================================
   OLD PC FAN SOUND
===================================== */


let fanStarted=false;



document.addEventListener(
"click",
()=>{


if(fanStarted)
return;


fanStarted=true;



try{


let ctx =
new AudioContext();



let osc =
ctx.createOscillator();


let gain =
ctx.createGain();




osc.type="sine";


osc.frequency.value=55;


gain.gain.value=.025;



osc.connect(gain);


gain.connect(
ctx.destination
);



osc.start();



}

catch(e){}



},
{
once:true
}

);
