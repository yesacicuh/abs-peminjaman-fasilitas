require('dotenv').config();
const express = require('express');
const app = express();
const loansRouter = require('./routes/loans');

app.use(express.json());

// Daftarkan rute loans yang sudah kamu buat
app.use('/api/v1/loans', loansRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.lang(`Layanan Peminjaman berjalan di http://localhost:${PORT}`);
});