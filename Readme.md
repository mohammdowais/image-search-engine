# Image to Image search
A simple tool to search similar images using vector databases.
## Tech Stack
- [ReactJs](https://react.dev/) - React is a free and open-source front-end JavaScript library for building user interfaces based on components by Facebook Inc.
- [NodeJs](https://nodejs.org/docs/latest/api/) - Node.js is a cross-platform, open-source JavaScript runtime environment that can run on Windows, Linux, Unix, macOS, and more. Node.js runs on the V8 JavaScript engine, and executes JavaScript code outside a web browser.
- [Weaviate](https://weaviate.io/) - Weaviate is an open-source vector database.
It allows you to store data objects and vector embeddings from your favorite ML-models,
and scale seamlessly into billions of data objects.
- [Docker](https://www.docker.com/) - Docker is a software platform that allows you to build, test, and deploy applications quickly. Docker packages software into standardized units called containers that have everything the software needs to run including libraries, system tools, code, and runtime.

## Commands for Backend

All commands are run from the `/backend` folder of the project, from a terminal.

Note: Make sure you have some images in `/images` folder before you run `node index.js`.

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `docker-compose up -d` | Launch docker                                    |
| `npm install`          | Installs dependencies                            | 
| `node index.js`          | Starts local dev server at `localhost:3000`    |
| `docker-compose down`          | shut down database & also empties it     |

## Commands for Frontend
All commands are run from the `/frontend` folder of the project, from a terminal.


| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts the react app      |
