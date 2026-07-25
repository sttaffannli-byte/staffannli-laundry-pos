import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, ShoppingCart, Globe2, Package, Users, BarChart3,
  Settings, Plus, Minus, Trash2, Search, CheckCircle2, Clock3,
  Truck, WashingMachine, WalletCards, ReceiptText, Menu, X
} from 'lucide-react';
import './styles.css';

const SERVICES = [
  { id: 1, name: 'Wash & Dry', unit: 'kg', price: 65, icon: '🧺' },
  { id: 2, name: 'Wash Only', unit: 'kg', price: 40, icon: '🫧' },
  { id: 3, name: 'Dry Only', unit: 'kg', price: 35, icon: '♨️' },
  { id: 4, name: 'Ironing', unit: 'pc', price: 25, icon: '👔' },
  { id: 5, name: 'Comforter', unit: 'pc', price: 250, icon: '🛏️' },
  { id: 6, name: 'Curtain', unit: 'panel', price: 180, icon: '🪟' },
  { id: 7, name: 'Shoes Cleaning', unit: 'pair', price: 350, icon: '👟' },
  { id: 8, name: 'Rush Service', unit: 'order', price: 120, icon: '⚡' }
];

const seedOrders = [
  { id: 'LP-1001', customer: 'Maria Santos', phone: '09171234567', total: 390, status: 'Washing', payment: 'GCash', created: 'Today, 8:15 AM' },
  { id: 'LP-1002', customer: 'John Reyes', phone: '09182345678', total: 525, status: 'Ready', payment: 'Cash', created: 'Today, 8:40 AM' },
  { id: 'LP-1003', customer: 'Ana Cruz', phone: '09193456789', total: 250, status: 'Received', payment: 'Unpaid', created: 'Today, 9:05 AM' }
];

const peso = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

function App() {
  const [view, setView] = useState('pos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('laundry-orders') || 'null') || seedOrders);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [payment, setPayment] = useState('Cash');
  const [reference, setReference] = useState('');
  const [search, setSearch] = useState('');

  const saveOrders = (next) => {
    setOrders(next);
    localStorage.setItem('laundry-orders', JSON.stringify(next));
  };

  const addService = (service) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === service.id);
      if (found) return prev.map((x) => x.id === service.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...service, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) => prev.map((x) => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  };

  const subtotal = useMemo(() => cart.reduce((sum, x) => sum + x.price * x.qty, 0), [cart]);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const completeSale = () => {
    if (!customer.name || !customer.phone || cart.length === 0) {
      alert('Please enter customer name, phone, and at least one service.');
      return;
    }
    const id = `LP-${1000 + orders.length + 1}`;
    const order = {
      id, customer: customer.name, phone: customer.phone, total,
      status: 'Received', payment, reference, created: new Date().toLocaleString()
    };
    saveOrders([order, ...orders]);
    setCart([]); setCustomer({ name: '', phone: '' }); setReference('');
    alert(`Order ${id} saved successfully.`);
  };

  const nav = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['pos', ShoppingCart, 'Cashier POS'],
    ['website', Globe2, 'Online Website'],
    ['orders', Package, 'Orders'],
    ['customers', Users, 'Customers'],
    ['reports', BarChart3, 'Reports'],
    ['settings', Settings, 'Settings']
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark">LP</div><div><strong>LaundryPro</strong><span>POS + Online</span></div></div>
      <button className="mobile-close" onClick={() => setMenuOpen(false)}><X /></button>
      <nav>{nav.map(([id, Icon, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => {setView(id);setMenuOpen(false)}}><Icon size={20}/><span>{label}</span></button>)}</nav>
      <div className="branch-card"><small>ACTIVE BRANCH</small><strong>Main Branch</strong><span>Buting, Pasig City</span></div>
    </aside>

    <main>
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMenuOpen(true)}><Menu /></button>
        <div><h1>{nav.find(x => x[0] === view)?.[2]}</h1><p>Manage your laundry business in one place</p></div>
        <div className="cashier"><div className="avatar">AM</div><div><strong>Admin</strong><span>Owner Account</span></div></div>
      </header>

      {view === 'pos' && <POS services={SERVICES} cart={cart} addService={addService} changeQty={changeQty} setCart={setCart} subtotal={subtotal} total={total} customer={customer} setCustomer={setCustomer} payment={payment} setPayment={setPayment} reference={reference} setReference={setReference} completeSale={completeSale}/>} 
      {view === 'dashboard' && <Dashboard orders={orders}/>} 
      {view === 'orders' && <Orders orders={orders} saveOrders={saveOrders} search={search} setSearch={setSearch}/>} 
      {view === 'website' && <Website services={SERVICES}/>} 
      {view === 'customers' && <Customers orders={orders}/>} 
      {view === 'reports' && <Reports orders={orders}/>} 
      {view === 'settings' && <SettingsPage/>}
    </main>
  </div>;
}

