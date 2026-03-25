import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1250.00 }, // Starting bonus
  onboardingComplete: { type: Boolean, default: false },
  recoveryCode: { type: String },
  transactions: [{
    type: { type: String }, // 'Send', 'Deposit', 'Withdraw'
    amount: Number,
    recipient: String,
    date: { type: Date, default: Date.now }
  }]
});

export default mongoose.model('User', UserSchema);