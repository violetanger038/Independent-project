const clickableDivs = document.getElementsByClassName('character');
const canvas = document.getElementById('MyCanvas');
const ctx = canvas.getContext('2d');
let sourceImage = document.getElementById('character1');
function DrawDiv(params) {
// Add a click event listener to the div
Array.from(clickableDivs).forEach(div => {
    div.addEventListener('click', function() {
        // Check if the image is loaded before drawing (important for dynamically created images, 
        // but less so for images already in HTML with a set src)
        if (sourceImage.complete) {
        // Clear the canvas first (optional, if you want only one image at a time)
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        // Draw the image onto the canvas
        // drawImage(imageSource, dx, dy, dwidth, dheight)
        // dx, dy are the destination coordinates; dwidth, dheight are destination width and height
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    } else {
        console.error("Image not fully loaded yet!");
        // You can use an onload handler on the image if it's dynamically sourced
    }
})
});
}
Array.from(clickableDivs).forEach(div => {
    div.addEventListener('click', function() {
        const img = div.querySelector('img');
        if (img) {
            sourceImage = img;
        }
        DrawDiv();
    });
    div.addEventListener('mouseenter', function() {
        // Optional: Add hover effect or other interactions
    });
    div.addEventListener('mouseleave', function() {
        // Optional: Remove hover effect or other interactions
    });
});