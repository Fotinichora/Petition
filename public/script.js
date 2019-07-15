//Get the Canvas Element
const canvasSignature = document.getElementById("signature");
const signInput = document.getElementById("signature-input");

var ctx = canvasSignature.getContext("2d");
var mouseX;
var mouseY;

let beginDrawing = false;


function clearSig(e) {
    e.preventDefault();
    ctx.clearRect(0, 0, canvasSignature.width, canvasSignature.height);
}

function writeSig(e) {
    if (beginDrawing == true) {
        ctx.beginPath();
        ctx.fillStyle = "#C0C0C0";
        ctx.shadowColor = "black";
        ctx.strokeStyle = "black";
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(e.offsetX, e.offsetY);

        mouseX = e.offsetX;
        mouseY = e.offsetY;

        ctx.stroke();
    }
}

canvasSignature.addEventListener("mousedown", function(e) {
    beginDrawing = true;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
});


canvasSignature.addEventListener("mousemove", writeSig);

canvasSignature.addEventListener("mouseup" || "mouseout", () => {
    beginDrawing = false;
    signInput.value = canvasSignature.toDataURL();
});


