const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// ✅ Universal CORS handling
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://portfolio-website-abhisek-master.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Handle CORS preflight requests globally
app.options('*', (req, res) => {
    res.sendStatus(204);
});

app.post('/api/contact', async (req, res) => {
    console.log('Received request:', req.body);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        console.error('All fields are required');
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
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

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return res.json({ message: 'Email sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// ✅ Important: Export app for Vercel
module.exports = app;
