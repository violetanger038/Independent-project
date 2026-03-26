const canvas = document.getElementById("MyCanvas");
const ctx = canvas.getContext("2d");
const img = new Image(); // Create a new Image object
img.src = ""; // Set the source URL

img.onload = function() {
  // Drawing code goes here, inside the onload function
  // because the image is guaranteed to be loaded at this point.
  drawImageOnCanvas(img);
};

function drawImageOnCanvas(image) {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}