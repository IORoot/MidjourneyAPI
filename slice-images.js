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

// Function to slice the image into four quarters
async function sliceImage() {
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
            .toFile(path.join(outputDir, 'midjourney_image_quarter1.png'));
    await imageTwo
            .extract({ left: halfWidth, top: 0, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, 'midjourney_image_quarter2.png'));
    await imageThree
            .extract({ left: 0, top: halfHeight, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, 'midjourney_image_quarter3.png'));
    await imageFour
            .extract({ left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight })
            .toFile(path.join(outputDir, 'midjourney_image_quarter4.png'));


    console.log('Image sliced into four quarters successfully.');
}

sliceImage().catch(err => {
    console.error('Error slicing image:', err);
});