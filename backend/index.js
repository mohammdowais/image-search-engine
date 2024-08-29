import express from 'express';
import multer, { memoryStorage } from 'multer';
import cors from 'cors';
import { client } from './utils/db.js';
import { populateDatabase } from './helpers/populateDB.js'; 
import {schemaConfig} from './helpers/schema.js'
import { encodeImage } from './helpers/encodeImage.js';

const app = express();
app.use(cors());

const PORT = 3000;

// Multer setup for image upload handling
const upload = multer({ storage: memoryStorage() });


// Function to check if the schema exists and create it if it doesn't
const ensureSchemaExists = async () => {
    const schema = await client.schema.getter().do();
    const classExists = schema.classes.some(cls => cls.class === 'ImageSearch');

    if (!classExists) {
        console.log('Schema does not exist. Creating schema...');
        await client.schema.classCreator().withClass(schemaConfig).do();
        console.log('Schema created successfully.');
    } 
};

// Function to check if the database is populated and populate it if not
const ensureDatabasePopulated = async () => {
    const result = await client.graphql.get()
        .withClassName('ImageSearch')
        .withFields(['_additional { id }'])
        .withLimit(1)
        .do();
    if (result.data.Get.ImageSearch.length === 0) {
        console.log('Database is empty. Populating database...');
        await populateDatabase().catch(err => {throw err});
        console.log('Database populated successfully.');
    } 
};

// /search endpoint to find similar images
app.post('/search', upload.single('image'), async (req, res) => {
    try {
        const b64Image = encodeImage(req.file.buffer);
        const { page = 1 } = req.body; // Get the page number from the request body, default to 1
        const limit = 3; // Number of images to return per page
        const offset = (page - 1) * limit;

        const result = await client.graphql.get()
            .withClassName('ImageSearch')
            .withFields(['image', 'text','_additional { distance }'])
            .withNearImage({ 
                image: b64Image,
                distance:0.25

             })
            .withLimit(limit)
            .withOffset(offset)
            .do();

        if (result.data.Get.ImageSearch.length === 0) {
            return res.status(404).send('No similar images found.');
        }
        console.log(result.data.Get.ImageSearch[0])
        const images = result.data.Get.ImageSearch.map(image => ({
            image: image.image,
            text: image.text,
            distance:image._additional.distance,
        }));

        res.json(images);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

const startServer = async () => {
    try {
        await ensureSchemaExists();
        await ensureDatabasePopulated();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error starting server:', err);
    }
};

startServer();