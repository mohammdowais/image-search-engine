import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { client } from '../utils/db.js';
import {encodeImage} from './encodeImage.js'

// Function to populate the database with x amount of images using Promise.all
export const populateDatabase = async () => {
    const imageDir = './images/';
    const files = readdirSync(imageDir)

    if(files.length == 0) {
        throw new Error("/images direcotry is empty, add images to save in database")
    }
    const globalStart = Date.now();
    console.log(`\n🚀 Starting embedding at: ${new Date(globalStart).toISOString()}\n`);
    // const promises = files.map(file => {
    //     const img = readFileSync(join(imageDir, file));
    //     const b64 = encodeImage(img);

    //     return client.data.creator()
    //         .withClassName('ImageSearch')
    //         .withProperties({
    //             image: b64,
    //             text: file.replace(/\.[^/.]+$/, "") // Use the file name as the text
    //         })
    //         .do()
    //         .then(() => console.log(`Stored ${file} in Weaviate`))
    //         .catch(err => console.error(`Error storing ${file}:`, err));
    // });
    const promises = files.map(async (file) => {
        const start = Date.now();

        try {
            console.log(`⏳ [${new Date().toISOString()}] Processing: ${file}`);

            const img = readFileSync(join(imageDir, file));
            const b64 = encodeImage(img);

            await client.data.creator()
                .withClassName('ImageSearch')
                .withProperties({
                    image: b64,
                    text: file.replace(/\.[^/.]+$/, "")
                })
                .do();

            const end = Date.now();
            console.log(
                `✅ [${new Date().toISOString()}] Stored ${file} | Time: ${end - start} ms`
            );
        } catch (err) {
            const end = Date.now();
            console.error(
                `❌ [${new Date().toISOString()}] Error storing ${file} | Time: ${end - start} ms`,
                err
            );
        }
    });


    // Execute all promises in parallel
    await Promise.all(promises);

    const globalEnd = Date.now();
    const totalTime = globalEnd - globalStart;

    console.log(`\n📦 Finished at: ${new Date(globalEnd).toISOString()}`);
    console.log(`⏱️ Total time for ${files.length} images: ${totalTime} ms (${(totalTime / 1000).toFixed(2)} sec)\n`);
    
    console.log(`Populated database with ${files.length} images`);
};
// populateDatabase().catch(err => console.error(err));