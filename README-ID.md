# Dapur Satu Kosong Dua — proyek APK Android

Proyek ini membungkus aplikasi kasir React menjadi aplikasi Android menggunakan Capacitor. APK dibangun melalui GitHub Actions sehingga proses build tidak perlu dilakukan di HP.

## Cara mendapatkan APK hanya dengan HP Android

1. Ekstrak ZIP proyek ini menggunakan aplikasi pengelola file di HP.
2. Buat akun / masuk ke GitHub melalui browser, lalu buat repository baru bernama `dapur-satu-kosong-dua`.
3. Unggah seluruh ISI folder proyek ini ke repository (bukan file ZIP-nya). Pastikan folder `.github/workflows` ikut terunggah.
4. Buka tab **Actions** pada repository. Jika diminta, aktifkan GitHub Actions.
5. Pilih workflow **Build APK Android**, tekan **Run workflow**. Jika workflow belum muncul, pastikan file `.github/workflows/build-apk.yml` sudah ada di branch `main`.
6. Tunggu sampai proses selesai dengan tanda centang hijau.
7. Buka hasil run workflow, cari bagian **Artifacts**, lalu unduh `Dapur-Satu-Kosong-Dua-APK`.
8. Ekstrak ZIP artifact yang diunduh. Di dalamnya ada `app-debug.apk`. Ketuk file itu untuk memasang aplikasi. Android mungkin meminta izin memasang aplikasi dari sumber tersebut.

## Catatan penting

- APK ini adalah versi debug untuk instalasi pribadi dan uji coba, bukan rilis Play Store.
- Data kasir disimpan di penyimpanan lokal aplikasi/browser. Jangan hapus data aplikasi atau uninstall jika ingin mempertahankan data.
- HPP/modal awal menu masih Rp0. Isi HPP melalui **Kelola Menu** agar estimasi laba lebih bermakna.
- Sebelum dipakai untuk pencatatan usaha penting, lakukan beberapa transaksi percobaan dan pastikan hasilnya benar.
- Untuk rilis publik/Play Store diperlukan penandatanganan (keystore) dan proses rilis terpisah.
