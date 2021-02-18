const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const circulationRepo = require('./repos/circulationRepo')
const data = require('./circulation.json')


const url = 'mongodb://localhost:27017';
const dbName =  'circulation';

async function main () {
  const client = new MongoClient(url);

  await client.connect();

  try {

  const results = await circulationRepo.loadData(data)
  assert.strictEqual(data.length, results.insertedCount)
  
  const getData = await circulationRepo.get()
  assert.strictEqual(data.length, getData.length)

  const filterData = await circulationRepo.get({Newspaper: getData[4].Newspaper})
  assert.deepStrictEqual(filterData[0], getData[4]);

  const limitData = await circulationRepo.get({}, 3);
  assert.strictEqual(limitData.length, 3)
  
  const id = getData[4]._id.toString()
  const byId = await circulationRepo.getById(getData[4]._id)
  assert.deepStrictEqual(byId, getData[4])

  const newItem = { 
      "Newspaper": "Boston Herald",
      "Daily Circulation, 2004": 1,
      "Daily Circulation, 2013": 2,
      "Change in Daily Circulation, 2004-2013": 100,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0
  }

  const addedItem = await circulationRepo.add(newItem)
  assert(addedItem._id)
  const addedItemQuery = await circulationRepo.getById(addedItem._id)
  assert.deepStrictEqual(addedItemQuery, newItem)

  const updatedItem = await circulationRepo.update(addedItem._id, { 
      "Newspaper": "My new paper",
      "Daily Circulation, 2004": 1,
      "Daily Circulation, 2013": 2,
      "Change in Daily Circulation, 2004-2013": 100,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0
  })
  assert.strictEqual(updatedItem.Newspaper, "My new paper")

  const newAddedItemQuery = await circulationRepo.getById(addedItem._id)
  assert.strictEqual(newAddedItemQuery.Newspaper, 'My new paper')

  const removed = await circulationRepo.remove(addedItem._id);
  assert(removed)
  const deletedItem = await circulationRepo.getById(addedItem._id);
  assert.strictEqual(deletedItem, null)
    
  } catch (error) {
    console.log(error)
  } finally {

  const admin = client.db(dbName).admin();

  await client.db(dbName).dropDatabase();
  console.log(await admin.listDatabases());

  client.close();
  }
  
}


main()