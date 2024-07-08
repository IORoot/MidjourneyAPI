// ╭──────────────────────────────────────────────────────────────────────────╮
// │                                                                          │░
// │                         MidJourney API Interface                         │░
// │                                                                          │░
// ╰░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

// ╭───────────────────────────────────────────────────────╮
// │                         Info                          │
// ╰───────────────────────────────────────────────────────╯
// This will take a prompt on the command-line:
// > npx tsx imagine.ts "botanical plants made with tiny electronic parts"
//
// It will generate four images and select the first Option. 
// Once the image is selected it will then use the "upscale (subtle)" to create 
// a high-res version.
//
// The output will be:
// midjourney_images_quad_urls.txt      - URL of the image with four versions
// midjourney_images_upscaled_urls.txt  - URL of the upscaled generated image
//
// You can download the image using curl:
// > curl -o midjourney_image.jpg $(cat image_url.txt)


// ╭───────────────────────────────────────────────────────╮
// │                  Settings for client                  │
// ╰───────────────────────────────────────────────────────╯
// SalaiToken: string;                      //DISCORD_TOKEN
// ChannelId?: string;                      //DISCORD_CHANNEL_ID
// ServerId?: string;                       //DISCORD_SERVER_ID
// BotId?: typeof MJBot | typeof NijiBot;   //DISCORD_BOT_ID MJBot OR NijiBot
// Debug?: boolean;                         // print log
// ApiInterval?: number;                    //ApiInterval request api interval
// Limit?: number;                          //Limit of get message list
// MaxWait?: number;
// Remix?: boolean;                         //Remix:true use remix mode
// Ws?: boolean;                            //Ws:true use websocket get discord message (ephemeral message)
// HuggingFaceToken?: string;               //HuggingFaceToken for verify human
// SessionId?: string;
// DiscordBaseUrl?: string;
// ImageProxy?: string;
// WsBaseUrl?: string;
// fetch?: FetchFn;                         //Node.js<18 need node.fetch Or proxy
// WebSocket?: WebSocketCl;                 //isomorphic-ws Or proxy

const fs = require('fs');
const path = require('path');

import "dotenv/config";
import { Midjourney } from "./src";

// ╭───────────────────────────────────────────────────────╮
// │    Extract the prompt from command-line arguments     │
// ╰───────────────────────────────────────────────────────╯

// The prompt
const prompt = process.argv[2];
if (!prompt) {
    console.error("Please provide a prompt as a command-line argument.");
    process.exit(1);
}

// Get the third command-line argument
let upscale = Number(process.argv[3]);

async function main() {

	// ╭───────────────────────────────────────────────────────╮
	// │              Establish Midjourney Client              │
	// ╰───────────────────────────────────────────────────────╯
	const client = new Midjourney({
		ServerId: <string>process.env.SERVER_ID,
		ChannelId: <string>process.env.CHANNEL_ID,
		SalaiToken: <string>process.env.SALAI_TOKEN,
		Debug: false,
		Ws: true, 
	});
	await client.Connect(); // required


    // ╭───────────────────────────────────────────────────────╮
    // │                  Run Imagine Command                  │
    // ╰───────────────────────────────────────────────────────╯
    const imagine = await client.Imagine(prompt);
    if (!imagine) {
        console.log("no message");
        return;
    }

    // Write to file - The quad of images URI
    const filePathQuad = path.join(__dirname, 'midjourney_images_quad_urls.txt');
    await fs.promises.appendFile(filePathQuad, imagine.uri + '\n');



    // ╭───────────────────────────────────────────────────────╮
    // │                    Skip Upscaling                     │
    // ╰───────────────────────────────────────────────────────╯
    if (upscale) {

        // Check if the conversion resulted in NaN (Not a Number)
        if (isNaN(upscale)) {
            upscale = 1;  // Default to 1 if the argument is not a valid number or not supplied
        }
        console.log(`Upscaling Image: ${upscale}`);
        
        
        // ╭───────────────────────────────────────────────────────╮
        // │               Select Image to upscale                 │
        // ╰───────────────────────────────────────────────────────╯
        const selectedOne = await client.Upscale({
            index: upscale,
            msgId: <string>imagine.id,
            hash: <string>imagine.hash,
            flags: imagine.flags,
            content: imagine.content,
        });
        console.log("Selected Upscale image");
        // console.log( JSON.stringify(selectedOne, null, 2) );

        // ╭───────────────────────────────────────────────────────╮
        // │             Upsample on SelectedOne Image             │
        // ╰───────────────────────────────────────────────────────╯
        const upsample = selectedOne?.options?.find((o) => o.label === "Upscale (Subtle)");
        if (!upsample) {
            console.log("no upsample");
            return;
        }

        // ╭───────────────────────────────────────────────────────╮
        // │                    Custom UpSample                    │
        // ╰───────────────────────────────────────────────────────╯
        const CustomUpsampleSubtle = await client.Custom({
            msgId: <string>selectedOne.id,
            flags: selectedOne.flags,
            customId: upsample.custom,
        });
        // console.log("Custom Upsample", JSON.stringify(CustomUpsampleSubtle, null, 2) );
        console.log("Upsample Complete");

        // Write to file - Upscaled Image URI
        const filePathUpscaled = path.join(__dirname, 'midjourney_images_upscaled_urls.txt');
        await fs.promises.appendFile(filePathUpscaled, CustomUpsampleSubtle.uri + '\n');
        console.log(`Written to file: ${filePathUpscaled}`);
    }

    // ╭───────────────────────────────────────────────────────╮
    // │                Finish and close client                │
    // ╰───────────────────────────────────────────────────────╯
	client.Close();

}

// ╭───────────────────────────────────────────────────────╮
// │         Mechanism to try running Main 5 times         │
// ╰───────────────────────────────────────────────────────╯
let retryCount = 0;
const maxRetries = 5;
const retryDelay = 5000; // 5 seconds in milliseconds

function runMainWithRetry() {
    return new Promise((resolve, reject) => {
        function attempt() {
            main()
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.log(`Attempt ${retryCount + 1} failed with error:`, err);
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
                        setTimeout(attempt, retryDelay);
                    } else {
                        reject(new Error(`Exceeded maximum retry attempts (${maxRetries})`));
                    }
                });
        }
        
        attempt();
    });
}



// ╭───────────────────────────────────────────────────────╮
// │                     Start Running                     │
// ╰───────────────────────────────────────────────────────╯
runMainWithRetry()
    .then(() => {
        console.log("Finished successfully after retries.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Finished with error:", err);
        process.exit(1);
    });