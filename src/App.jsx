import React, { useEffect, useMemo, useState } from "react";
import {
  Flame, ShoppingCart, Plus, Minus, X, CheckCircle2,
  PlusCircle, History, ChartNoAxesCombined, Trash2, Pencil,
  Receipt, Search, Settings, Utensils, QrCode, Wallet,
  ImagePlus, Check, AlertCircle, Download, Upload
} from "lucide-react";

const CATEGORIES = ["Semua", "Seblak", "Topping Seblak", "Tempura Lava", "Tahu Kocek"];

const INITIAL_MENU = [
  { id: "s_1", name: "Seblak Paket 1", price: 7000, cost: 0, category: "Seblak" },
  { id: "s_2", name: "Seblak Paket 2", price: 10000, cost: 0, category: "Seblak" },
  { id: "s_3", name: "Seblak Paket 3", price: 15000, cost: 0, category: "Seblak" },
  { id: "ts_1", name: "Tofu", price: 2000, cost: 0, category: "Topping Seblak" },
  { id: "ts_2", name: "Baso Ikan", price: 2000, cost: 0, category: "Topping Seblak" },
  { id: "ts_3", name: "Chikuwa", price: 3000, cost: 0, category: "Topping Seblak" },
  { id: "ts_4", name: "Sosis", price: 1000, cost: 0, category: "Topping Seblak" },
  { id: "ts_5", name: "Stik Udang", price: 3000, cost: 0, category: "Topping Seblak" },
  { id: "ts_6", name: "Sawi", price: 1000, cost: 0, category: "Topping Seblak" },
  { id: "ts_7", name: "Enoki", price: 2000, cost: 0, category: "Topping Seblak" },
  { id: "ts_8", name: "Krupuk", price: 1000, cost: 0, category: "Topping Seblak" },
  { id: "ts_9", name: "Pilus", price: 1000, cost: 0, category: "Topping Seblak" },
  { id: "ts_10", name: "Siomay Mini", price: 1000, cost: 0, category: "Topping Seblak" },
  { id: "ts_11", name: "Krupuk Lidah", price: 1000, cost: 0, category: "Topping Seblak" },
  { id: "ts_12", name: "Telur", price: 3000, cost: 0, category: "Topping Seblak" },
  { id: "ts_13", name: "Tambah Sambel", price: 2000, cost: 0, category: "Topping Seblak" },
  { id: "tl_1", name: "Sosis (Lava)", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_2", name: "Tempura", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_3", name: "Bintang", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_4", name: "Shukoi", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_5", name: "Scallop", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_6", name: "Otak-otak Ikan", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_7", name: "Martabak", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_8", name: "Stik Siomay", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_9", name: "Cireng", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_10", name: "Nugget", price: 1000, cost: 0, category: "Tempura Lava" },
  { id: "tl_11", name: "Bumbu", price: 2000, cost: 0, category: "Tempura Lava" },
  { id: "tk_1", name: "Tahu Kocek Base", price: 5000, cost: 0, category: "Tahu Kocek" },
  { id: "tk_2", name: "Ekstra Cabe > 5", price: 2000, cost: 0, category: "Tahu Kocek" }
];

const money = (n) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(Number(n) || 0);

const digits = (v) => String(v ?? "").replace(/\D/g, "");

const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// QRIS disimpan di IndexedDB, bukan Local Storage, agar tidak terkena batas
// kapasitas Local Storage yang kecil. Gambar juga dikompres sebelum disimpan.
const DB_NAME = "d102_qris_database";
const DB_STORE = "images";
const QRIS_KEY = "main-qris";

const openQrisDB = () => new Promise((resolve, reject) => {
  if (!("indexedDB" in window)) {
    reject(new Error("Penyimpanan gambar tidak didukung browser ini."));
    return;
  }

  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(DB_STORE)) {
      db.createObjectStore(DB_STORE);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const getQrisImage = async () => {
  const db = await openQrisDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const request = tx.objectStore(DB_STORE).get(QRIS_KEY);
    request.onsuccess = () => {
      resolve(request.result || "");
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

const saveQrisImage = async (imageData) => {
  const db = await openQrisDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(imageData, QRIS_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Penyimpanan dibatalkan.")); };
  });
};
const saveMenuImage = async (id, imageData) => {
  const db = await openQrisDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(imageData, `menu-image-${id}`);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Penyimpanan foto menu dibatalkan.")); };
  });
};
const getMenuImages = async () => {
  const db = await openQrisDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const request = store.getAllKeys();
    request.onsuccess = () => {
      const keys = request.result.filter((key) => String(key).startsWith("menu-image-"));
      Promise.all(keys.map((key) => new Promise((res, rej) => {
        const getRequest = store.get(key);
        getRequest.onsuccess = () => res([String(key).slice(11), getRequest.result]);
        getRequest.onerror = () => rej(getRequest.error);
      }))).then((entries) => resolve(Object.fromEntries(entries.filter(([, value]) => value))))
        .catch(reject).finally(() => db.close());
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
};

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Gagal membaca gambar."));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error("File gambar tidak dapat dibuka."));
    image.onload = () => {
      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Tidak dapat memproses gambar."));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      // PNG transparan dikonversi ke JPEG agar ukuran penyimpanan lebih ringan.
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

export default function App() {
  const [menu, setMenu] = useState(() => readStore("d102_menu_v2", INITIAL_MENU));
  const [orders, setOrders] = useState(() => readStore("d102_orders_v2", []));
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("Semua");
  const [page, setPage] = useState("kasir");
  const [search, setSearch] = useState("");
  const [cash, setCash] = useState("");
  const [modal, setModal] = useState("");
  const [spicyItem, setSpicyItem] = useState(null);
  const [spicyLevel, setSpicyLevel] = useState(1);
  const [newMenu, setNewMenu] = useState({ name: "", price: "", cost: "", category: "Seblak", image: "" });
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuImages, setMenuImages] = useState({});
  const [savingMenuImage, setSavingMenuImage] = useState(false);
  const [toast, setToast] = useState("");
  const [receipt, setReceipt] = useState(null);

  const [qrisImage, setQrisImage] = useState("");
  const [qrisLoading, setQrisLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [qrisConfirmed, setQrisConfirmed] = useState(false);
  const [savingQris, setSavingQris] = useState(false);

  useEffect(() => {
    getMenuImages().then(setMenuImages).catch((error) => console.error("Gagal memuat foto menu:", error));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("d102_menu_v2", JSON.stringify(menu));
    } catch {
      setToast("Penyimpanan menu penuh. Periksa ruang penyimpanan HP.");
    }
  }, [menu]);

  useEffect(() => {
    try {
      localStorage.setItem("d102_orders_v2", JSON.stringify(orders));
    } catch {
      setToast("Riwayat terlalu besar untuk disimpan. Cadangkan data terlebih dahulu.");
    }
  }, [orders]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let stored = await getQrisImage();

        // Migrasikan QRIS versi lama dari Local Storage ke IndexedDB
        // agar gambar yang pernah diunggah tidak hilang setelah pembaruan.
        if (!stored) {
          const oldImage = localStorage.getItem("d102_qris_image");
          if (oldImage) {
            await saveQrisImage(oldImage);
            stored = oldImage;
            localStorage.removeItem("d102_qris_image");
          }
        }

        if (active) setQrisImage(stored);
      } catch {
        if (active) setToast("Gagal memuat gambar QRIS dari penyimpanan HP.");
      } finally {
        if (active) setQrisLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredMenu = useMemo(() => menu.filter((item) =>
    (category === "Semua" || item.category === category) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  ), [menu, category, search]);

  const totalItems = cart.reduce((sum, row) => sum + row.qty, 0);
  const total = cart.reduce((sum, row) => sum + row.price * row.qty, 0);
  const cashAmount = Number(digits(cash)) || 0;
  const change = cashAmount - total;
  const canPay = total > 0 && (
    paymentMethod === "Tunai"
      ? cashAmount >= total
      : Boolean(qrisImage) && qrisConfirmed
  );

  const addItem = (item, level = null) => {
    if (!item) return;
    const key = level ? `${item.id}__L${level}` : item.id;
    setCart((old) => {
      const found = old.find((row) => row.key === key);
      if (found) {
        return old.map((row) => row.key === key ? { ...row, qty: row.qty + 1 } : row);
      }
      return [...old, {
        key, id: item.id, name: item.name, category: item.category,
        price: Number(item.price), cost: Number(item.cost) || 0, qty: 1, level
      }];
    });
    setToast(`${item.name} ditambahkan`);
  };

  const changeQty = (key, delta) => setCart((old) =>
    old.map((row) => row.key === key ? { ...row, qty: row.qty + delta } : row)
      .filter((row) => row.qty > 0)
  );

  const selectMenu = (item) => {
    if (item.category === "Seblak") {
      setSpicyItem(item);
      setSpicyLevel(1);
      setModal("spicy");
    } else {
      addItem(item);
    }
  };

  const choosePayment = (method) => {
    setPaymentMethod(method);
    setQrisConfirmed(false);
    if (method === "QRIS") setCash("");
  };

  const finishPayment = () => {
    if (!canPay) return;

    const itemCost = cart.reduce((sum, row) => sum + row.cost * row.qty, 0);
    const paidCash = paymentMethod === "Tunai" ? cashAmount : total;

    const order = {
      id: `D102-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map((row) => ({ ...row })),
      total,
      paymentMethod,
      cash: paidCash,
      change: paymentMethod === "Tunai" ? change : 0,
      cost: itemCost,
      profit: total - itemCost
    };

    setOrders((old) => [order, ...old]);
    setReceipt(order);
    setCart([]);
    setCash("");
    setPaymentMethod("Tunai");
    setQrisConfirmed(false);
    setModal("");
    setPage("kasir");
    setToast("Transaksi berhasil disimpan!");
  };

  const handleQrisUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast("File harus berupa gambar.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setToast("Ukuran gambar maksimal 15 MB.");
      return;
    }

    setSavingQris(true);
    try {
      const compressed = await compressImage(file);
      await saveQrisImage(compressed);
      setQrisImage(compressed);
      setToast("Gambar QRIS berhasil disimpan.");
    } catch (error) {
      setToast(error?.message || "Gagal menyimpan QRIS.");
    } finally {
      setSavingQris(false);
    }
  };

  const deleteQris = async () => {
    if (!window.confirm("Hapus gambar QRIS yang tersimpan?")) return;
    try {
      const db = await openQrisDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(QRIS_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      setQrisImage("");
      setQrisConfirmed(false);
      setToast("Gambar QRIS berhasil dihapus.");
    } catch {
      setToast("Gagal menghapus gambar QRIS.");
    }
  };

  // BACKUP: menu, riwayat transaksi, dan gambar QRIS dijadikan satu file JSON.
  const backupData = async () => {
    if (qrisLoading || savingQris) {
      setToast("Tunggu QRIS selesai dimuat atau disimpan.");
      return;
    }

    try {
      const backup = {
        app: "Dapur Satu Kosong Dua",
        version: 1,
        exportedAt: new Date().toISOString(),
        menu,
        orders,
        qrisImage
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-dapur-satu-kosong-dua-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setToast("Backup berhasil dibuat. Periksa folder Download.");
    } catch (error) {
      console.error("Backup gagal:", error);
      setToast("Gagal membuat backup. Coba lagi.");
    }
  };

  // RESTORE: mengembalikan menu, transaksi, dan QRIS dari file backup.
  const restoreData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (qrisLoading || savingQris) {
      setToast("Tunggu QRIS selesai dimuat atau disimpan.");
      event.target.value = "";
      return;
    }

    if (!window.confirm(
      "Data menu, riwayat transaksi, dan QRIS saat ini akan diganti dengan isi backup. Pastikan file backup benar. Lanjutkan?"
    )) {
      event.target.value = "";
      return;
    }

    try {
      const content = await file.text();
      const backup = JSON.parse(content);

      const validMenu = Array.isArray(backup.menu) && backup.menu.every((item) =>
        item &&
        (typeof item.id === "string" || typeof item.id === "number") &&
        typeof item.name === "string" &&
        typeof item.category === "string" &&
        Number.isFinite(Number(item.price))
      );

      const validOrders = Array.isArray(backup.orders) && backup.orders.every((order) =>
        order &&
        (typeof order.id === "string" || typeof order.id === "number") &&
        typeof order.date === "string" &&
        Array.isArray(order.items) &&
        Number.isFinite(Number(order.total))
      );

      if (
        backup.app !== "Dapur Satu Kosong Dua" ||
        !validMenu ||
        !validOrders ||
        (backup.qrisImage != null && typeof backup.qrisImage !== "string")
      ) {
        throw new Error("Format backup tidak cocok atau file rusak.");
      }

      // Simpan QRIS ke IndexedDB, sesuai sistem penyimpanan aplikasi saat ini.
      const db = await openQrisDB();
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(DB_STORE, "readwrite");
          const store = tx.objectStore(DB_STORE);
          if (backup.qrisImage) {
            store.put(backup.qrisImage, QRIS_KEY);
          } else {
            store.delete(QRIS_KEY);
          }
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error || new Error("Pemulihan QRIS dibatalkan."));
        });
      } finally {
        db.close();
      }

      // Simpan ke Local Storage; state React akan mengikuti dan tetap tersimpan.
      localStorage.setItem("d102_menu_v2", JSON.stringify(backup.menu));
      localStorage.setItem("d102_orders_v2", JSON.stringify(backup.orders));
      localStorage.removeItem("d102_qris_image");

      setMenu(backup.menu);
      setOrders(backup.orders);
      setQrisImage(backup.qrisImage || "");
      setQrisConfirmed(false);
      setCart([]);
      setCash("");
      setPaymentMethod("Tunai");
      setModal("");
      setToast("Semua data berhasil dipulihkan!");
    } catch (error) {
      console.error("Restore gagal:", error);
      setToast(error?.message || "Restore gagal. Periksa file backup.");
    } finally {
      event.target.value = "";
    }
  };

  const handleMenuPhoto = async (event, target) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setToast("Pilih file foto berformat gambar."); event.target.value = ""; return; }
    if (file.size > 12 * 1024 * 1024) { setToast("Ukuran foto maksimal 12 MB."); event.target.value = ""; return; }
    setSavingMenuImage(true);
    try {
      const image = await compressImage(file);
      if (target === "new") setNewMenu((old) => ({ ...old, image }));
      else setEditingMenu((old) => ({ ...old, image }));
    } catch (error) { setToast(error?.message || "Foto gagal diproses."); }
    finally { setSavingMenuImage(false); event.target.value = ""; }
  };
  const addNewMenu = async (event) => {
    event.preventDefault();
    if (!newMenu.name.trim() || Number(digits(newMenu.price)) <= 0) return;
    const id = `custom_${Date.now()}`;
    try {
      if (newMenu.image) { await saveMenuImage(id, newMenu.image); setMenuImages((old) => ({ ...old, [id]: newMenu.image })); }
      setMenu((old) => [...old, { id, name: newMenu.name.trim(), price: Number(digits(newMenu.price)), cost: Number(digits(newMenu.cost)), category: newMenu.category }]);
      setNewMenu({ name: "", price: "", cost: "", category: "Seblak", image: "" });
      setModal(""); setToast("Menu baru berhasil ditambahkan.");
    } catch (error) { setToast(error?.message || "Menu gagal disimpan. Coba lagi."); }
  };
  const saveMenuEdit = async (event) => {
    event.preventDefault();
    if (!editingMenu?.name.trim() || Number(digits(editingMenu.price)) <= 0) return;
    try {
      if (editingMenu.image) { await saveMenuImage(editingMenu.id, editingMenu.image); setMenuImages((old) => ({ ...old, [editingMenu.id]: editingMenu.image })); }
      setMenu((old) => old.map((item) => item.id === editingMenu.id ? { ...item, name: editingMenu.name.trim(), price: Number(digits(editingMenu.price)), cost: Number(digits(editingMenu.cost)), category: editingMenu.category } : item));
      setEditingMenu(null); setToast("Menu berhasil diperbarui.");
    } catch (error) { setToast(error?.message || "Perubahan menu gagal disimpan."); }
  };

  const removeMenu = (id) => {
    if (!window.confirm("Hapus menu ini?")) return;
    setMenu((old) => old.filter((item) => item.id !== id));
    setToast("Menu dihapus.");
  };

  const todayKey = new Date().toLocaleDateString("en-CA");
  const monthKey = todayKey.slice(0, 7);
  const todayOrders = orders.filter((order) =>
    new Date(order.date).toLocaleDateString("en-CA") === todayKey
  );
  const monthOrders = orders.filter((order) =>
    new Date(order.date).toLocaleDateString("en-CA").slice(0, 7) === monthKey
  );
  const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const todayProfit = todayOrders.reduce((sum, order) => sum + order.profit, 0);
  const monthSales = monthOrders.reduce((sum, order) => sum + order.total, 0);
  const monthProfit = monthOrders.reduce((sum, order) => sum + order.profit, 0);
  const allSales = orders.reduce((sum, order) => sum + order.total, 0);
  const allProfit = orders.reduce((sum, order) => sum + order.profit, 0);

  const NavButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setPage(id)}
      className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-bold ${
        page === id ? "text-[#ad5d42]" : "text-[#a58e7e]"
      }`}
    >
      <Icon size={20} />{label}
    </button>
  );

  const openCart = () => {
    setPaymentMethod("Tunai");
    setQrisConfirmed(false);
    setModal("cart");
  };

  return (
    <div className="min-h-screen bg-[#35241e] flex items-center justify-center font-sans sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[880px] max-w-md bg-[#fbf6ef] sm:rounded-[2rem] sm:border-[8px] border-[#493329] shadow-2xl relative overflow-hidden flex flex-col">
        <header className="bg-[#ad5d42] text-white pt-8 pb-4 px-5 rounded-b-2xl shadow-md z-10 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Flame size={25} className="text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg leading-tight">Dapur Satu Kosong Dua</h1>
                <p className="text-[#f0d9ce] text-xs">Kasir POS • Siap melayani</p>
              </div>
            </div>
            <button
              onClick={() => setModal("manage")}
              className="p-2 rounded-xl bg-white/15"
              title="Pengaturan"
            >
              <Settings size={19} />
            </button>
          </div>
        </header>

        {page === "kasir" && <>
          <div className="shrink-0 bg-[#fbf6ef] pt-3 px-4 border-b border-[#e7d9cb]">
            <div className="relative mb-3">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a58e7e]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e7d9cb] bg-white text-sm outline-none focus:ring-2 focus:ring-[#ce876b]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold ${
                    category === item ? "bg-[#ad5d42] text-white" : "bg-white text-[#665143] border border-[#e7d9cb]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-4 pb-28">
            <div className="grid grid-cols-2 gap-3">
              {filteredMenu.map((item) => {
                const qty = cart.filter((row) => row.id === item.id)
                  .reduce((sum, row) => sum + row.qty, 0);
                return (
                  <div key={item.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#f2e9df] flex flex-col min-h-[132px] relative">
                    {qty > 0 && (
                      <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#f8eee8]0 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {qty}
                      </span>
                    )}
                    <div className="flex-1 mb-3">
                      {menuImages[item.id] ? <img src={menuImages[item.id]} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-2" /> : <div className="w-full h-24 rounded-xl mb-2 bg-[#f2e9df] flex items-center justify-center text-[#a58e7e]"><ImagePlus size={25} /></div>}
                      <p className="text-[9px] font-extrabold text-[#ad5d42] mb-1 uppercase tracking-wide">{item.category}</p>
                      <h3 className="font-bold text-[#493329] text-sm leading-snug">{item.name}</h3>
                      <p className="text-[#fbf6ef]0 font-bold text-sm mt-1">{money(item.price)}</p>
                    </div>
                    <button
                      onClick={() => selectMenu(item)}
                      className="w-full py-2.5 bg-[#f2e9df] text-[#513d32] font-bold text-xs rounded-xl hover:bg-[#f8eee8] hover:text-[#ad5d42] active:scale-95"
                    >
                      + Tambah
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setModal("add")}
                className="bg-[#f2e9df] border-2 border-dashed border-[#d6c4b4] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-[#fbf6ef]0 min-h-[132px]"
              >
                <PlusCircle size={30} /><span className="font-bold text-xs">Menu Baru</span>
              </button>
            </div>
            {filteredMenu.length === 0 && (
              <p className="text-center text-sm text-[#a58e7e] py-8">Menu tidak ditemukan.</p>
            )}
          </main>

          {cart.length > 0 && (
            <div className="absolute bottom-[68px] left-4 right-4 z-20">
              <button
                onClick={openCart}
                className="w-full bg-[#ad5d42] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between active:scale-[.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart size={23} />
                    <span className="absolute -top-2 -right-2 bg-white text-[#ad5d42] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                      {totalItems}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[#f0d9ce] text-[10px]">Total Pesanan</p>
                    <p className="font-black text-lg leading-none">{money(total)}</p>
                  </div>
                </div>
                <span className="font-bold bg-white/20 px-3 py-2 rounded-xl text-xs">Lihat Keranjang</span>
              </button>
            </div>
          )}
        </>}

        {page === "riwayat" && (
          <main className="flex-1 overflow-y-auto p-4 pb-20">
            <h2 className="font-black text-xl text-[#493329] mb-1">Riwayat Transaksi</h2>
            <p className="text-xs text-[#fbf6ef]0 mb-4">{orders.length} transaksi tersimpan di perangkat ini</p>
            {orders.length === 0 ? (
              <div className="text-center py-16 text-[#a58e7e]">
                <Receipt size={36} className="mx-auto mb-2" />
                <p className="text-sm">Belum ada transaksi.</p>
              </div>
            ) : orders.map((order) => {
              const method = order.paymentMethod || "Tunai";
              return (
                <button
                  key={order.id}
                  onClick={() => setReceipt(order)}
                  className="w-full bg-white rounded-2xl p-4 mb-3 text-left border border-[#f2e9df] shadow-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-extrabold text-sm text-[#493329]">{new Date(order.date).toLocaleString("id-ID")}</span>
                    <span className="font-black text-[#ad5d42] text-sm">{money(order.total)}</span>
                  </div>
                  <p className="text-xs text-[#fbf6ef]0 mt-1">
                    {order.items.reduce((sum, row) => sum + row.qty, 0)} item • {method}
                    {method === "Tunai" ? ` • Kembali ${money(order.change)}` : " • Terbayar"}
                  </p>
                  <p className="text-[10px] text-[#a58e7e] mt-2">{order.id}</p>
                </button>
              );
            })}
          </main>
        )}

        {page === "laporan" && (
          <main className="flex-1 overflow-y-auto p-4 pb-20">
            <h2 className="font-black text-xl text-[#493329] mb-4">Laporan Penjualan</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-2xl p-4 border border-[#f2e9df]">
                <p className="text-xs text-[#fbf6ef]0 font-semibold">Omzet Hari Ini</p>
                <p className="font-black text-lg text-[#ad5d42] mt-1">{money(todaySales)}</p>
                <p className="text-[10px] text-[#a58e7e]">{todayOrders.length} transaksi</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#f2e9df]">
                <p className="text-xs text-[#fbf6ef]0 font-semibold">Laba Hari Ini*</p>
                <p className="font-black text-lg text-[#76503f] mt-1">{money(todayProfit)}</p>
                <p className="text-[10px] text-[#a58e7e]">Berdasarkan HPP menu</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#f2e9df]">
                <p className="text-xs text-[#fbf6ef]0 font-semibold">Omzet Bulan Ini</p>
                <p className="font-black text-lg text-[#493329] mt-1">{money(monthSales)}</p>
                <p className="text-[10px] text-[#a58e7e]">{monthOrders.length} transaksi</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#f2e9df]">
                <p className="text-xs text-[#fbf6ef]0 font-semibold">Laba Bulan Ini*</p>
                <p className="font-black text-lg text-[#76503f] mt-1">{money(monthProfit)}</p>
                <p className="text-[10px] text-[#a58e7e]">Berdasarkan HPP menu</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#f2e9df]">
                <p className="text-xs text-[#fbf6ef]0 font-semibold">Total Omzet</p>
                <p className="font-black text-lg text-[#493329] mt-1">{money(allSales)}</p>
                <p className="text-[10px] text-[#a58e7e]">Seluruh riwayat</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#f2e9df]">
                <p className="text-xs text-[#fbf6ef]0 font-semibold">Estimasi Laba*</p>
                <p className="font-black text-lg text-[#76503f] mt-1">{money(allProfit)}</p>
                <p className="text-[10px] text-[#a58e7e]">Seluruh riwayat</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">
              *Laba baru akurat jika HPP/modal setiap menu sudah diisi melalui Kelola Menu. HPP awal semua menu adalah Rp0.
            </div>
            <div className="bg-white rounded-2xl p-4 mt-3">
              <p className="font-bold text-sm mb-2">Catatan</p>
              <p className="text-xs text-[#fbf6ef]0 leading-relaxed">
                Data menu dan riwayat tersimpan di browser/perangkat ini. Gunakan perangkat dan browser yang sama agar data tetap terbaca.
              </p>
            </div>
          </main>
        )}

        <nav className="shrink-0 h-[64px] bg-white border-t border-[#e7d9cb] flex items-center px-4 z-30">
          <NavButton id="kasir" icon={Utensils} label="Kasir" />
          <NavButton id="riwayat" icon={History} label="Riwayat" />
          <NavButton id="laporan" icon={ChartNoAxesCombined} label="Laporan" />
        </nav>

        {modal === "spicy" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => setModal("")} />
            <div className="relative bg-white w-full rounded-3xl p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-xl">Pilih Level Pedas</h3>
                <button onClick={() => setModal("")} className="p-2 bg-[#f2e9df] rounded-full"><X size={18} /></button>
              </div>
              <p className="text-sm text-[#fbf6ef]0 mb-4">{spicyItem?.name}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpicyLevel(level)}
                    className={`rounded-xl py-4 font-black border ${
                      spicyLevel === level ? "bg-[#ad5d42] text-white border-[#ad5d42]" : "bg-white text-[#665143] border-[#e7d9cb]"
                    }`}
                  >
                    <Flame className="mx-auto mb-1" size={20} /><span>Level {level}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { addItem(spicyItem, spicyLevel); setModal(""); }}
                className="w-full bg-[#ad5d42] text-white py-3.5 rounded-xl font-bold"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        )}

        {modal === "cart" && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => setModal("")} />
            <div className="relative bg-white rounded-t-3xl max-h-[94%] flex flex-col">
              <div className="p-5 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-black text-xl">Keranjang</h2>
                  <p className="text-xs text-[#fbf6ef]0">{totalItems} item dipilih</p>
                </div>
                <button onClick={() => setModal("")} className="p-2 bg-[#f2e9df] rounded-full"><X size={19} /></button>
              </div>

              <div className="overflow-y-auto p-5 space-y-4">
                {cart.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#493329]">
                        {row.name}{row.level ? ` • Level ${row.level}` : ""}
                      </p>
                      <p className="text-xs text-[#fbf6ef]0">{money(row.price)} × {row.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQty(row.key, -1)} className="w-8 h-8 rounded-lg bg-[#f2e9df] flex items-center justify-center"><Minus size={15} /></button>
                      <b className="text-sm">{row.qty}</b>
                      <button onClick={() => changeQty(row.key, 1)} className="w-8 h-8 rounded-lg bg-[#ad5d42] text-white flex items-center justify-center"><Plus size={15} /></button>
                    </div>
                    <b className="text-sm">{money(row.price * row.qty)}</b>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-[#fbf6ef] border-t overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-[#fbf6ef]0">Total Bayar</span>
                  <b className="text-2xl">{money(total)}</b>
                </div>

                <p className="block text-xs font-black mb-2">Pilih Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => choosePayment("Tunai")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm ${
                      paymentMethod === "Tunai" ? "bg-[#ad5d42] text-white border-[#ad5d42]" : "bg-white text-[#665143] border-[#e7d9cb]"
                    }`}
                  >
                    <Wallet size={18} /> Tunai
                  </button>
                  <button
                    onClick={() => choosePayment("QRIS")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm ${
                      paymentMethod === "QRIS" ? "bg-[#ad5d42] text-white border-[#ad5d42]" : "bg-white text-[#665143] border-[#e7d9cb]"
                    }`}
                  >
                    <QrCode size={18} /> QRIS
                  </button>
                </div>

                {paymentMethod === "Tunai" ? (
                  <>
                    <label className="block text-xs font-bold mb-2">Uang Tunai Pembeli</label>
                    <input
                      value={cash ? Number(digits(cash)).toLocaleString("id-ID") : ""}
                      onChange={(event) => setCash(digits(event.target.value))}
                      inputMode="numeric"
                      placeholder="Masukkan nominal uang"
                      className="w-full bg-white border border-[#e7d9cb] rounded-xl p-3 text-right font-bold text-lg outline-none focus:ring-2 focus:ring-[#ce876b]"
                    />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[['Pas', total], ["20rb", 20000], ["50rb", 50000], ["100rb", 100000]].map(([label, value]) => (
                        <button key={label} onClick={() => setCash(String(value))} className="py-2 rounded-lg bg-white border text-[11px] font-bold">
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between p-3 bg-white border rounded-xl mt-3 mb-4">
                      <span className="text-sm text-[#fbf6ef]0 font-semibold">Kembalian</span>
                      <b className={change >= 0 && cashAmount ? "text-[#76503f]" : "text-[#a58e7e]"}>
                        {cashAmount ? money(Math.max(0, change)) : "—"}
                      </b>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-[#e7d9cb] rounded-2xl p-3 mb-4">
                    <div className="text-center">
                      <p className="font-black text-base">Pembayaran QRIS</p>
                      <p className="text-xs text-[#fbf6ef]0 mt-1">Minta pembeli memindai kode berikut.</p>
                    </div>
                    {qrisImage ? (
                      <img
                        src={qrisImage}
                        alt="QRIS Dapur Satu Kosong Dua"
                        className="w-full max-h-64 object-contain my-3 rounded-xl"
                      />
                    ) : (
                      <div className="my-3 border-2 border-dashed rounded-xl p-6 text-center text-sm text-[#fbf6ef]0">
                        QRIS belum diunggah. Buka Pengaturan untuk mengunggah gambar QRIS.
                      </div>
                    )}
                    <div className="text-center bg-[#f8eee8] rounded-xl p-3">
                      <p className="text-xs text-[#ad5d42] font-semibold">Total yang harus dibayar</p>
                      <p className="text-2xl font-black text-[#ad5d42]">{money(total)}</p>
                    </div>
                    <label className={`mt-3 flex items-start gap-2 text-xs leading-relaxed ${
                      qrisImage ? "text-[#513d32]" : "text-[#a58e7e]"
                    }`}>
                      <input
                        type="checkbox"
                        checked={qrisConfirmed}
                        disabled={!qrisImage}
                        onChange={(event) => setQrisConfirmed(event.target.checked)}
                        className="mt-0.5 accent-[#ad5d42]"
                      />
                      <span>Saya sudah mengecek aplikasi DANA dan memastikan pembayaran QRIS benar-benar masuk.</span>
                    </label>
                    <div className="mt-3 flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 rounded-lg p-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>QRIS tidak memeriksa pembayaran secara otomatis. Jangan konfirmasi sebelum saldo/transaksi masuk di aplikasi DANA.</span>
                    </div>
                  </div>
                )}

                <button
                  disabled={!canPay}
                  onClick={finishPayment}
                  className="w-full py-4 rounded-xl bg-[#ad5d42] text-white font-black disabled:bg-[#e7d9cb] disabled:text-[#a58e7e]"
                >
                  {paymentMethod === "QRIS" ? "Konfirmasi & Selesaikan Transaksi" : "Selesaikan Transaksi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {modal === "add" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => setModal("")} />
            <form onSubmit={addNewMenu} className="relative bg-white w-full rounded-3xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xl">Tambah Menu</h3>
                <button type="button" onClick={() => setModal("")} className="p-2 bg-[#f2e9df] rounded-full"><X size={18} /></button>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold">Foto Menu (opsional)</span>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#d6c4b4] bg-[#fbf6ef] cursor-pointer">
                  {newMenu.image ? <img src={newMenu.image} alt="Pratinjau foto menu" className="w-16 h-16 object-cover rounded-lg" /> : <span className="w-16 h-16 rounded-lg bg-[#f2e9df] flex items-center justify-center text-[#ad5d42]"><ImagePlus size={24} /></span>}
                  <span className="text-xs text-[#665143]">{savingMenuImage ? "Memproses foto..." : newMenu.image ? "Pilih foto lain" : "Pilih foto dari galeri HP"}</span>
                  <input type="file" accept="image/*" onChange={(event) => handleMenuPhoto(event, "new")} className="hidden" />
                </label>
              </div>
              <label className="block text-xs font-bold">
                Nama Menu
                <input required value={newMenu.name} onChange={(event) => setNewMenu({ ...newMenu, name: event.target.value })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm font-normal" placeholder="Nama menu" />
              </label>
              <label className="block text-xs font-bold">
                Kategori
                <select value={newMenu.category} onChange={(event) => setNewMenu({ ...newMenu, category: event.target.value })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm">
                  {CATEGORIES.filter((item) => item !== "Semua").map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold">
                Harga Jual (Rp)
                <input required inputMode="numeric" value={newMenu.price ? Number(digits(newMenu.price)).toLocaleString("id-ID") : ""} onChange={(event) => setNewMenu({ ...newMenu, price: digits(event.target.value) })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm" placeholder="0" />
              </label>
              <label className="block text-xs font-bold">
                Modal / HPP per porsi (Rp)
                <input inputMode="numeric" value={newMenu.cost ? Number(digits(newMenu.cost)).toLocaleString("id-ID") : ""} onChange={(event) => setNewMenu({ ...newMenu, cost: digits(event.target.value) })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm" placeholder="Isi agar laba terhitung" />
              </label>
              <button className="w-full bg-[#ad5d42] text-white py-3.5 rounded-xl font-bold">Simpan Menu</button>
            </form>
          </div>
        )}

        {modal === "qris" && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => setModal("manage")} />
            <div className="relative bg-white w-full rounded-3xl p-5 space-y-4 max-h-[90%] overflow-y-auto">
              <div className="flex justify-between items-center gap-2">
                <div>
                  <h3 className="font-black text-xl">Pengaturan QRIS</h3>
                  <p className="text-xs text-[#fbf6ef]0">QRIS Dapur Satu Kosong Dua</p>
                </div>
                <button onClick={() => setModal("manage")} className="p-2 bg-[#f2e9df] rounded-full"><X size={18} /></button>
              </div>

              {qrisLoading ? (
                <div className="p-8 text-center text-sm text-[#a58e7e]">Memuat gambar QRIS...</div>
              ) : qrisImage ? (
                <div className="border rounded-2xl p-3">
                  <img src={qrisImage} alt="QRIS tersimpan" className="w-full max-h-72 object-contain rounded-xl" />
                  <p className="text-center text-xs text-[#76503f] font-bold mt-2">QRIS tersimpan di perangkat ini</p>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-2xl p-8 text-center text-[#a58e7e]">
                  <QrCode size={42} className="mx-auto mb-2" />
                  <p className="text-sm font-bold">Belum ada gambar QRIS</p>
                  <p className="text-xs mt-1">Unggah QRIS dari galeri HP.</p>
                </div>
              )}

              <label className={`flex items-center justify-center gap-2 w-full text-center bg-[#ad5d42] text-white py-3 rounded-xl font-bold cursor-pointer ${savingQris ? "opacity-60 pointer-events-none" : ""}`}>
                <ImagePlus size={18} />
                {savingQris ? "Menyimpan..." : qrisImage ? "Ganti Gambar QRIS" : "Unggah QRIS dari Galeri"}
                <input type="file" accept="image/*" className="hidden" disabled={savingQris} onChange={handleQrisUpload} />
              </label>

              {qrisImage && (
                <button onClick={deleteQris} className="w-full py-3 rounded-xl border border-[#e6c0b1] text-[#ad5d42] font-bold text-sm">
                  Hapus Gambar QRIS
                </button>
              )}
              <p className="text-[10px] text-[#a58e7e] leading-relaxed">
                Gambar diperkecil dan disimpan menggunakan IndexedDB di browser HP ini. Jika data browser dihapus atau berganti perangkat/browser, gambar perlu diunggah kembali.
              </p>
              <button onClick={() => setModal("manage")} className="w-full bg-[#35241e] text-white py-3 rounded-xl font-bold">Selesai</button>
            </div>
          </div>
        )}

        {modal === "manage" && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => setModal("")} />
            <div className="relative bg-white rounded-t-3xl max-h-[88%] flex flex-col">
              <div className="p-5 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl">Pengaturan & Kelola Menu</h3>
                  <p className="text-xs text-[#fbf6ef]0">Atur menu, harga, modal, dan QRIS</p>
                </div>
                <button onClick={() => setModal("")} className="p-2 bg-[#f2e9df] rounded-full"><X size={18} /></button>
              </div>

              {/* PANEL BACKUP & RESTORE */}
              <div className="p-4 border-b">
                <p className="font-black text-sm mb-1">Keamanan Data</p>
                <p className="text-xs text-[#fbf6ef]0 mb-3">Simpan atau pulihkan seluruh data warung, termasuk QRIS.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={backupData}
                    disabled={qrisLoading || savingQris}
                    className="bg-[#76503f] disabled:bg-[#d6c4b4] text-white rounded-xl p-4 flex flex-col items-center gap-2 font-bold text-xs"
                  >
                    <Download size={24} />
                    Backup Data
                  </button>
                  <label className="bg-[#ad5d42] text-white rounded-xl p-4 flex flex-col items-center gap-2 font-bold text-xs cursor-pointer">
                    <Upload size={24} />
                    Restore Data
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={restoreData}
                      disabled={qrisLoading || savingQris}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-amber-700 mt-3 leading-relaxed">
                  Simpan file backup di tempat aman. Restore akan mengganti menu, riwayat transaksi, dan QRIS yang sedang digunakan.
                </p>
              </div>

              <div className="p-4 border-b">
                <button onClick={() => setModal("qris")} className="w-full flex items-center justify-between gap-3 bg-[#f8eee8] border border-[#f0d9ce] rounded-xl p-4 text-left">
                  <span className="flex items-center gap-3">
                    <span className="bg-[#ad5d42] text-white p-2 rounded-lg"><QrCode size={20} /></span>
                    <span>
                      <span className="block font-black text-sm text-[#493329]">Pengaturan QRIS</span>
                      <span className="block text-xs text-[#fbf6ef]0">{qrisImage ? "Gambar QRIS sudah tersedia" : "Unggah gambar QRIS dari galeri"}</span>
                    </span>
                  </span>
                  <span className="text-[#ad5d42] text-xs font-bold">Buka</span>
                </button>
              </div>
              <div className="px-5 pt-3 pb-1">
                <p className="font-bold text-sm">Daftar Menu</p>
                <p className="text-xs text-[#fbf6ef]0">Ubah harga jual dan modal/HPP</p>
              </div>
              <div className="overflow-y-auto p-4 pt-2 space-y-2">
                {menu.map((item) => (
                  <div key={item.id} className="bg-[#fbf6ef] rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-[10px] text-[#fbf6ef]0">{item.category} • Jual {money(item.price)} • HPP {money(item.cost)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingMenu({ ...item, price: String(item.price), cost: String(item.cost) }); setModal("edit"); }} className="p-2 bg-white border rounded-lg text-[#ad5d42]"><Pencil size={16} /></button>
                      <button onClick={() => removeMenu(item.id)} className="p-2 bg-white border rounded-lg text-[#f8eee8]0"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <button onClick={() => setModal("add")} className="w-full bg-[#ad5d42] text-white rounded-xl py-3 font-bold">+ Tambah Menu Baru</button>
              </div>
            </div>
          </div>
        )}

        {modal === "edit" && editingMenu && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => { setEditingMenu(null); setModal("manage"); }} />
            <form onSubmit={saveMenuEdit} className="relative bg-white w-full rounded-3xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xl">Edit Menu</h3>
                <button type="button" onClick={() => { setEditingMenu(null); setModal("manage"); }} className="p-2 bg-[#f2e9df] rounded-full"><X size={18} /></button>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold">Foto Menu (opsional)</span>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#d6c4b4] bg-[#fbf6ef] cursor-pointer">
                  {editingMenu.image || menuImages[editingMenu.id] ? <img src={editingMenu.image || menuImages[editingMenu.id]} alt="Pratinjau foto menu" className="w-16 h-16 object-cover rounded-lg" /> : <span className="w-16 h-16 rounded-lg bg-[#f2e9df] flex items-center justify-center text-[#ad5d42]"><ImagePlus size={24} /></span>}
                  <span className="text-xs text-[#665143]">{savingMenuImage ? "Memproses foto..." : "Pilih atau ganti foto dari galeri HP"}</span>
                  <input type="file" accept="image/*" onChange={(event) => handleMenuPhoto(event, "edit")} className="hidden" />
                </label>
                {(editingMenu.image || menuImages[editingMenu.id]) && <button type="button" onClick={() => setEditingMenu({ ...editingMenu, image: null })} className="text-xs text-[#ad5d42] font-bold">Hapus foto menu</button>}
              </div>
              <label className="block text-xs font-bold">
                Nama
                <input required value={editingMenu.name} onChange={(event) => setEditingMenu({ ...editingMenu, name: event.target.value })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm font-normal" />
              </label>
              <label className="block text-xs font-bold">
                Kategori
                <select value={editingMenu.category} onChange={(event) => setEditingMenu({ ...editingMenu, category: event.target.value })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm">
                  {CATEGORIES.filter((item) => item !== "Semua").map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold">
                Harga Jual
                <input required inputMode="numeric" value={editingMenu.price ? Number(digits(editingMenu.price)).toLocaleString("id-ID") : ""} onChange={(event) => setEditingMenu({ ...editingMenu, price: digits(event.target.value) })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm" />
              </label>
              <label className="block text-xs font-bold">
                Modal / HPP
                <input inputMode="numeric" value={editingMenu.cost ? Number(digits(editingMenu.cost)).toLocaleString("id-ID") : ""} onChange={(event) => setEditingMenu({ ...editingMenu, cost: digits(event.target.value) })} className="w-full mt-1 p-3 bg-[#fbf6ef] border rounded-xl text-sm" />
              </label>
              <button className="w-full bg-[#ad5d42] text-white py-3.5 rounded-xl font-bold">Simpan Perubahan</button>
            </form>
          </div>
        )}

        {receipt && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#35241e]/60" onClick={() => setReceipt(null)} />
            <div className="relative bg-white w-full rounded-3xl p-5 max-h-[85%] overflow-y-auto">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 text-[#76503f] rounded-full mx-auto flex items-center justify-center mb-2"><CheckCircle2 size={27} /></div>
                <h3 className="font-black text-xl">Detail Transaksi</h3>
                <p className="text-[10px] text-[#a58e7e]">{receipt.id}</p>
                <p className="text-xs text-[#fbf6ef]0">{new Date(receipt.date).toLocaleString("id-ID")}</p>
              </div>
              <div className="border-y py-3 space-y-2">
                {receipt.items.map((row, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{row.name}{row.level ? ` (Level ${row.level})` : ""} × {row.qty}</span>
                    <b>{money(row.price * row.qty)}</b>
                  </div>
                ))}
              </div>
              <div className="space-y-2 py-3 text-sm">
                <div className="flex justify-between font-black"><span>Total</span><span>{money(receipt.total)}</span></div>
                <div className="flex justify-between"><span>Metode Pembayaran</span><b>{receipt.paymentMethod || "Tunai"}</b></div>
                <div className="flex justify-between">
                  <span>{(receipt.paymentMethod || "Tunai") === "QRIS" ? "QRIS diterima" : "Uang diterima"}</span>
                  <span>{money(receipt.cash ?? receipt.total)}</span>
                </div>
                {(receipt.paymentMethod || "Tunai") === "Tunai" && (
                  <div className="flex justify-between text-[#76503f] font-bold">
                    <span>Kembalian</span><span>{money(receipt.change)}</span>
                  </div>
                )}
                {(receipt.paymentMethod || "Tunai") === "QRIS" && (
                  <p className="text-xs text-[#76503f] font-bold text-right">✓ Pembayaran telah dikonfirmasi kasir</p>
                )}
              </div>
              <button onClick={() => setReceipt(null)} className="w-full bg-[#35241e] text-white py-3 rounded-xl font-bold mt-2">Tutup</button>
            </div>
          </div>
        )}

        {toast && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[80] bg-[#35241e] text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold whitespace-nowrap max-w-[92%]">
            <CheckCircle2 size={17} className="text-green-400 shrink-0" />{toast}
          </div>
        )}

        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </div>
    </div>
  );
}
