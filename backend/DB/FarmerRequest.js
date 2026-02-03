import mongoose from "mongoose";

const farmerRequestSchema = new mongoose.Schema({
  agro: { type: mongoose.Schema.Types.ObjectId, ref: 'AgroBusiness', required: true, index: true },
  farmerName: { type: String, required: true },
  farmerEmail: { type: String },
  location: { type: String },
  requestedService: { type: String, required: true },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  rating: { type: Number, min: 0, max: 5 },
  review: { type: String },
}, { timestamps: true });

export default mongoose.model('FarmerRequest', farmerRequestSchema);


