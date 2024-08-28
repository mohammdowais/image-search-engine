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

    const promises = files.map(file => {
        const img = readFileSync(join(imageDir, file));
        const b64 = encodeImage(img);

        return client.data.creator()
            .withClassName('ImageSearch')
            .withProperties({
                image: b64,
                text: file.replace(/\.[^/.]+$/, "") // Use the file name as the text
            })
            .do()
            .then(() => console.log(`Stored ${file} in Weaviate`))
            .catch(err => console.error(`Error storing ${file}:`, err));
    });

    // Execute all promises in parallel
    await Promise.all(promises);

    console.log(`Populated database with ${files.length} images`);
};
// populateDatabase().catch(err => console.error(err));