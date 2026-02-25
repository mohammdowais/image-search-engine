// import { readFileSync, readdirSync } from 'fs';
// import { join } from 'path';
// import { client } from '../utils/db.js';
// import {encodeImage} from './encodeImage.js'

// // Function to populate the database with x amount of images using Promise.all
// export const populateDatabase = async () => {
//     const imageDir = './images/';
//     const files = readdirSync(imageDir)

//     if(files.length == 0) {
//         throw new Error("/images direcotry is empty, add images to save in database")
//     }
//     const globalStart = Date.now();
//     console.log(`\n🚀 Starting embedding at: ${new Date(globalStart).toISOString()}\n`);
//     // const promises = files.map(file => {
//     //     const img = readFileSync(join(imageDir, file));
//     //     const b64 = encodeImage(img);

//     //     return client.data.creator()
//     //         .withClassName('ImageSearch')
//     //         .withProperties({
//     //             image: b64,
//     //             text: file.replace(/\.[^/.]+$/, "") // Use the file name as the text
//     //         })
//     //         .do()
//     //         .then(() => console.log(`Stored ${file} in Weaviate`))
//     //         .catch(err => console.error(`Error storing ${file}:`, err));
//     // });
//     const promises = files.map(async (file) => {
//         const start = Date.now();

//         try {
//             console.log(`⏳ [${new Date().toISOString()}] Processing: ${file}`);

//             const img = readFileSync(join(imageDir, file));
//             const b64 = encodeImage(img);

//             await client.data.creator()
//                 .withClassName('ImageSearch')
//                 .withProperties({
//                     image: b64,
//                     text: file.replace(/\.[^/.]+$/, "")
//                 })
//                 .do();

//             const end = Date.now();
//             console.log(
//                 `✅ [${new Date().toISOString()}] Stored ${file} | Time: ${end - start} ms`
//             );
//         } catch (err) {
//             const end = Date.now();
//             console.error(
//                 `❌ [${new Date().toISOString()}] Error storing ${file} | Time: ${end - start} ms`,
//                 err
//             );
//         }
//     });


//     // Execute all promises in parallel
//     await Promise.all(promises);

//     const globalEnd = Date.now();
//     const totalTime = globalEnd - globalStart;

//     console.log(`\n📦 Finished at: ${new Date(globalEnd).toISOString()}`);
//     console.log(`⏱️ Total time for ${files.length} images: ${totalTime} ms (${(totalTime / 1000).toFixed(2)} sec)\n`);
    
//     console.log(`Populated database with ${files.length} images`);
// };
// // populateDatabase().catch(err => console.error(err));

// Populate version 2.0
// import { readFileSync, readdirSync, statSync } from 'fs';
// import { join, basename } from 'path';
// import { client } from '../utils/db.js';
// import { encodeImage } from './encodeImage.js';

// // ✅ Recursively get all image files only
// const getAllFiles = (dir) => {
//     let results = [];

//     const list = readdirSync(dir);

//     list.forEach((file) => {
//         const filePath = join(dir, file);
//         const stat = statSync(filePath);

//         if (stat.isDirectory()) {
//             results = results.concat(getAllFiles(filePath));
//         } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
//             results.push(filePath);
//         }
//     });

//     return results;
// };

// export const populateDatabase = async () => {
//     const imageDir = 'D:\\owais\\freelance\\ipics-image-search\\images\\Training_photos';

//     const files = getAllFiles(imageDir);

//     if (files.length === 0) {
//         throw new Error("No images found in directory");
//     }

//     const globalStart = Date.now();
//     console.log(`\n🚀 Starting embedding at: ${new Date(globalStart).toISOString()}`);
//     console.log(`📁 Total images found: ${files.length}\n`);

//     const BATCH_SIZE = 5; // 🔥 Adjust (5–10 safe)

//     for (let i = 0; i < files.length; i += BATCH_SIZE) {
//         const batch = files.slice(i, i + BATCH_SIZE);

//         console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`);

//         await Promise.all(
//             batch.map(async (filePath, index) => {
//                 const start = Date.now();

//                 try {
//                     console.log(
//                         `⏳ [${new Date().toISOString()}] Processing ${i + index + 1}: ${filePath}`
//                     );

//                     let img = readFileSync(filePath);
//                     let b64 = encodeImage(img);

//                     await client.data.creator()
//                         .withClassName('ImageSearch')
//                         .withProperties({
//                             image: b64,
//                             text: basename(filePath).replace(/\.[^/.]+$/, "")
//                         })
//                         .do();