function POS({services,cart,addService,changeQty,setCart,subtotal,total,customer,setCustomer,payment,setPayment,reference,setReference,completeSale}) {
  return <section className="pos-layout">
    <div className="panel service-panel">
      <div className="section-head"><div><h2>Select Service</h2><p>Tap a service to add it to the order</p></div><div className="search"><Search size={18}/><input placeholder="Search service"/></div></div>
      <div className="service-grid">{services.map(s => <button className="service-card" key={s.id} onClick={() => addService(s)}><span className="service-icon">{s.icon}</span><strong>{s.name}</strong><span>{peso(s.price)} / {s.unit}</span></button>)}</div>
    </div>
    <div className="panel order-panel">
      <div className="section-head"><div><h2>New Order</h2><p>Customer and payment details</p></div><ReceiptText/></div>
      <div className="field-row"><label>Customer Name<input value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Enter full name"/></label><label>Mobile Number<input value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="09XXXXXXXXX"/></label></div>
      <div className="cart-list">{cart.length===0?<div className="empty"><ShoppingCart/><strong>No services yet</strong><span>Select a service from the left.</span></div>:cart.map(item=><div className="cart-item" key={item.id}><div><strong>{item.name}</strong><span>{peso(item.price)} / {item.unit}</span></div><div className="qty"><button onClick={()=>changeQty(item.id,-1)}><Minus size={16}/></button><b>{item.qty}</b><button onClick={()=>changeQty(item.id,1)}><Plus size={16}/></button></div><strong>{peso(item.price*item.qty)}</strong><button className="trash" onClick={()=>setCart(cart.filter(x=>x.id!==item.id))}><Trash2 size={18}/></button></div>)}</div>
      <div className="totals"><div><span>Subtotal</span><b>{peso(subtotal)}</b></div><div><span>Delivery</span><b>Free</b></div><div className="grand"><span>Total</span><b>{peso(total)}</b></div></div>
      <label>Payment Method<div className="payment-grid">{['Cash','GCash','Maya','Bank Transfer'].map(p=><button key={p} className={payment===p?'selected':''} onClick={()=>setPayment(p)}><WalletCards size={18}/>{p}</button>)}</div></label>
      {payment!=='Cash'&&<label>Payment Reference<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Enter reference number"/></label>}
      <button className="primary full" onClick={completeSale}><CheckCircle2/>Complete Order</button>
    </div>
  </section>
}

function Dashboard({orders}) {
  const sales = orders.reduce((s,o)=>s+o.total,0);
  const ready = orders.filter(o=>o.status==='Ready').length;
  const active = orders.filter(o=>!['Released','Cancelled'].includes(o.status)).length;
  return <section className="content"><div className="kpi-grid"><Kpi title="Today's Sales" value={peso(sales)} icon={<WalletCards/>}/><Kpi title="Active Orders" value={active} icon={<WashingMachine/>}/><Kpi title="Ready for Pickup" value={ready} icon={<CheckCircle2/>}/><Kpi title="Online Bookings" value="12" icon={<Globe2/>}/></div><div className="panel"><div className="section-head"><div><h2>Recent Orders</h2><p>Latest activity across all channels</p></div></div><OrderTable orders={orders}/></div></section>
}
function Kpi({title,value,icon}){return <div className="kpi"><div>{icon}</div><span>{title}</span><strong>{value}</strong><small>Updated live</small></div>}

const statuses=['Received','Washing','Drying','Folding','Ready','Released'];
function Orders({orders,saveOrders,search,setSearch}) {
  const filtered=orders.filter(o=>`${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(search.toLowerCase()));
  const update=(id,status)=>saveOrders(orders.map(o=>o.id===id?{...o,status}:o));
  return <section className="content"><div className="panel"><div className="section-head"><div><h2>Order Management</h2><p>Update laundry progress and payment status</p></div><div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order or customer"/></div></div><div className="order-cards">{filtered.map(o=><div className="order-card" key={o.id}><div className="order-title"><div><strong>{o.id}</strong><span>{o.created}</span></div><StatusBadge status={o.status}/></div><h3>{o.customer}</h3><p>{o.phone} · {o.payment}</p><div className="order-total">{peso(o.total)}</div><select value={o.status} onChange={e=>update(o.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>)}</div></div></section>
}
function OrderTable({orders}){return <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.id}</strong><small>{o.created}</small></td><td>{o.customer}<small>{o.phone}</small></td><td><StatusBadge status={o.status}/></td><td>{o.payment}</td><td><strong>{peso(o.total)}</strong></td></tr>)}</tbody></table></div>}
function StatusBadge({status}){return <span className={`badge ${status.toLowerCase().replaceAll(' ','-')}`}>{status}</span>}

function Website({services}){return <section className="website-preview"><div className="web-nav"><div className="brand"><div className="brand-mark">LP</div><strong>LaundryPro</strong></div><div>Home &nbsp; Services &nbsp; Track Order &nbsp; Contact</div><button>Book Now</button></div><div className="hero"><div><span className="eyebrow">Pickup • Wash • Deliver</span><h2>Fresh laundry,<br/>without the hassle.</h2><p>Book your laundry online and track every step from pickup to delivery.</p><div className="hero-actions"><button className="primary">Book a Pickup</button><button className="secondary">Track Order</button></div></div><div className="hero-art">🧺<span>Clean clothes.<br/>More free time.</span></div></div><div className="web-services"><div className="section-head"><div><h2>Our Services</h2><p>Professional care for every type of laundry.</p></div></div><div className="service-grid">{services.slice(0,4).map(s=><div className="service-card" key={s.id}><span className="service-icon">{s.icon}</span><strong>{s.name}</strong><span>From {peso(s.price)}</span></div>)}</div></div><div className="booking-demo"><div><h2>Online Booking Form</h2><p>Customers can schedule pickup, enter an address, choose services, and pay online.</p></div><div className="field-row"><label>Name<input placeholder="Customer name"/></label><label>Mobile<input placeholder="09XXXXXXXXX"/></label></div><label>Pickup Address<input placeholder="House number, street, barangay, city"/></label><div className="field-row"><label>Pickup Date<input type="date"/></label><label>Time<input type="time"/></label></div><button className="primary full"><Truck/>Schedule Pickup</button></div></section>}

function Customers({orders}){const map={};orders.forEach(o=>{map[o.phone]=map[o.phone]||{name:o.customer,phone:o.phone,orders:0,spent:0};map[o.phone].orders++;map[o.phone].spent+=o.total});return <section className="content"><div className="panel"><div className="section-head"><div><h2>Customer Database</h2><p>Order frequency and lifetime spend</p></div></div><div className="customer-grid">{Object.values(map).map(c=><div className="customer-card" key={c.phone}><div className="avatar">{c.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><strong>{c.name}</strong><span>{c.phone}</span></div><div><b>{c.orders}</b><small>Orders</small></div><div><b>{peso(c.spent)}</b><small>Spent</small></div></div>)}</div></div></section>}
function Reports({orders}){const total=orders.reduce((s,o)=>s+o.total,0);return <section className="content"><div className="kpi-grid"><Kpi title="Gross Sales" value={peso(total)} icon={<BarChart3/>}/><Kpi title="Average Order" value={peso(orders.length?total/orders.length:0)} icon={<ReceiptText/>}/><Kpi title="Completed" value={orders.filter(o=>o.status==='Released').length} icon={<CheckCircle2/>}/><Kpi title="Pending" value={orders.filter(o=>o.status!=='Released').length} icon={<Clock3/>}/></div><div className="panel report-placeholder"><BarChart3 size={64}/><h2>Sales & Expense Reports</h2><p>Daily, weekly, monthly, employee, inventory, tax, and branch reports can be connected to a cloud database.</p><button className="primary">Export Report</button></div></section>}
function SettingsPage(){return <section className="content"><div className="panel settings-grid"><div><h2>Business Settings</h2><p>Update your business name, branch, tax, receipt, and online booking details.</p></div>{['Business Name','Branch Address','Contact Number','Receipt Footer','Minimum Kilos','Delivery Fee'].map(x=><label key={x}>{x}<input placeholder={x}/></label>)}<button className="primary">Save Settings</button></div></section>}

createRoot(document.getElementById('root')).render(<App/>);
