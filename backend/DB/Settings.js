import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Profile Settings
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, default: '' },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pictureUrl: { type: String, default: '' },
  },
  
  // Theme & Display Settings
  theme: {
    mode: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    language: { type: String, enum: ['en', 'hi', 'gu'], default: 'en' },
    layout: { type: String, enum: ['compact', 'detailed'], default: 'detailed' },
  },
  
  // Notification Settings
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    whatsappAlerts: { type: Boolean, default: false },
    budgetWarnings: { type: Boolean, default: true },
    weatherUpdates: { type: Boolean, default: true },
    priceUpdates: { type: Boolean, default: true },
  },
  
  // Security Settings
  security: {
    twoFactor: { type: String, enum: ['off', 'sms', 'email', 'app'], default: 'off' },
  },
  
  // Preferences
  preferences: {
    language: { type: String, enum: ['en', 'hi', 'gu'], default: 'en' },
    currency: { type: String, enum: ['INR', 'USD', 'EUR'], default: 'INR' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  
  // Account Settings
  account: {
    linkedGoogle: { type: Boolean, default: false },
    linkedFacebook: { type: Boolean, default: false },
  },
  
  // Agricultural Profile
  agricultural: {
    farmerType: { type: String, enum: ['small', 'large', 'cooperative'], default: 'small' },
    crops: { type: String, default: '' },
    location: { type: String, default: '' },
    farmSize: { type: String, default: '' },
    alertPrefs: {
      weather: { type: Boolean, default: true },
      cropPrice: { type: Boolean, default: true },
      emi: { type: Boolean, default: false },
    }
  }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
