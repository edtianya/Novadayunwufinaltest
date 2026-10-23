-- =============================================================
-- Nova 商城 · SQLite 初始化脚本
-- 服务启动时由 db.js 自动执行。
-- 使用 INSERT OR IGNORE：重复启动不会重复插入商品，也不会覆盖已有库存和订单。
-- =============================================================

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  price       REAL    NOT NULL,
  category    TEXT    NOT NULL,
  image_url   TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  stock       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no         TEXT    NOT NULL UNIQUE,
  total_price      REAL    NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'pending',
  receiver_name    TEXT,
  receiver_phone   TEXT,
  receiver_address TEXT,
  created_at       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 预置商品数据（20 条，7 个分类，价格带 89 ~ 1899 元）
-- 图片全部来自 Unsplash / Pexels（免费可商用，直链 CDN）
-- -------------------------------------------------------------
INSERT OR IGNORE INTO products (id, name, price, category, image_url, description, stock) VALUES
(1,  'NovaBeat Q45 头戴式主动降噪耳机', 899.00, '耳机', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', 'Q45 采用双馈混合主动降噪架构，最高可消除 42dB 环境噪声，通勤、飞行或开放办公室都能瞬间安静下来；40mm 镀铍复合振膜兼顾扎实低频与通透人声。
• 45 小时续航，10 分钟快充可听 5 小时
• 蛋白皮耳罩 + 280g 轻量头梁，久戴不夹头
• 双设备同时连接，摘下自动暂停
• 支持 3.5mm 有线模式，没电也能继续听', 120),
(2,  'NovaBeat Air 真无线降噪耳机', 399.00, '耳机', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80', 'Air 搭载 11mm 动圈单元与蓝牙 5.4 芯片，连接稳定、延迟低至 60ms，追剧和手游都能保持音画同步；入耳检测让音乐随佩戴状态自动暂停与续播。
• 三麦克风通话降噪，嘈杂街头也能清晰通话
• 单次 8 小时、配合充电盒共 32 小时续航
• IP54 防尘防水，通勤轻运动都安心
• 支持无线充电与单耳独立使用', 200),
(3,  'NovaBeat Lite 半入耳蓝牙耳机', 129.00, '耳机', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=80', 'Lite 以 3.8g 单耳重量打造近乎无感的佩戴体验，半入耳结构不压耳道，长时间会议或网课更轻松；13mm 大动圈带来超出价位的声音厚度。
• 蓝牙 5.3 稳定连接，低延迟模式适配视频
• 配合充电盒续航约 28 小时
• Type-C 正反盲插，单耳可独立使用
• 触控切歌接听，学生党入门首选', 350),
(4,  'NovaBeat Studio 有线监听耳机', 699.00, '耳机', 'https://images.unsplash.com/photo-1580943863540-dda56dd7a430?auto=format&fit=crop&w=600&q=80', 'Studio 面向录音、混音与细节控，40mm 生物纤维振膜提供快速瞬态与克制染色，封闭式耳罩具备良好隔音；可换线设计方便接入声卡与监听设备。
• 附赠 3 米弹簧线与 3.5mm / 6.35mm 转接头
• 32Ω 低阻抗，手机和笔记本也能轻松驱动
• 金属头梁 + 可旋转耳罩，支持单耳监听
• 录音室级解析力，兼顾听歌与创作', 80),
(5,  'NovaKey K87 机械键盘（Gasket 结构）', 349.00, '键盘', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80', 'K87 采用 Gasket 结构与五层消音填充，按键触底柔软有弹性，敲击声音干净集中；87 键配列在游戏与办公之间取得平衡。
• 全键无冲 + 1000Hz 回报率
• 有线 / 2.4G 双模连接，即插即用
• 全键热插拔，兼容三脚与五脚轴体
• PBT 二色键帽耐磨不打油，附赠拔键器', 150),
(6,  'NovaKey K104 全尺寸热插拔机械键盘', 499.00, '键盘', 'https://images.pexels.com/photos/9020272/pexels-photo-9020272.jpeg?auto=compress&cs=tinysrgb&w=600', 'K104 为需要数字小键盘的用户准备全尺寸 104 键配列，财务录入与游戏快捷键都更顺手；全键热插拔让换轴无需焊接。
• 支持 QMK / VIA 开源改键与宏编程
• 有线 / 蓝牙 / 2.4G 三模连接
• PBT 二色键帽，字符清晰耐磨
• 板载配置存储，换电脑也能保留设置', 90),
(7,  'NovaKey S61 便携矮轴键盘', 259.00, '键盘', 'https://images.unsplash.com/photo-1760708551859-6559dc9640b8?auto=format&fit=crop&w=600&q=80', 'S61 采用 61 键紧凑配列与矮轴结构，机身厚度仅 22mm，放进背包几乎不占空间；矮红轴触发轻快、声音克制，适合通勤与咖啡厅办公。
• 蓝牙 5.1 + 有线双模，三台设备快速切换
• Windows / macOS 键位自动适配
• 铝合金定位板，白色背光多档可调
• 2000mAh 电池，关灯续航约 60 小时', 180),
(8,  'NovaKey 75 三模铝机身机械键盘', 899.00, '键盘', 'https://images.unsplash.com/photo-1632079003110-d694908500da?auto=format&fit=crop&w=600&q=80', 'NovaKey 75 采用 CNC 全铝机身与阳极氧化工艺，边角经过多道打磨，质感扎实且不易留指纹；75% 配列保留方向键，同时节省桌面空间。
• Gasket 结构 + PC 定位板，手感柔和
• 蓝牙 / 2.4G / 有线三模，记忆三台设备
• 全键热插拔、南向 RGB 与多媒体旋钮
• 附赠增补键帽与拔轴工具，开箱即玩', 60),
(9,  'NovaLight L1 AA 级护眼台灯', 199.00, '台灯', 'https://images.unsplash.com/photo-1774647001992-b711ae72f83d?auto=format&fit=crop&w=600&q=80', 'L1 通过国家 AA 级照度认证，中心照度可达 1000lux，轻松覆盖 1.2 米宽桌面；无频闪驱动与 RG0 无蓝光危害设计，长时间使用眼睛不易酸涩。
• 3000K / 4000K / 5000K 三档色温
• 无级调光 + 触控面板，操作直观
• 双轴转轴支持灯头多角度俯仰
• 45 分钟定时休息提醒，养成健康用眼习惯', 220),
(10, 'NovaLight L2 智能屏幕挂灯', 299.00, '台灯', 'https://images.unsplash.com/photo-1708513427809-728a7913fc9f?auto=format&fit=crop&w=600&q=80', 'L2 采用非对称光学设计，光线只照桌面、不直射屏幕，有效避免反光与眩光；磁吸夹具兼容 1–5cm 厚度屏幕，不占桌面空间。
• 旋钮无极调光与色温切换
• USB 供电即插即用，无需驱动
• Ra95 高显色，画面与纸质材料颜色更真实
• 断电记忆，下次通电恢复上次亮度', 160),
(11, 'NovaLight L3 全光谱护眼台灯', 499.00, '台灯', 'https://images.unsplash.com/photo-1519219788971-8d9797e0928e?auto=format&fit=crop&w=600&q=80', 'L3 采用全光谱 LED 灯珠，光谱连续度接近自然光，Ra98 显色指数让书本插画与设计稿颜色更准确；国 AA 级照度配合无频闪、RG0 无蓝光设计。
• 环境光传感器自动补光
• 2700K–6500K 色温，暖光助眠到冷光专注
• 铝合金双轴灯臂，调节范围更大
• 钢化玻璃底座 + 触控面板，稳定有质感', 110),
(12, 'NovaGlide M1 无线静音鼠标', 89.00, '鼠标', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80', 'M1 采用静音微动与橡胶滚轮，按键声音比普通鼠标降低约 90%，在图书馆、宿舍或深夜办公都不会打扰他人；2.4G 无线连接即插即用。
• 人体工学曲线，左右对称适合不同握法
• 三档 DPI 可调，办公浏览都顺手
• 一节 AA 电池续航约 18 个月
• 智能省电 + 独立开关，减少换电池烦恼', 400),
(13, 'NovaGlide M3 三模游戏鼠标', 199.00, '鼠标', 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=600&q=80', 'M3 搭载 PAW3395 旗舰光学传感器，最高 26000DPI 与 650IPS 追踪速度，FPS 拉枪和 MOBA 快速转身都能稳定跟手；三模连接覆盖办公与游戏。
• 有线 / 2.4G / 蓝牙自由切换
• 8000 万次寿命微动，侧键可自定义
• 轻量化人体工学外形，久握不累
• 500mAh 电池，2.4G 模式续航约 70 小时', 240),
(14, 'NovaGlide M5 轻量化电竞鼠标', 399.00, '鼠标', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', 'M5 将重量压缩到 49g，配合大面积 PTFE 脚贴，移动轻快顺滑；8K 回报率把输入延迟降至 0.125ms，快速甩枪也能精准落点。
• PAW3395 传感器，最高 26000DPI
• 镁合金骨架 + 镂空外壳，减重不减强度
• 2.4G 无线抗干扰，支持边充边用
• 附赠防滑贴与备用脚贴', 130),
(15, 'NovaSound S1 便携蓝牙音箱', 159.00, '音箱', 'https://images.unsplash.com/photo-1507878566509-a0dbe19677a5?auto=format&fit=crop&w=600&q=80', 'S1 支持 IPX7 级防水，可短时间浸入水中，露营、骑行或浴室使用都不用担心雨水泼溅；20 小时续航配合 Type-C 快充，出门一整天也安心。
• 双全频单元 + 被动辐射器，低频超预期
• 蓝牙 5.3，支持 TWS 串联立体声
• 编织挂绳 + 硅胶机身，防滑耐摔
• 重量仅 540g，轻松放进背包侧袋', 280),
(16, 'NovaSound S3 桌面 2.0 HiFi 音箱', 499.00, '音箱', 'https://images.unsplash.com/photo-1609702847389-b8aec1b0b929?auto=format&fit=crop&w=600&q=80', 'S3 采用 3.5 英寸中低音单元与 1 英寸丝膜高音，两分频设计让人声饱满、高频细腻；内置 USB 声卡，一根线即可连接电脑。
• 木质箱体经倒相孔调校，低频不轰头
• 前置旋钮调节音量与高低音
• 耳机输出接口，深夜静音聆听
• 蓝牙 5.0 + 有线双模式，多设备接入', 100),
(17, 'NovaSound S5 高保真书架音箱', 1299.00, '音箱', 'https://images.unsplash.com/photo-1564593822213-66b81f28e631?auto=format&fit=crop&w=600&q=80', 'S5 采用两分频后导向声学结构，5.25 英寸中低音单元搭配丝膜球顶高音，声场开阔、结像清晰；MDF 木质箱体有效抑制共振，适合客厅影音与桌面 HiFi 入门。
• 蓝牙 / 光纤 / 同轴 / RCA 多种输入
• 内置 DSP，音乐 / 电影 / 人声三种模式
• 磁吸网罩 + PVC 木纹贴皮，融入家居
• 附赠遥控器与音箱线，开箱即用', 45),
(18, 'NovaView V27 27 英寸 4K 显示器', 1899.00, '显示器', 'https://images.unsplash.com/photo-1666771410140-0573b232426e?auto=format&fit=crop&w=600&q=80', 'V27 采用 27 英寸 4K IPS 面板，3840×2160 分辨率在修图、剪辑和代码阅读时提供细腻显示；99% sRGB 色域与 ΔE<2 出厂校色，色彩还原准确可靠。
• Type-C 65W 反向供电，一根线连笔记本
• HDMI 2.1 + DP 1.4，主机游戏都方便
• 升降、俯仰、垂直旋转的人体工学支架
• 低蓝光不闪屏，通过 TÜV 认证', 75),
(19, 'NovaStand A1 铝合金笔记本支架', 129.00, '配件', 'https://images.pexels.com/photos/4792717/pexels-photo-4792717.jpeg?auto=compress&cs=tinysrgb&w=600', 'A1 采用航空级铝合金一体成型，CNC 精雕边缘圆润不割手，承重可达 20kg；六档高度调节把屏幕抬升至视线水平，开放式镂空结构加速散热。
• 适配 15–17 英寸笔记本
• 底部硅胶垫防滑且不伤桌面
• 折叠后厚度仅 2cm，方便随身携带
• 银色阳极氧化，桌面质感加分', 500),
(20, 'NovaStand D1 显示器气压悬停支架', 349.00, '配件', 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600', 'D1 采用气压弹簧结构，单手即可完成升降、俯仰与横竖屏切换，17–32 英寸、2–9kg 的显示器都能稳定悬停；夹桌式安装兼容 1–9cm 厚度桌面。
• 铝合金支臂 + 理线槽，桌面更整洁
• VESA 75×75 / 100×100 孔位通用
• 气压调节螺丝按屏幕重量微调阻尼
• 也可选配穿孔安装，释放桌面空间', 190);
