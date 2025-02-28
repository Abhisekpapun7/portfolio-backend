const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// ✅ Fix: Proper CORS handling
app.use(cors({
    origin: "https://portfolio-website-abhisek-master.vercel.app", // Your frontend domain
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

// ✅ Handle CORS preflight requests properly
app.options('/api/contact', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://portfolio-website-abhisek-master.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).send();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/contact', (req, res) => {
    console.log('Received request:', req.body);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        console.error('All fields are required');
        return res.status(400).json({ error: 'All fields are required' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `New message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
        }
        console.log('Email sent:', info.response);
        return res.json({ message: 'Email sent successfully' });
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// ✅ Important: Export the app for Vercel
module.exports = app;
