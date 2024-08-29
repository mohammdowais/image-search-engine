import { client } from "../utils/db.js";
await client.batch
  .objectsBatchDeleter()
  .withClassName('ImageSearch')
  .withWhere({
    path: ['text'],
    operator: 'Like',
    valueText: '*-*',
  })
  .do();
const res = await client.graphql.get()
  .withClassName('ImageSearch')
  .withFields(['text']) 
  .do();

console.log(res.data.Get.ImageSearch);


const deleteClass = async (className) => {
  try {
      await client.schema
          .classDeleter()
          .withClassName(className)
          .do();

      console.log(`Class "${className}" deleted successfully.`);
  } catch (err) {
      console.error(`Error deleting class "${className}":`, err);
  }
};

deleteClass('ImageSearch')