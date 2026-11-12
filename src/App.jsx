import React, { useEffect, useMemo, useState } from "react";
import {
  Flame, ShoppingCart, Plus, Minus, X, Wallet, CheckCircle2,
  PlusCircle, History, ChartNoAxesCombined, Trash2, Pencil,
  Receipt, Search, Settings, ChevronLeft, Utensils
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
  { id: "tk_2", name: "Ekstra Cabe > 5", price: 2000, cost: 0, category: "Tahu Kocek" },
];

const money = (n) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(Number(n) || 0);
const digits = (v) => String(v ?? "").replace(/\D/g, "");
const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch { return fallback; }
};

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
  const [newMenu, setNewMenu] = useState({ name: "", price: "", cost: "", category: "Seblak" });
  const [editingMenu, setEditingMenu] = useState(null);
  const [toast, setToast] = useState("");
  const [receipt, setReceipt] = useState(null);
const [qrisImage, setQrisImage] = useState(
  () => readStore("d102_qris_image", "")
);

const [paymentMethod, setPaymentMethod] = useState("Tunai");

  useEffect(() => { localStorage.setItem("d102_menu_v2", JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem("d102_orders_v2", JSON.stringify(orders)); }, [orders]);
useEffect(() => {
  try {
    localStorage.setItem("d102_qris_image", qrisImage);
  } catch {
    setToast("Ukuran gambar QRIS terlalu besar");
  }
}, [qrisImage]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredMenu = useMemo(() => menu.filter((item) =>
    (category === "Semua" || item.category === category) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  ), [menu, category, search]);

  const totalItems = cart.reduce((sum, row) => sum + row.qty, 0);
  const total = cart.reduce((sum, row) => sum + row.price * row.qty, 0);
  const cashAmount = Number(digits(cash)) || 0;
  const change = cashAmount - total;
  const canPay = total > 0 && cashAmount >= total;

  const addItem = (item, level = null) => {
    const key = level ? `${item.id}__L${level}` : item.id;
    setCart((old) => {
      const found = old.find((r) => r.key === key);
      if (found) return old.map((r) => r.key === key ? { ...r, qty: r.qty + 1 } : r);
      return [...old, {
        key, id: item.id, name: item.name, category: item.category,
        price: Number(item.price), cost: Number(item.cost) || 0, qty: 1,
        level
      }];
    });
    setToast(`${item.name} ditambahkan`);
  };
  const changeQty = (key, delta) => setCart((old) =>
    old.map((r) => r.key === key ? { ...r, qty: r.qty + delta } : r).filter((r) => r.qty > 0)
  );
  const selectMenu = (item) => {
    if (item.category === "Seblak") {
      setSpicyItem(item); setSpicyLevel(1); setModal("spicy");
    } else addItem(item);
  };
  const finishPayment = () => {
    if (!canPay) return;
    const order = {
      id: `D102-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      total,
      cash: cashAmount,
      change,
      cost: cart.reduce((sum, r) => sum + r.cost * r.qty, 0),
      profit: total - cart.reduce((sum, r) => sum + r.cost * r.qty, 0)
    };
    setOrders((old) => [order, ...old]);
    setReceipt(order);
    setCart([]); setCash(""); setModal(""); setPage("kasir");
    setToast("Transaksi berhasil disimpan!");
  };
  const addNewMenu = (e) => {
    e.preventDefault();
    if (!newMenu.name.trim() || Number(digits(newMenu.price)) <= 0) return;
    setMenu((old) => [...old, {
      id: `custom_${Date.now()}`, name: newMenu.name.trim(),
      price: Number(digits(newMenu.price)), cost: Number(digits(newMenu.cost)),
      category: newMenu.category
    }]);
    setNewMenu({ name: "", price: "", cost: "", category: "Seblak" });
    setModal(""); setToast("Menu baru berhasil ditambahkan");
  };
  const saveMenuEdit = (e) => {
    e.preventDefault();
    setMenu((old) => old.map((m) => m.id === editingMenu.id ? {
      ...m, name: editingMenu.name.trim(), price: Number(digits(editingMenu.price)),
      cost: Number(digits(editingMenu.cost)), category: editingMenu.category
    } : m));
    setEditingMenu(null); setToast("Menu berhasil diperbarui");
  };
  const removeMenu = (id) => {
    if (!window.confirm("Hapus menu ini?")) return;
    setMenu((old) => old.filter((m) => m.id !== id));
    setToast("Menu dihapus");
  };
  const todayKey = new Date().toLocaleDateString("en-CA");
  const monthKey = todayKey.slice(0, 7);
  const todayOrders = orders.filter((o) => new Date(o.date).toLocaleDateString("en-CA") === todayKey);
  const monthOrders = orders.filter((o) => new Date(o.date).toLocaleDateString("en-CA").slice(0, 7) === monthKey);
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayProfit = todayOrders.reduce((s, o) => s + o.profit, 0);
  const monthSales = monthOrders.reduce((s, o) => s + o.total, 0);
  const monthProfit = monthOrders.reduce((s, o) => s + o.profit, 0);
  const allSales = orders.reduce((s, o) => s + o.total, 0);
  const allProfit = orders.reduce((s, o) => s + o.profit, 0);

  const NavButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setPage(id)} className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-bold ${page === id ? "text-red-600" : "text-neutral-400"}`}>
      <Icon size={20} />{label}
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[880px] max-w-md bg-neutral-50 sm:rounded-[2rem] sm:border-[8px] border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col">
        <header className="bg-red-600 text-white pt-8 pb-4 px-5 rounded-b-2xl shadow-md z-10 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl"><Flame size={25} className="text-yellow-300 fill-yellow-300" /></div>
              <div><h1 className="font-extrabold text-lg leading-tight">Dapur Satu Kosong Dua</h1><p className="text-red-100 text-xs">Kasir POS • Siap melayani</p></div>
            </div>
            <button onClick={() => setModal("manage")} className="p-2 rounded-xl bg-white/15" title="Kelola menu"><Settings size={19} /></button>
          </div>
        </header>

        {page === "kasir" && <>
          <div className="shrink-0 bg-neutral-50 pt-3 px-4 border-b border-neutral-200">
            <div className="relative mb-3">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari menu..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
              {CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold ${category === c ? "bg-red-600 text-white" : "bg-white text-neutral-600 border border-neutral-200"}`}>{c}</button>)}
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 pb-28">
            <div className="grid grid-cols-2 gap-3">
              {filteredMenu.map((item) => {
                const qty = cart.filter((r) => r.id === item.id).reduce((s, r) => s + r.qty, 0);
                return <div key={item.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-neutral-100 flex flex-col min-h-[132px] relative">
                  {qty > 0 && <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs">{qty}</span>}
                  <div className="flex-1 mb-3"><p className="text-[9px] font-extrabold text-red-500 mb-1 uppercase tracking-wide">{item.category}</p><h3 className="font-bold text-neutral-800 text-sm leading-snug">{item.name}</h3><p className="text-neutral-500 font-bold text-sm mt-1">{money(item.price)}</p></div>
                  <button onClick={() => selectMenu(item)} className="w-full py-2.5 bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-600 active:scale-95">+ Tambah</button>
                </div>;
              })}
              <button onClick={() => setModal("add")} className="bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-neutral-500 min-h-[132px]"><PlusCircle size={30} /><span className="font-bold text-xs">Menu Baru</span></button>
            </div>
            {filteredMenu.length === 0 && <p className="text-center text-sm text-neutral-400 py-8">Menu tidak ditemukan.</p>}
          </main>
          {cart.length > 0 && <div className="absolute bottom-[68px] left-4 right-4 z-20">
            <button onClick={() => setModal("cart")} className="w-full bg-red-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between active:scale-[.98]">
              <div className="flex items-center gap-3"><div className="relative"><ShoppingCart size={23}/><span className="absolute -top-2 -right-2 bg-white text-red-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">{totalItems}</span></div><div className="text-left"><p className="text-red-100 text-[10px]">Total Pesanan</p><p className="font-black text-lg leading-none">{money(total)}</p></div></div><span className="font-bold bg-white/20 px-3 py-2 rounded-xl text-xs">Lihat Keranjang</span>
            </button>
          </div>}
        </>}

        {page === "riwayat" && <main className="flex-1 overflow-y-auto p-4 pb-20">
          <h2 className="font-black text-xl text-neutral-800 mb-1">Riwayat Transaksi</h2><p className="text-xs text-neutral-500 mb-4">{orders.length} transaksi tersimpan di perangkat ini</p>
          {orders.length === 0 ? <div className="text-center py-16 text-neutral-400"><Receipt size={36} className="mx-auto mb-2"/><p className="text-sm">Belum ada transaksi.</p></div> : orders.map((o) => <button key={o.id} onClick={() => setReceipt(o)} className="w-full bg-white rounded-2xl p-4 mb-3 text-left border border-neutral-100 shadow-sm">
            <div className="flex justify-between gap-2"><span className="font-extrabold text-sm text-neutral-800">{new Date(o.date).toLocaleString("id-ID")}</span><span className="font-black text-red-600 text-sm">{money(o.total)}</span></div>
            <p className="text-xs text-neutral-500 mt-1">{o.items.reduce((s, r) => s + r.qty, 0)} item • Tunai {money(o.cash)} • Kembali {money(o.change)}</p><p className="text-[10px] text-neutral-400 mt-2">{o.id}</p>
          </button>)}
        </main>}

        {page === "laporan" && <main className="flex-1 overflow-y-auto p-4 pb-20">
          <h2 className="font-black text-xl text-neutral-800 mb-4">Laporan Penjualan</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-4 border border-neutral-100"><p className="text-xs text-neutral-500 font-semibold">Omzet Hari Ini</p><p className="font-black text-lg text-red-600 mt-1">{money(todaySales)}</p><p className="text-[10px] text-neutral-400">{todayOrders.length} transaksi</p></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-100"><p className="text-xs text-neutral-500 font-semibold">Laba Hari Ini*</p><p className="font-black text-lg text-green-600 mt-1">{money(todayProfit)}</p><p className="text-[10px] text-neutral-400">Berdasarkan HPP menu</p></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-100"><p className="text-xs text-neutral-500 font-semibold">Omzet Bulan Ini</p><p className="font-black text-lg text-neutral-800 mt-1">{money(monthSales)}</p><p className="text-[10px] text-neutral-400">{monthOrders.length} transaksi</p></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-100"><p className="text-xs text-neutral-500 font-semibold">Laba Bulan Ini*</p><p className="font-black text-lg text-green-600 mt-1">{money(monthProfit)}</p><p className="text-[10px] text-neutral-400">Berdasarkan HPP menu</p></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-100"><p className="text-xs text-neutral-500 font-semibold">Total Omzet</p><p className="font-black text-lg text-neutral-800 mt-1">{money(allSales)}</p><p className="text-[10px] text-neutral-400">Seluruh riwayat</p></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-100"><p className="text-xs text-neutral-500 font-semibold">Estimasi Laba*</p><p className="font-black text-lg text-green-600 mt-1">{money(allProfit)}</p><p className="text-[10px] text-neutral-400">Seluruh riwayat</p></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">*Laba baru akurat jika HPP/modal setiap menu sudah diisi melalui Kelola Menu. HPP awal semua menu adalah Rp0.</div>
          <div className="bg-white rounded-2xl p-4 mt-3"><p className="font-bold text-sm mb-2">Catatan</p><p className="text-xs text-neutral-500 leading-relaxed">Data tersimpan di browser/perangkat ini. Gunakan perangkat dan browser yang sama agar riwayat tetap terbaca.</p></div>
        </main>}

        <nav className="shrink-0 h-[64px] bg-white border-t border-neutral-200 flex items-center px-4 z-30">
          <NavButton id="kasir" icon={Utensils} label="Kasir" /><NavButton id="riwayat" icon={History} label="Riwayat" /><NavButton id="laporan" icon={ChartNoAxesCombined} label="Laporan" />
        </nav>

        {modal === "spicy" && <div className="absolute inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-neutral-900/60" onClick={() => setModal("")}/><div className="relative bg-white w-full rounded-3xl p-5">
          <div className="flex justify-between items-center mb-2"><h3 className="font-black text-xl">Pilih Level Pedas</h3><button onClick={() => setModal("")} className="p-2 bg-neutral-100 rounded-full"><X size={18}/></button></div><p className="text-sm text-neutral-500 mb-4">{spicyItem?.name}</p>
          <div className="grid grid-cols-3 gap-2 mb-5">{[1,2,3].map((n) => <button key={n} onClick={() => setSpicyLevel(n)} className={`rounded-xl py-4 font-black border ${spicyLevel === n ? "bg-red-600 text-white border-red-600" : "bg-white text-neutral-600 border-neutral-200"}`}><Flame className="mx-auto mb-1" size={20}/><span>Level {n}</span></button>)}</div>
          <button onClick={() => { addItem(spicyItem, spicyLevel); setModal(""); }} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold">Tambah ke Keranjang</button>
        </div></div>}

        {modal === "cart" && <div className="absolute inset-0 z-50 flex flex-col justify-end"><div className="absolute inset-0 bg-neutral-900/60" onClick={() => setModal("")}/><div className="relative bg-white rounded-t-3xl max-h-[90%] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center"><div><h2 className="font-black text-xl">Keranjang</h2><p className="text-xs text-neutral-500">{totalItems} item dipilih</p></div><button onClick={() => setModal("")} className="p-2 bg-neutral-100 rounded-full"><X size={19}/></button></div>
          <div className="overflow-y-auto p-5 space-y-4">{cart.map((r) => <div key={r.key} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-bold text-sm text-neutral-800">{r.name}{r.level ? ` • Level ${r.level}` : ""}</p><p className="text-xs text-neutral-500">{money(r.price)} × {r.qty}</p></div><div className="flex items-center gap-2"><button onClick={() => changeQty(r.key, -1)} className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center"><Minus size={15}/></button><b className="text-sm">{r.qty}</b><button onClick={() => changeQty(r.key, 1)} className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center"><Plus size={15}/></button></div><b className="text-sm">{money(r.price * r.qty)}</b></div>)}</div>
          <div className="p-5 bg-neutral-50 border-t">
            <div className="flex justify-between items-center mb-3"><span className="font-semibold text-neutral-500">Total Bayar</span><b className="text-2xl">{money(total)}</b></div>
            <label className="block text-xs font-bold mb-2">Uang Tunai Pembeli</label><input value={cash ? Number(digits(cash)).toLocaleString("id-ID") : ""} onChange={(e) => setCash(digits(e.target.value))} inputMode="numeric" placeholder="Masukkan nominal uang" className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-right font-bold text-lg outline-none focus:ring-2 focus:ring-red-400"/>
            <div className="grid grid-cols-4 gap-2 mt-2">{[["Pas", total],["20rb",20000],["50rb",50000],["100rb",100000]].map(([label, value]) => <button key={label} onClick={() => setCash(String(value))} className="py-2 rounded-lg bg-white border text-[11px] font-bold">{label}</button>)}</div>
            <div className="flex justify-between p-3 bg-white border rounded-xl mt-3 mb-4"><span className="text-sm text-neutral-500 font-semibold">Kembalian</span><b className={change >= 0 && cashAmount ? "text-green-600" : "text-neutral-400"}>{cashAmount ? money(Math.max(0, change)) : "—"}</b></div>
            <button disabled={!canPay} onClick={finishPayment} className="w-full py-4 rounded-xl bg-red-600 text-white font-black disabled:bg-neutral-200 disabled:text-neutral-400">Selesaikan Transaksi</button>
          </div>
        </div></div>}

        {modal === "add" && <div className="absolute inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-neutral-900/60" onClick={() => setModal("")}/><form onSubmit={addNewMenu} className="relative bg-white w-full rounded-3xl p-5 space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-black text-xl">Tambah Menu</h3><button type="button" onClick={() => setModal("")} className="p-2 bg-neutral-100 rounded-full"><X size={18}/></button></div>
          <label className="block text-xs font-bold">Nama Menu<input required value={newMenu.name} onChange={(e) => setNewMenu({...newMenu,name:e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm font-normal" placeholder="Nama menu"/></label>
          <label className="block text-xs font-bold">Kategori<select value={newMenu.category} onChange={(e) => setNewMenu({...newMenu,category:e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm">{CATEGORIES.filter(c => c !== "Semua").map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="block text-xs font-bold">Harga Jual (Rp)<input required inputMode="numeric" value={newMenu.price ? Number(digits(newMenu.price)).toLocaleString("id-ID") : ""} onChange={(e) => setNewMenu({...newMenu,price:digits(e.target.value)})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm" placeholder="0"/></label>
          <label className="block text-xs font-bold">Modal / HPP per porsi (Rp)<input inputMode="numeric" value={newMenu.cost ? Number(digits(newMenu.cost)).toLocaleString("id-ID") : ""} onChange={(e) => setNewMenu({...newMenu,cost:digits(e.target.value)})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm" placeholder="Isi agar laba terhitung"/></label>
          <button className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold">Simpan Menu</button>
        </form></div>}

        {modal === "manage" && <div className="absolute inset-0 z-50 flex flex-col justify-end"><div className="absolute inset-0 bg-neutral-900/60" onClick={() => setModal("")}/><div className="relative bg-white rounded-t-3xl max-h-[88%] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center"><div><h3 className="font-black text-xl">Kelola Menu</h3><p className="text-xs text-neutral-500">Ubah harga jual dan modal/HPP</p></div><button onClick={() => setModal("")} className="p-2 bg-neutral-100 rounded-full"><X size={18}/></button></div>
          <div className="overflow-y-auto p-4 space-y-2">{menu.map((m) => <div key={m.id} className="bg-neutral-50 rounded-xl p-3 flex items-center justify-between gap-2"><div className="min-w-0"><p className="font-bold text-sm truncate">{m.name}</p><p className="text-[10px] text-neutral-500">{m.category} • Jual {money(m.price)} • HPP {money(m.cost)}</p></div><div className="flex gap-1 shrink-0"><button onClick={() => {setEditingMenu({...m,price:String(m.price),cost:String(m.cost)});setModal("edit");}} className="p-2 bg-white border rounded-lg text-blue-600"><Pencil size={16}/></button><button onClick={() => removeMenu(m.id)} className="p-2 bg-white border rounded-lg text-red-500"><Trash2 size={16}/></button></div></div>)}</div>
          <div className="p-4 border-t"><button onClick={() => {setModal("add");}} className="w-full bg-red-600 text-white rounded-xl py-3 font-bold">+ Tambah Menu Baru</button></div>
        </div></div>}

        {modal === "edit" && editingMenu && <div className="absolute inset-0 z-[60] flex items-center justify-center p-4"><div className="absolute inset-0 bg-neutral-900/60" onClick={() => {setEditingMenu(null);setModal("manage");}}/><form onSubmit={saveMenuEdit} className="relative bg-white w-full rounded-3xl p-5 space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-black text-xl">Edit Menu</h3><button type="button" onClick={() => {setEditingMenu(null);setModal("manage");}} className="p-2 bg-neutral-100 rounded-full"><X size={18}/></button></div>
          <label className="block text-xs font-bold">Nama<input required value={editingMenu.name} onChange={(e) => setEditingMenu({...editingMenu,name:e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm font-normal"/></label>
          <label className="block text-xs font-bold">Kategori<select value={editingMenu.category} onChange={(e) => setEditingMenu({...editingMenu,category:e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm">{CATEGORIES.filter(c => c !== "Semua").map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="block text-xs font-bold">Harga Jual<input required inputMode="numeric" value={Number(digits(editingMenu.price)).toLocaleString("id-ID")} onChange={(e) => setEditingMenu({...editingMenu,price:digits(e.target.value)})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm"/></label>
          <label className="block text-xs font-bold">Modal / HPP<input inputMode="numeric" value={Number(digits(editingMenu.cost)).toLocaleString("id-ID")} onChange={(e) => setEditingMenu({...editingMenu,cost:digits(e.target.value)})} className="w-full mt-1 p-3 bg-neutral-50 border rounded-xl text-sm"/></label>
          <button className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold">Simpan Perubahan</button>
        </form></div>}

        {receipt && <div className="absolute inset-0 z-[70] flex items-center justify-center p-4"><div className="absolute inset-0 bg-neutral-900/60" onClick={() => setReceipt(null)}/><div className="relative bg-white w-full rounded-3xl p-5 max-h-[85%] overflow-y-auto">
          <div className="text-center mb-4"><div className="w-12 h-12 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-2"><CheckCircle2 size={27}/></div><h3 className="font-black text-xl">Detail Transaksi</h3><p className="text-[10px] text-neutral-400">{receipt.id}</p><p className="text-xs text-neutral-500">{new Date(receipt.date).toLocaleString("id-ID")}</p></div>
          <div className="border-y py-3 space-y-2">{receipt.items.map((r,i) => <div key={i} className="flex justify-between text-sm"><span>{r.name}{r.level ? ` (Level ${r.level})` : ""} × {r.qty}</span><b>{money(r.price*r.qty)}</b></div>)}</div>
          <div className="space-y-2 py-3 text-sm"><div className="flex justify-between font-black"><span>Total</span><span>{money(receipt.total)}</span></div><div className="flex justify-between"><span>Tunai</span><span>{money(receipt.cash)}</span></div><div className="flex justify-between text-green-600 font-bold"><span>Kembalian</span><span>{money(receipt.change)}</span></div></div>
          <button onClick={() => setReceipt(null)} className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold mt-2">Tutup</button>
        </div></div>}

        {toast && <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[80] bg-neutral-900 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold whitespace-nowrap"><CheckCircle2 size={17} className="text-green-400"/>{toast}</div>}
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </div>
    </div>
  );
}
