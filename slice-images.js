const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// The prompt
const inputImagePath = process.argv[2];
if (!inputImagePath) {
    console.error("Please provide an input image file as a command-line argument.");
    process.exit(1);
}

// Output directory
const outputDir = '.';

// Ensure output directory exists
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}${minutes}${seconds}_${milliseconds}`;
}


// Function to slice the image into four quarters
async function sliceImage() {

    const timestamp = getTimestamp();

    const imageOne = sharp(inputImagePath);
    const imageTwo = sharp(inputImagePath);
    const imageThree = sharp(inputImagePath);
    const imageFour = sharp(inputImagePath);

    const { width, height } = await imageOne.metadata();

    if (!width || !height) {
        throw new Error('Unable to read image metadata');
    }

    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    await imageOne
            .extract({ left: 0, top: 0, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, `midjourney_md_image01_${timestamp}.png`));
    await imageTwo
            .extract({ left: halfWidth, top: 0, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, `midjourney_md_image02_${timestamp}.png`));
    await imageThree
            .extract({ left: 0, top: halfHeight, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, `midjourney_md_image03_${timestamp}.png`));
    await imageFour
            .extract({ left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, `midjourney_md_image04_${timestamp}.png`));


    console.log('Image sliced into four quarters successfully.');
}

sliceImage().catch(err => {
    console.error('Error slicing image:', err);
});