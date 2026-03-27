import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🇿🇦 UbuntuPay MongoDB Connected'))
  .catch(err => console.error('Database Error:', err));

// --- API ROUTES ---

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      balance: 1500.00 // SA Signup Bonus
    });
    await newUser.save();
    res.status(201).json({ message: "Account Created" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user });
});

// 3. P2P SEND & SCAN PAY
app.post('/api/send', async (req, res) => {
  const { senderEmail, recipientEmail, amount } = req.body;
  const val = parseFloat(amount);
  try {
    const sender = await User.findOne({ email: senderEmail.toLowerCase() });
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    
    if (!recipient) return res.status(404).json({ message: "User not found" });
    if (sender.balance < val) return res.status(400).json({ message: "Insufficient funds" });

    sender.balance -= val;
    recipient.balance += val;
    
    sender.transactions.unshift({ type: 'Payment Sent', amount: val, recipient: recipientEmail, date: new Date() });
    recipient.transactions.unshift({ type: 'Payment Received', amount: val, recipient: senderEmail, date: new Date() });

    await sender.save();
    await recipient.save();
    res.json({ user: sender });
  } catch (err) {
    res.status(500).json({ message: "Transaction failed" });
  }
});

// 4. UTILITY (POWER/AIRTIME)
app.post('/api/utility', async (req, res) => {
  const { email, type, amount, provider } = req.body;
  const val = parseFloat(amount);
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user.balance < val) return res.status(400).json({ message: "Insufficient funds" });

    user.balance -= val;
    const token = type === 'Electricity' ? 
      Array.from({length: 5}, () => Math.floor(1000 + Math.random() * 9000)).join(' ') : 
      `Voucher sent to ${user.phone}`;

    user.transactions.unshift({ type: `Buy ${type}`, amount: val, recipient: provider, date: new Date() });
    await user.save();
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Purchase failed" });
  }
});

app.listen(5000, () => console.log("Backend running on Port 5000"));