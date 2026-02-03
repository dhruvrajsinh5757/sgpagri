import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  person: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  crop: { type: String },
  date: { type: Date, default: Date.now },
  note: { type: String },
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema); 