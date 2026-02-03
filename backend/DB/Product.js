import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgroBusiness', required: true, index: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Seed', 'Fertilizer', 'Machinery', 'Other'],
    required: true 
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  description: { type: String },
  imagePath: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);


