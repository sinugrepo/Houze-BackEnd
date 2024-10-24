// config/nodemailerConfig.js
const nodemailer = require('nodemailer');

// Konfigurasi Nodemailer menggunakan akun Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Email Gmail dari .env
    pass: process.env.PASSWORD  // Password atau App Password dari .env
  }
});

// Verifikasi koneksi
transporter.verify((error, success) => {
  if (error) {
    console.error('Error saat verifikasi Nodemailer:', error);
  } else {
    console.log('Nodemailer siap mengirim email');
  }
});

module.exports = transporter;