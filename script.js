/* =====================================================
   AKWAOS SCRIPT.JS
   ===================================================== */



/* =====================================================
   BOOT SEQUENCE
   ===================================================== */


window.addEventListener("load",()=>{


    setTimeout(()=>{


        const boot =
        document.getElementById("bootScreen");


        if(boot){

            boot.remove();

        }


    },6000);


});







/* =====================================================
   WINDOWS
   ===================================================== */


let topLayer = 50;



function openWindow(id){


    const win =
    document.getElementById(id);


    if(!win)
        return;



    win.classList.add("active");


    topLayer++;


    win.style.zIndex =
    topLayer;



}





function closeWindow(id){


    const win =
    document.getElementById(id);


    if(win){

        win.classList.remove("active");

    }


}








/* =====================================================
   DRAG WINDOWS
   ===================================================== */


document
.querySelectorAll(".window")
.forEach(win=>{


let dragging=false;

let offsetX=0;
let offsetY=0;


const header =
win.querySelector(".window-header");



header.addEventListener(
"mousedown",
e=>{


dragging=true;


offsetX =
e.clientX -
win.offsetLeft;


offsetY =
e.clientY -
win.offsetTop;


topLayer++;

win.style.zIndex =
topLayer;


});




document.addEventListener(
"mousemove",
e=>{


if(!dragging)
return;



win.style.left =
(e.clientX-offsetX)+"px";


win.style.top =
(e.clientY-offsetY)+"px";


});




document.addEventListener(
"mouseup",
()=>{

dragging=false;

});



});









/* =====================================================
   CLOCK
   ===================================================== */


function updateClock(){


const now =
new Date();



document.getElementById(
"clock"
).textContent =


now.toLocaleTimeString();



}


setInterval(
updateClock,
1000
);


updateClock();








/* =====================================================
   TERMINAL
   ===================================================== */


const terminalInput =
document.getElementById(
"terminalInput"
);



const terminalOutput =
document.getElementById(
"terminalOutput"
);




if(terminalInput){



terminalInput.addEventListener(
"keydown",
e=>{


if(e.key !== "Enter")
return;



let command =
terminalInput.value
.trim()
.toLowerCase();



terminalInput.value="";



writeTerminal(
"AKWA_OS> "+command
);



executeCommand(command);



});



}






function writeTerminal(text){


terminalOutput.textContent +=
"\n"+text;



terminalOutput.scrollTop =
terminalOutput.scrollHeight;


}





function executeCommand(cmd){



switch(cmd){


case "help":


writeTerminal(
`
AVAILABLE COMMANDS:

help
 - command list

clear
 - clear terminal

status
 - system information

whoami
 - current user

scan
 - network scan

boot
 - restart system
`
);

break;






case "clear":


terminalOutput.textContent="";


break;






case "status":


writeTerminal(
`
SYSTEM STATUS

CPU: OK
MEMORY: OK
NETWORK: ONLINE
AKWA_CORE: RUNNING
`
);


break;






case "whoami":


writeTerminal(
"USER: UNKNOWN"
);


break;






case "scan":


writeTerminal(
`
SCANNING...

NODE 01 FOUND
NODE 02 FOUND
NODE 07 FOUND

UNKNOWN DEVICE DETECTED
`
);


break;






case "boot":


location.reload();


break;






default:


writeTerminal(
"COMMAND NOT FOUND"
);


}



}









/* =====================================================
   GAME 01
   ===================================================== */


function startGame(){


const msg =
document.getElementById(
"gameMessage"
);



msg.textContent =
"CONNECTING...";



setTimeout(()=>{


msg.textContent =
"SEARCHING CHANNEL";


},1000);




setTimeout(()=>{


msg.textContent =
"CHANNEL 07 FOUND";


},2200);




setTimeout(()=>{


msg.textContent =
"ACCESS GRANTED";


},3500);



}










/* =====================================================
   OLD PC HUM
   ===================================================== */



let audioStarted=false;



document.addEventListener(
"click",
()=>{


if(audioStarted)
return;


audioStarted=true;



const AudioContext =
window.AudioContext ||
window.webkitAudioContext;



if(!AudioContext)
return;




const ctx =
new AudioContext();






const osc =
ctx.createOscillator();



const gain =
ctx.createGain();



osc.type =
"sine";


osc.frequency.value =
55;



gain.gain.value =
0.025;



osc.connect(gain);

gain.connect(
ctx.destination
);


osc.start();





const fan =
ctx.createOscillator();



const fanGain =
ctx.createGain();



fan.type =
"sine";


fan.frequency.value =
120;



fanGain.gain.value =
0.008;



fan.connect(fanGain);

fanGain.connect(
ctx.destination
);



fan.start();




},


{
once:true
}

);
