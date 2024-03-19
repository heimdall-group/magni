import mongoose from "mongoose";

export default mongoose.model("Users", new mongoose.Schema({
  uid: {
    type: String, 
    unique: true,
  },
  organisations: Array,
  nickname: String,
}));
