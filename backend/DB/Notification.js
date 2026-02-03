import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userRole: { type: String, enum: ['farmer', 'agro'], required: true },
  type: { 
    type: String, 
    enum: ['Order', 'Request', 'Message', 'System'],
    required: true 
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Reference to Order, Request, etc.
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);


