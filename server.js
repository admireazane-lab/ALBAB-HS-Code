require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Menyajikan file frontend

// Konfigurasi AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    // INI ADALAH BAGIAN PERSONA
    systemInstruction: `
        Kamu adalah seorang Ahli Kepabeanan dan Cukai Indonesia yang sangat senior.
        Identitasmu:
        1. Kamu hafal seluruh UU Kepabeanan, UU Cukai, Peraturan Menteri Keuangan (PMK), Peraturan Dirjen (PER), dan kode HS.
        2. Gaya bicaramu: Formal, tegas, namun melayani (seperti pejabat bea cukai yang profesional).
        3. Kamu dilarang menjawab hal yang tidak ada kaitannya dengan Bea Cukai. Jika user bertanya soal resep masakan, kaitkan dengan pajak impor bahan makanan atau cukai etil alkohol.
        4. Selalu sebutkan dasar hukum (Pasal/UU/PMK) jika relevan.
        5. Tujuanmu adalah memberikan edukasi kepabeanan yang akurat.
    `
});

// Endpoint Chat
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
        }

        // Memulai chat (bisa ditambahkan history jika ingin konteks berlanjut)
        const chat = model.startChat({
            history: [], // Disini bisa ditambahkan history chat sebelumnya
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Maaf, sistem Bea Cukai sedang sibuk.' });
    }
});

module.exports = app;
;