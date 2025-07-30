const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');
const app = express();
const db = new sqlite3.Database('absensi.db');

app.use(express.json());
app.use(express.static('public')); 

app.use(session({
  secret: 'rahasia-super',
  resave: false,
  saveUninitialized: true
}));

// Buat table jika belum ada
db.run("CREATE TABLE IF NOT EXISTS absen (id INTEGER PRIMARY KEY, nama TEXT UNIQUE, waktu TEXT)");

// Login admin
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if(username === 'admin' && password === 'password123'){
    req.session.loggedIn = true;
    res.send('Login berhasil!');
  } else {
    res.status(401).send('Username atau password salah');
  }
});

// Logout admin
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout berhasil');
});

// Cek login status
app.get('/api/check', (req, res) => {
  res.json({ loggedIn: req.session.loggedIn || false });
});

// API untuk ambil semua data absen (admin only)
app.get('/api/absen', (req, res) => {
  if(!req.session.loggedIn) return res.status(401).send('Unauthorized');
  db.all("SELECT nama, waktu FROM absen", [], (err, rows) => {
    if(err) return res.status(500).send("Error");
    res.json(rows);
  });
});

// API tambah absen (tidak butuh login)
app.post('/api/absen', (req, res) => {
  const nama = req.body.nama;
  const waktu = new Date().toLocaleTimeString();
  db.run("INSERT INTO absen (nama, waktu) VALUES (?, ?)", [nama, waktu], function(err){
    if(err){
      if(err.message.includes('UNIQUE')) res.send('Nama sudah absen!');
      else res.status(500).send('Gagal absen');
    } else {
      res.send('Absen berhasil!');
    }
  });
});

app.listen(3000, () => console.log('Server running di http://localhost:3000'));
