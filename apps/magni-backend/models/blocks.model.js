import mongoose from "mongoose";

export default mongoose.model("Blocks", new mongoose.Schema({
  id: String,
  type: String,
  properties: {
    content: String,
    columns: [{content: String}],
    table: [[{content: String, width: Number}]],
  },
  content: [String],
  parents: [String]
}));
