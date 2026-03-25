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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🇿🇦 UbuntuPay Database Connected'))
  .catch(err => console.error('Mongo Error:', err));

// --- API ROUTES ---

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
      balance: 1500.00 // Welcome bonus for new South African users
    });
    await newUser.save();
    res.status(201).json({ message: "Account created" });
  } catch (err) {
    res.status(400).json({ error: "Email already in use" });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user });
});

// SEND MONEY (The Core Transaction)
app.post('/api/send', async (req, res) => {
  const { senderEmail, recipientEmail, amount } = req.body;
  const val = parseFloat(amount);

  try {
    const sender = await User.findOne({ email: senderEmail.toLowerCase() });
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });

    if (!recipient) return res.status(404).json({ message: "Recipient not found" });
    if (sender.balance < val) return res.status(400).json({ message: "Insufficient funds" });
    if (senderEmail === recipientEmail) return res.status(400).json({ message: "Cannot send to yourself" });

    // Atomic-style update
    sender.balance -= val;
    recipient.balance += val;

    sender.transactions.unshift({ type: 'Send', amount: val, recipient: recipientEmail });
    recipient.transactions.unshift({ type: 'Receive', amount: val, recipient: senderEmail });

    await sender.save();
    await recipient.save();

    res.json({ message: "Success", newBalance: sender.balance, user: sender });
  } catch (err) {
    res.status(500).json({ message: "Transaction error" });
  }
});

app.listen(process.env.PORT || 5000, () => console.log("Server Active on Port 5000"));