# 🏢 Virtual Office 2D - Kantor Virtual Interaktif Multiplayer

Aplikasi kantor virtual real-time 2D berbasis web layaknya game (seperti Gather.town) yang memungkinkan tim/teman Anda bergabung cukup dengan memasukkan nama/username, mengkustomisasi avatar, dan berjalan bersama di kantor virtual secara real-time.

---

## 🌟 Fitur Utama

1. **Multiplayer Real-time**:
   - Bergabung instan hanya dengan memasukkan nama/username.
   - Kustomisasi avatar (warna baju, warna kulit, warna rambut).
   - Sinkronisasi pergerakan karakter 60 FPS yang mulus.
   - Papan nama & status kustom di atas kepala setiap karakter.

2. **Kontrol Karakter**:
   - **Keyboard**: Gunakan tombol `W`, `A`, `S`, `D` atau tombol **Panah (Arrow keys)** untuk berjalan.
   - **Mouse / Layar Sentuh**: Klik atau sentuh area peta untuk berjalan otomatis ke lokasi tujuan.
   - **Duduk di Kursi**: Dekati kursi kerja atau meja rapat, tekan `E` untuk duduk santai.

3. **Zona & Ruangan Kantor yang Sangat Luas (3400 x 2200)**:
   - 🏢 **Lobby & Reception**: Area spawn kedatangan, meja resepsionis & sofa tunggu.
   - 💻 **Open Workspace (Tech Hub)**: 8 cluster meja kerja lengkap dengan monitor & kursi.
   - 📝 **Meeting Room Alpha (Conference)**: Meja konferensi besar & **Papan Tulis Interaktif (Whiteboard)** kolaboratif.
   - 💡 **Meeting Room Beta (Brainstorm)**: Meja bundar santai & papan ide.
   - ☕ **Pantry & Café Lounge**: Mesin kopi espresso (☕), water dispenser (💧), dan dining island.
   - 🎱 **Ruang Billiard & Lounge Bar (NEW!)**: 2 Meja billiard (hijau & biru) yang bisa dimainkan (tekan `E` untuk menembak bola 🎱), papan dart (🎯), dan bar lounge.
   - 🛏️ **Ruang Tidur / Nap & Wellness Room (NEW!)**: 6 Ranjang kasur empuk dengan selimut dan bantal. Tekan `E` di kasur untuk tidur/rebahan dengan mata terpejam dan animasi `💤 Zzz...` diiringi alunan nada santai.
   - 🎮 **Ruang Game & Esports Arena (NEW!)**: Teater TV OLED 85" dengan sofa empuk untuk main PS5/Xbox (🎮), deretan 4 PC gaming RGB Esports (👾), meja ping pong (🏓), dan mesin retro arcade (🕹️).
   - 🥊 **Gym & Fitness Center (NEW!)**: Deretan treadmill (🏃), matras angkat beban (💪), dan sansak tinju (🥊).
   - ⛲ **Zen Balcony & Taman**: Teras outdoor dengan air mancur tengah yang megah dan tanaman asri.

4. **Komunikasi & Interaksi**:
   - 💬 **Live Chat & Balon Teks**: Chatbox global dan balon teks yang muncul di atas kepala karakter.
   - ✨ **Emote Cepat**: Animasi mengapung untuk ekspresi (👋, ☕, 👍, ❤️, 🎉, 💡, 🔥, ❓).
   - 🔊 **Efek Suara Sintetis (Web Audio API)**: Suara langkah kaki, notifikasi chat, tuang kopi, dan bel tanpa perlu download file audio eksternal.
   - 👥 **Daftar Teman & Jump To**: Lihat siapa saja yang sedang online, status mereka, dan tombol teleport langsung ke lokasi teman.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Server Lokal
Pastikan Node.js sudah terpasang, lalu di terminal jalankan:
```bash
cd /Applications/MAMP/htdocs/rnd/office
npm start
```
Buka browser dan akses: **`http://localhost:3000`**

### 2. Mengajak Teman dalam 1 Jaringan WiFi / LAN
Teman-teman Anda dapat langsung bergabung dengan membuka alamat IP lokal komputer Anda:
```text
http://[IP-KOMPUTER-ANDA]:3000
```
*(Contoh: `http://192.168.1.15:3000`)*

### 3. Mengajak Teman via Internet (Ngrok / Cloudflare Tunnel)
Jika ingin teman di luar jaringan WiFi bisa bergabung, Anda bisa menggunakan `ngrok`:
```bash
npx ngrok http 3000
```
Lalu bagikan link publik HTTPS yang dihasilkan ngrok ke teman-teman Anda.
