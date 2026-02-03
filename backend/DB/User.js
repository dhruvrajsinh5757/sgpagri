import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['farmer', 'agro'],
    default: 'farmer' 
  },
  location: { type: String },
  address: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema); 