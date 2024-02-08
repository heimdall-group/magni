##### Update path lookup
const pageId = "your_page_id"; // Replace with the actual page ID
const blockId = "your_block_id"; // Replace with the actual block ID

const updatedBlock = db.yourCollection.aggregate([
  {
    $match: {
      id: pageId
    }
  },
  {
    $graphLookup: {
      from: "yourCollection",
      startWith: blockId,
      connectFromField: "id",
      connectToField: "parents",
      as: "path",
      restrictSearchWithMatch: {
        parents: { $exists: true }
      }
    }
  },
  {
    $unwind: "$path"
  },
  {
    $replaceRoot: { newRoot: "$path" }
  },
  {
    $sort: { "parents.length": 1 }
  },
  {
    $group: {
      _id: null,
      path: { $addToSet: "$parents" },
      updatedBlock: { $first: "$$ROOT" },
      pageId: { $first: "$id" }
    }
  },
  {
    $project: {
      _id: 0,
      pageId: 1,
      path: 1,
      updatedBlock: 1
    }
  }
]).toArray();

printjson(updatedBlock[0]);



#### Get Blocks pipeline
const pageId = "root_page_id"; // Replace with the actual page ID db.yourCollection.aggregate([ { $match: { id: pageId } }, { $graphLookup: { from: "yourCollection", startWith: "$id", connectFromField: "id", connectToField: "parents", as: "descendants" } }, { $unwind: "$descendants" }, { $replaceRoot: { newRoot: "$descendants" } } ]);