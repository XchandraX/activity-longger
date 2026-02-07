# 📒 Activity Logger Pro


**Activity Logger Pro** adalah aplikasi web berbasis **Progressive Web App (PWA)** untuk mencatat dan memantau aktivitas harian secara produktif. Aplikasi ini mendukung **offline mode**, **background sync**, dan **push notification**, serta terintegrasi dengan **Firebase**.


---


## 🚀 Fitur Utama


- ✅ Pencatatan aktivitas harian
- 📊 Statistik & visualisasi data (Chart.js)
- 🔄 Sinkronisasi otomatis saat online kembali
- 📶 Offline mode dengan cache & offline page
- 🔔 Push Notification
- 🧠 Background Sync & Periodic Sync
- 📱 Installable sebagai PWA (Android / Desktop)
- 🔐 Autentikasi Firebase
- 🔁 Update Firebase calls secara aman (safe wrapper)


---


## 🧱 Teknologi yang Digunakan


- **HTML5**
- **Tailwind CSS (CDN)**
- **JavaScript (Vanilla)**
- **Firebase**
  - Authentication
  - Firestore
- **Service Worker**
- **PWA (Manifest + Offline Support)**
- **Chart.js**
- **SortableJS**
- **Node.js (utility script)**


---


## 📁 Struktur File


```txt
/
├── index.html
├── script.js
├── sw.js
├── manifest.json
├── offline.html
├── update-firebase-calls.js
├── images/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── screenshot1.png
└── README.md
```

* * * * *

📶 Offline Page (`offline.html`)
--------------------------------

Saat pengguna offline:

-   Menampilkan status offline

-   Memberi informasi fitur yang masih bisa digunakan

-   Tombol reload untuk cek koneksi kembali

* * * * *


🔔 Push Notification
--------------------

Mendukung:

-   Custom title & body

-   Icon & badge

-   Action button

-   Klik notifikasi membuka aplikasi

* * * * *

📌 Lisensi
----------

Proyek ini bebas digunakan untuk pembelajaran dan pengembangan pribadi.

* * * * *

✨ Author
--------

Dikembangkan oleh **Chandra**\
Project: **Activity Logger Pro**