//                     // ✅ Free memory early
//                     img = null;
//                     b64 = null;

//                     const end = Date.now();

//                     console.log(
//                         `✅ Stored ${filePath} | Time: ${end - start} ms`
//                     );
//                 } catch (err) {
//                     const end = Date.now();

//                     console.error(
//                         `❌ Error storing ${filePath} | Time: ${end - start} ms`,
//                         err
//                     );
//                 }
//             })
//         );
//     }

//     const globalEnd = Date.now();
//     const totalTime = globalEnd - globalStart;

//     console.log(`\n📦 Finished at: ${new Date(globalEnd).toISOString()}`);
//     console.log(
//         `⏱️ Total time for ${files.length} images: ${totalTime} ms (${(totalTime / 1000).toFixed(2)} sec)`
//     );

//     console.log(`✅ Populated database with ${files.length} images`);
// };

// Populate version 2.1
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { client } from '../utils/db.js';
import { encodeImage } from './encodeImage.js';

const getAllFiles = (dir) => {
    let results = [];

    for (const file of readdirSync(dir)) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath));
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            results.push(filePath);
        }
    }

    return results;
};

export const populateDatabase = async () => {
    const imageDir = 'D:\\owais\\freelance\\ipics-image-search\\images\\Training_photos';
    const files = getAllFiles(imageDir);

    const CONCURRENCY = 5;
    const LOG_INTERVAL = 20;

    const TOTAL_IMAGES = files.length;
    const TOTAL_BATCHES = Math.ceil(TOTAL_IMAGES / CONCURRENCY);

    let index = 0;
    let active = 0;
    let completed = 0;

    const globalStart = Date.now();

    console.log(`🚀 Starting ingestion`);
    console.log(`📁 Total images: ${TOTAL_IMAGES}`);
    console.log(`⚙️ Concurrency: ${CONCURRENCY}`);
    console.log(`📦 Estimated batches: ${TOTAL_BATCHES}\n`);

    return new Promise((resolve) => {
        const next = async () => {
            if (index >= files.length && active === 0) {
                const totalTime = Date.now() - globalStart;

                console.log(`\n✅ ALL DONE`);
                console.log(`📊 Total processed: ${completed}`);
                console.log(`⏱️ Total time: ${totalTime} ms (${(totalTime / 1000).toFixed(2)} sec)`);

                return resolve();
            }

            while (active < CONCURRENCY && index < files.length) {
                const filePath = files[index++];
                active++;

                processFile(filePath, index)
                    .catch(() => {})
                    .finally(() => {
                        active--;
                        completed++;

                        if (completed % LOG_INTERVAL === 0 || completed === TOTAL_IMAGES) {
                            const elapsed = Date.now() - globalStart;

                            const avgTimePerImage = elapsed / completed;
                            const remainingImages = TOTAL_IMAGES - completed;
                            const etaMs = avgTimePerImage * remainingImages;

                            const rate = (completed / (elapsed / 1000)).toFixed(2);

                            const completedBatches = Math.ceil(completed / CONCURRENCY);

                            console.log(`\n📦 Progress Update`);
                            console.log(`✅ Processed: ${completed}/${TOTAL_IMAGES}`);
                            console.log(`📦 Batches: ${completedBatches}/${TOTAL_BATCHES}`);
                            console.log(`⏱️ Elapsed: ${(elapsed / 1000).toFixed(2)} sec`);
                            console.log(`⚡ Speed: ${rate} images/sec`);
                            console.log(`🧠 Avg/Image: ${avgTimePerImage.toFixed(2)} ms`);
                            console.log(`⏳ ETA Remaining: ${(etaMs / 1000).toFixed(2)} sec\n`);
                        }

                        next();
                    });
            }
        };

        const processFile = async (filePath, currentIndex) => {
            const start = Date.now();

            try {
                console.log(`⏳ [${currentIndex}/${TOTAL_IMAGES}] ${filePath}`);

                let img = readFileSync(filePath);
                let b64 = encodeImage(img);

                await client.data.creator()
                    .withClassName('ImageSearch')
                    .withProperties({
                        image: b64,
                        text: basename(filePath).replace(/\.[^/.]+$/, "")
                    })
                    .do();

                img = null;
                b64 = null;

                console.log(`✅ Done ${currentIndex} (${Date.now() - start} ms)`);
            } catch (err) {
                console.error(`❌ Failed: ${filePath}`, err);
            }
        };

        next();
    });
};