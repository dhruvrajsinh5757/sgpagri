import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://jadeja:meet6782@sgp.hr5tk.mongodb.net/agri-sathi?retryWrites=true&w=majority&appName=SGP");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;