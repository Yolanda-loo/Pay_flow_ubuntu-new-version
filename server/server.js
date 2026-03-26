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
  .then(() => console.log('🇿🇦 UbuntuPay Database Connected'))
  .catch(err => console.error('Mongo Error:', err));

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      balance: 1500.00 // SA Welcome Bonus
    });
    await newUser.save();
    res.status(201).json({ message: "Account Created" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user });
});

// P2P SEND & SCAN PAY
app.post('/api/send', async (req, res) => {
  const { senderEmail, recipientEmail, amount } = req.body;
  const val = parseFloat(amount);
  try {
    const sender = await User.findOne({ email: senderEmail.toLowerCase() });
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });
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

app.listen(5000, () => console.log("Server running on Port 5000"));