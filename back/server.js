const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 模拟数据：后续替换为 MySQL 查询（数据库脚本见 init.sql）
const mockProducts = [
  { id: 1, name: 'NovaBeat Q45 头戴式主动降噪耳机', price: 899.0, category: '耳机', image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', description: '自适应主动降噪，45 小时超长续航。', stock: 120 },
  { id: 2, name: 'NovaBeat Air 真无线降噪耳机', price: 399.0, category: '耳机', image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80', description: '蓝牙 5.4 低延迟连接，通话三麦克风降噪。', stock: 200 },
  { id: 5, name: 'NovaKey K87 机械键盘（Gasket 结构）', price: 349.0, category: '键盘', image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80', description: 'Gasket 全键无冲，五层填充消音。', stock: 150 },
  { id: 9, name: 'NovaLight L1 AA 级护眼台灯', price: 199.0, category: '台灯', image_url: 'https://images.unsplash.com/photo-1774647001992-b711ae72f83d?auto=format&fit=crop&w=600&q=80', description: '国 AA 级照度，无频闪无蓝光危害。', stock: 220 },
  { id: 12, name: 'NovaGlide M1 无线静音鼠标', price: 89.0, category: '鼠标', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80', description: '静音微动不扰人，18 个月超长电池续航。', stock: 400 },
  { id: 18, name: 'NovaView V27 27 英寸 4K 显示器', price: 1899.0, category: '显示器', image_url: 'https://images.unsplash.com/photo-1666771410140-0573b232426e?auto=format&fit=crop&w=600&q=80', description: '27 英寸 4K IPS 面板，Type-C 65W 反向供电。', stock: 75 }
];

// GET /api/products?keyword=&category=  商品列表
app.get('/api/products', (req, res) => {
  const { keyword = '', category = '' } = req.query;
  let list = mockProducts;
  if (category) {
    list = list.filter((p) => p.category === category);
  }
  if (keyword) {
    list = list.filter((p) => p.name.includes(keyword) || (p.description || '').includes(keyword));
  }
  res.json({ code: 0, data: list });
});

// GET /api/products/:id  商品详情
app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ code: 404, message: '商品不存在' });
  }
  res.json({ code: 0, data: product });
});

// POST /api/orders  创建订单
app.post('/api/orders', (req, res) => {
  const { items, total_price, receiver } = req.body || {};
  // TODO: 校验 items 与收货信息 -> 写库 orders 表 -> 扣减库存
  const orderNo = 'NOVA' + Date.now();
  res.status(201).json({
    code: 0,
    data: {
      order_no: orderNo,
      total_price: total_price || 0,
      status: 'pending',
      receiver: receiver || null
    }
  });
});

app.listen(PORT, () => {
  console.log(`Nova API server running at http://localhost:${PORT}`);
});
