# SubBalanced

**SubBalanced** adalah alat berbasis web sederhana namun cerdas untuk memproses file subtitle (SRT dan WebVTT). Script ini dirancang khusus untuk membantu para penggemar anime atau pembuat konten dalam merapikan subtitle agar lebih nyaman dibaca di berbagai perangkat.

## Fitur Utama

1.  **Pembersihan Tag Otomatis**: Secara otomatis menghapus tag ukuran font seperti `{\fs15}` atau `{\fs12\an8}`, namun tetap mempertahankan tag format lainnya (seperti posisi `\an8` atau format HTML `<i>`).
2.  **Pemecah Baris Cerdas (Smart Line Breaking)**:
    * Membatasi teks maksimal **42 karakter** per baris.
    * **Logika Keseimbangan (Balanced Logic)**: Jika teks panjang, script akan membaginya menjadi dua baris yang seimbang panjangnya agar proporsional di layar.
    * **Ambang Batas 1/3**: Jika sisa teks di baris kedua kurang dari 1/3 panjang maksimal (14 karakter), script akan mempertahankannya dalam satu baris untuk estetika yang lebih baik.
3.  **Anti Potong Kata**: Pemotongan baris dilakukan berdasarkan spasi, menjamin tidak ada kata yang terputus di tengah kalimat.
4.  **Dukungan Multi-Format**: Mendukung pemrosesan file `.srt` dan `.vtt`.
5.  **Privasi Penuh**: Semua pemrosesan dilakukan di browser Anda tanpa mengunggah file ke server mana pun.

## Cara Penggunaan

1.  Buka halaman **SubBalanced** di browser Anda.
2.  Pilih dan unggah file subtitle Anda.
3.  Teks yang sudah diformat akan muncul secara otomatis di area editor.
4.  Klik tombol **Download** untuk menyimpan file subtitle yang sudah rapi.
