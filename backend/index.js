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

        const page       = Math.max(1, parseInt(req.body.page)  || 1);
        const limit      = Math.max(1, parseInt(req.body.limit) || 6);
        const distance   = parseFloat(req.body.distance)        || 0.75;
        const offset     = (page - 1) * limit;

        // ── 1. Get total count at this threshold (no offset, high limit) ──
        const countResult = await client.graphql.get()
            .withClassName('ImageSearch')
            .withFields(['_additional { distance }'])
            .withNearImage({ image: b64Image, distance })
            .withLimit(1000)  // ceiling — raise if your DB is larger
            .do();

        const allMatches = countResult.data.Get.ImageSearch ?? [];
        const total      = allMatches.length;

        if (total === 0) {
            return res.status(404).json({ message: 'No similar images found.' });
        }

        // ── 2. Fetch the actual page of results ──
        const pageResult = await client.graphql.get()
            .withClassName('ImageSearch')
            .withFields(['image', 'text', '_additional { distance }'])
            .withNearImage({ image: b64Image, distance })
            .withLimit(limit)
            .withOffset(offset)
            .do();

        const items = (pageResult.data.Get.ImageSearch ?? []).map(img => ({
            image:    img.image,
            text:     img.text,
            distance: img._additional.distance,
        }));

        // ── 3. Return results + pagination metadata ──
        res.json({
            results:     items,
            total,
            page,
            limit,
            totalPages:  Math.ceil(total / limit),
            distance,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
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