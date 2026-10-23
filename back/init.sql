-- =============================================================
-- Nova 商城数据库初始化脚本 (MySQL 8.x)
-- 使用方式：mysql -u root -p < back/init.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS nova_shop
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nova_shop;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

-- -------------------------------------------------------------
-- 商品表
-- -------------------------------------------------------------
CREATE TABLE products (
  id          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  name        VARCHAR(128)   NOT NULL COMMENT '商品名称',
  price       DECIMAL(10, 2) NOT NULL COMMENT '售价（元）',
  category    VARCHAR(32)    NOT NULL COMMENT '分类：耳机/键盘/台灯/鼠标/音箱/显示器/配件',
  image_url   VARCHAR(512)   DEFAULT '' COMMENT '商品主图地址',
  description TEXT           COMMENT '商品描述',
  stock       INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '库存数量',
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上架时间',
  PRIMARY KEY (id),
  KEY idx_category (category),
  KEY idx_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='商品表';

-- -------------------------------------------------------------
-- 订单表
-- -------------------------------------------------------------
CREATE TABLE orders (
  id               INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  order_no         VARCHAR(32)    NOT NULL COMMENT '订单号（唯一）',
  total_price      DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
  status           VARCHAR(16)    NOT NULL DEFAULT 'pending' COMMENT '状态：pending/paid/shipped/completed/cancelled',
  receiver_name    VARCHAR(64)    COMMENT '收货人姓名',
  receiver_phone   VARCHAR(32)    COMMENT '收货人电话',
  receiver_address VARCHAR(255)   COMMENT '收货地址',
  created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='订单表';

-- -------------------------------------------------------------
-- 预置商品数据（20 条，7 个分类，价格带 89 ~ 1899 元）
-- 图片使用 picsum 占位图，前端有本地兜底，可后续替换为真实商品图
-- -------------------------------------------------------------
INSERT INTO products (name, price, category, image_url, description, stock) VALUES
('NovaBeat Q45 头戴式主动降噪耳机', 899.00, '耳机', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', '自适应主动降噪，45 小时超长续航，佩戴一整天也舒适。', 120),
('NovaBeat Air 真无线降噪耳机', 399.00, '耳机', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80', '蓝牙 5.4 低延迟连接，入耳检测，通话三麦克风降噪。', 200),
('NovaBeat Lite 半入耳蓝牙耳机', 129.00, '耳机', 'https://picsum.photos/seed/nova-03/600/600', '3.8g 轻若无物，13mm 大动圈，学生党入门首选。', 350),
('NovaBeat Studio 有线监听耳机', 699.00, '耳机', 'https://picsum.photos/seed/nova-04/600/600', '40mm 生物纤维振膜，可换线设计，录音室级解析力。', 80),
('NovaKey K87 机械键盘（Gasket 结构）', 349.00, '键盘', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80', 'Gasket 全键无冲，五层填充消音，麻将音手感。', 150),
('NovaKey K104 全尺寸热插拔机械键盘', 499.00, '键盘', 'https://picsum.photos/seed/nova-06/600/600', '全键轴座热插拔，PBT 二色键帽，支持 QMK/VIA 改键。', 90),
('NovaKey S61 便携矮轴键盘', 259.00, '键盘', 'https://picsum.photos/seed/nova-07/600/600', '超薄矮轴设计，双模连接，通勤办公两不误。', 180),
('NovaKey 75 三模铝机身机械键盘', 899.00, '键盘', 'https://picsum.photos/seed/nova-08/600/600', 'CNC 全铝机身，三模连接，gasket 结构，客制化入门首选。', 60),
('NovaLight L1 AA 级护眼台灯', 199.00, '台灯', 'https://images.unsplash.com/photo-1774647001992-b711ae72f83d?auto=format&fit=crop&w=600&q=80', '国 AA 级照度，无频闪无蓝光危害，三档色温可调。', 220),
('NovaLight L2 智能屏幕挂灯', 299.00, '台灯', 'https://picsum.photos/seed/nova-10/600/600', '非对称光源不晃眼，旋钮无极调光，桌面空间拯救者。', 160),
('NovaLight L3 全光谱护眼台灯', 499.00, '台灯', 'https://picsum.photos/seed/nova-11/600/600', '全光谱灯珠，Ra98 显色指数，自动感光随环境补光。', 110),
('NovaGlide M1 无线静音鼠标', 89.00, '鼠标', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80', '静音微动不扰人，18 个月超长电池续航，办公首选。', 400),
('NovaGlide M3 三模游戏鼠标', 199.00, '鼠标', 'https://picsum.photos/seed/nova-13/600/600', 'PAW3395 传感器，26000DPI，轻量化人体工学设计。', 240),
('NovaGlide M5 轻量化电竞鼠标', 399.00, '鼠标', 'https://picsum.photos/seed/nova-14/600/600', '49g 超轻机身，8K 回报率，电竞级无线传输。', 130),
('NovaSound S1 便携蓝牙音箱', 159.00, '音箱', 'https://picsum.photos/seed/nova-15/600/600', 'IPX7 防水，20 小时续航，户外露营好搭档。', 280),
('NovaSound S3 桌面 2.0 HiFi 音箱', 499.00, '音箱', 'https://picsum.photos/seed/nova-16/600/600', '3.5 英寸中低音单元 + 丝膜高音，USB 声卡一线连。', 100),
('NovaSound S5 高保真书架音箱', 1299.00, '音箱', 'https://picsum.photos/seed/nova-17/600/600', '两分频后导向设计，木质箱体，客厅影音一步到位。', 45),
('NovaView V27 27 英寸 4K 显示器', 1899.00, '显示器', 'https://images.unsplash.com/photo-1666771410140-0573b232426e?auto=format&fit=crop&w=600&q=80', '27 英寸 4K IPS 面板，99% sRGB，Type-C 65W 反向供电。', 75),
('NovaStand A1 铝合金笔记本支架', 129.00, '配件', 'https://picsum.photos/seed/nova-19/600/600', '航空铝材一体成型，镂空散热，改善坐姿保护颈椎。', 500),
('NovaStand D1 显示器气压悬停支架', 349.00, '配件', 'https://picsum.photos/seed/nova-20/600/600', '气压弹簧自由悬停，支持 17-32 英寸显示器，释放桌面空间。', 190);
