const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const midtransClient = require('midtrans-client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ownerProducts = {
  1: { name: 'Americano', price: 18000 },
  2: { name: 'Cafe Latte', price: 25000 },
  3: { name: 'Cappuccino', price: 27000 },
  4: { name: 'Caramel Macchiato', price: 32000 },
  5: { name: 'Mocha Latte', price: 30000 },
  6: { name: 'Matcha Latte', price: 28000 },
  7: { name: 'Chocolate Cream', price: 25000 },
  8: { name: 'Strawberry Milk', price: 24000 },
  9: { name: 'Vanilla Cream', price: 26000 },
  10: { name: 'Lemon Tea', price: 18000 },
  11: { name: 'Chicken Rice Bowl', price: 35000 },
  12: { name: 'Beef Black Pepper', price: 45000 },
  13: { name: 'Chicken Burger', price: 38000 },
  14: { name: 'French Fries', price: 20000 },
  15: { name: 'Premium Pizza', price: 50000 },
  16: { name: 'Chocolate Cake', price: 25000 },
  17: { name: 'Cheesecake', price: 35000 },
  18: { name: 'Tiramisu', price: 35000 },
  19: { name: 'Golden Donut', price: 15000 },
  20: { name: 'Waffle Cream', price: 30000 }
};

app.use(cors());
app.use(express.json());

if (!process.env.MIDTRANS_SERVER_KEY) {
  console.warn('MIDTRANS_SERVER_KEY belum diisi di file .env');
}

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend Kedai Senja berjalan.' });
});

app.post('/api/create-transaction', async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ success: false, message: 'Nama dan nomor WhatsApp wajib diisi.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang masih kosong.' });
    }

    let grossAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = ownerProducts[item.id];
      const quantity = Number(item.quantity);
      if (!product) return res.status(400).json({ success: false, message: `Produk dengan ID ${item.id} tidak ditemukan.` });
      if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Jumlah produk tidak valid.' });
      grossAmount += product.price * quantity;
      orderItems.push({ id: String(item.id), price: product.price, quantity, name: product.name });
    }

    const orderId = `SENJA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      item_details: orderItems,
      customer_details: { first_name: customer.name, phone: customer.phone }
    });

    res.json({ success: true, orderId, token: transaction.token, redirect_url: transaction.redirect_url, amount: grossAmount });
  } catch (error) {
    console.error('MIDTRANS ERROR:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi.' });
  }
});

app.get('/api/payment-status/:orderId', async (req, res) => {
  try {
    const status = await snap.transaction.status(req.params.orderId);
    res.json({ success: true, orderId: req.params.orderId, status: status.transaction_status, fraudStatus: status.fraud_status || null, paymentType: status.payment_type || null });
  } catch (error) {
    console.error('STATUS ERROR:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil status pembayaran.' });
  }
});

app.post('/api/midtrans-notification', (req, res) => {
  const notification = req.body;
  console.log('MIDTRANS NOTIFICATION', { orderId: notification.order_id, status: notification.transaction_status, payment: notification.payment_type });
  res.status(200).json({ success: true, message: 'Notification received' });
});

app.listen(PORT, () => {
  console.log(`KEDAI SENJA BACKEND berjalan di http://localhost:${PORT}`);
});
