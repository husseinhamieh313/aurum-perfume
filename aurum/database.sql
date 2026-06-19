-- ============================================================
--  AURUM Luxury Perfume — Database Setup
--  Run this once in phpMyAdmin or MySQL CLI
--  mysql -u root -p < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS aurum_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aurum_db;

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(120) NOT NULL,
  email    VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role     ENUM('admin','user') DEFAULT 'user',
  joined   DATE NOT NULL
);

INSERT IGNORE INTO users (id, name, email, password, role, joined)
VALUES (1, 'Admin', 'admin@aurum.com', 'admin123', 'admin', '2024-01-01');

-- ── BRANDS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  country     VARCHAR(80),
  founded     VARCHAR(10),
  logo        TEXT,
  website     TEXT,
  description TEXT
);

INSERT IGNORE INTO brands (id, name, country, founded, logo, website, description) VALUES
(1, 'Maison Noir',       'France',   '1998', '', '', 'Avant-garde Parisian house crafting dark, mysterious oriental fragrances since 1998.'),
(2, 'Rosa Eternis',      'Bulgaria', '2005', '', '', 'Rose-focused atelier sourcing directly from the Valley of Roses in Bulgaria.'),
(3, 'Desert Oud',        'UAE',      '2012', '', '', 'Specialists in Arabian oud and amber compositions. Royalty-grade ingredients only.'),
(4, 'Floral Lab',        'Italy',    '2010', '', '', 'Italian botanical laboratory blending science and nature to create fresh, vibrant florals.'),
-- ↓ New brands from video
(5, 'Dior',              'France',   '1946', '', 'www.dior.com', 'The House of Dior was established on December 16, 1946, by Christian Dior in Paris at 30 Avenue Montaigne. While founded in 1946, the company launched its inaugural, revolutionary "New Look" haute couture collection in 1947, which is often celebrated as the start of the brand''s public fashion influence.'),
(6, 'Jean Paul Gaultier','France',   '1976', '', '', 'Iconic French fashion house known for daring, unconventional fragrances that blend femininity and masculinity in bold compositions.'),
(7, 'Armani',            'Italy',    '1975', '', '', 'Refined Italian elegance translated into sophisticated, timeless fragrances for the modern man and woman.'),
(8, 'Parfums de Marly',  'France',   '2009', '', '', 'Inspired by the 18th-century French royal court, Parfums de Marly crafts opulent, equestrian-influenced fragrances of rare quality.'),
(9, 'Xerjoff',           'Italy',    '2007', '', '', 'Italian niche perfume house celebrated for extraordinary raw materials, handcrafted flacons, and deeply artistic olfactory compositions.'),
(10,'Creed',             'England',  '1760', '', '', 'One of the world''s oldest fragrance houses, Creed has crafted bespoke scents for royalty and heads of state since 1760.');

-- ── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  brand_id      INT,
  name          VARCHAR(180) NOT NULL,
  category      ENUM('men','women') DEFAULT 'men',
  price_tester  DECIMAL(10,2) DEFAULT 0,
  price_50      DECIMAL(10,2) DEFAULT 0,
  price_100     DECIMAL(10,2) DEFAULT 0,
  stock         INT DEFAULT 0,
  description   TEXT,
  notes         VARCHAR(255),
  images        JSON,
  detail_blocks JSON,
  created       DATE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

INSERT IGNORE INTO products (id, brand_id, name, category, price_tester, price_50, price_100, stock, description, notes, images, detail_blocks, created) VALUES
-- ── Original products ──────────────────────────────────────
(1,  1,  'Midnight Oud',    'men',   65,  129, 189, 45, 'A rich oriental fragrance with deep oud wood, amber, and musky tobacco for the modern gentleman.',        'Oud, Amber, Tobacco, Sandalwood',           '[]', '[]', '2024-01-15'),
(2,  2,  'Rose Eternelle',  'women', 50,   99, 145, 62, 'An eternal rose masterpiece layered with Bulgarian rose absolute, soft patchouli and white musks.',        'Bulgarian Rose, Patchouli, White Musk, Ylang Ylang', '[]', '[]', '2024-01-20'),
(3,  1,  'Noir Absolu',     'men',   75,  149, 215, 28, 'A mysterious masculine fougère built on a foundation of dark vetiver, cedarwood, and black pepper.',       'Black Pepper, Vetiver, Cedar, Leather',     '[]', '[]', '2024-02-01'),
(4,  4,  'Fleur Précieuse', 'women', 55,  110, 165, 54, 'A delicate floral bouquet of jasmine sambac, iris and powdery violet wrapped in warm musks.',              'Jasmine, Iris, Violet, Musk',               '[]', '[]', '2024-02-10'),
(5,  3,  'Desert King',     'men',   85,  159, 238, 19, 'Inspired by Arabian nights — raw frankincense, aged oud, and rich amber tell a story of power.',           'Frankincense, Oud, Amber, Saffron',         '[]', '[]', '2024-02-18'),
(6,  4,  'Printemps Doré',  'women', 45,   90, 132, 70, 'A fresh spring awakening — sparkling bergamot, peony, and soft musks celebrating femininity.',             'Bergamot, Peony, Lily, Musk',               '[]', '[]', '2024-02-25'),

-- ── Dior products (brand_id = 5) ───────────────────────────
(7,  5,  'Homme Intense',   'men',   20,  100, 170, 47, 'A rich and sensual interpretation of Dior Homme, deepening the iris accord with leather and vanilla for an intensely masculine signature.', 'Iris, Leather, Vetiver, Vanilla, Amber',    '[]', '[]', '2024-03-01'),
(8,  5,  'Fahrenheit',      'men',   15,   80, 140, 65, 'A daring, iconic masculine fragrance with a unique petrol-floral signature — warm violet and honeysuckle over a leathery woody base.',     'Violet, Honeysuckle, Leather, Vetiver, Sandalwood', '[]', '[]', '2024-03-02'),
(9,  5,  'Sauvage Elixir',  'men',   15,   60, 100,  0, 'The most intense expression of Sauvage — a concentrated elixir of spices, woods, and lavender radiating magnetic strength and depth.',     'Cinnamon, Cardamom, Lavender, Sandalwood, Hawthorn', '[]', '[]', '2024-03-03'),
(10, 5,  'Sauvage',         'men',   15,   60, 100, 27, 'Fresh and powerful, this emblematic fragrance opens with bergamot from Calabria before resting on a base of ambroxan and Reggio Vetiver.',  'Bergamot, Pepper, Ambroxan, Vetiver',       '[]', '[]', '2024-03-04'),
(11, 5,  'J''adore',        'women', 18,   90, 140, 44, 'An absolute femininity — a luminous floral bouquet of ylang-ylang, Damascus rose, and jasmine grandiflorum radiating golden elegance.',     'Ylang Ylang, Damascus Rose, Jasmine, Magnolia', '[]', '[]', '2024-03-05'),
(12, 5,  'Poison Girl',     'women', 22,   80, 135, 77, 'A sweet, daring femininity — bitter orange and grasse rose enveloped in warm sandalwood and vanilla create an addictive, seductive character.', 'Bitter Orange, Rose, Sandalwood, Vanilla',  '[]', '[]', '2024-03-06'),
(13, 5,  'Miss Dior',       'women', 18,   65, 150, 0,  'A floral chypre reborn — the timeless Miss Dior is fresh, romantic, and boldly feminine with grasse rose and white musks over a patchouli base.', 'Grasse Rose, Patchouli, White Musk, Peony', '[]', '[]', '2024-03-07'),

-- ── Armani products (brand_id = 7) ─────────────────────────
(14, 7,  'Armani Code',     'men',   20,   85, 150, 12, 'A seductive and sophisticated oriental fougère blending bergamot, star anise, and orange blossom over a warm tonka bean and leather base.', 'Bergamot, Star Anise, Orange Blossom, Guaiac Wood, Tonka Bean', '[]', '[]', '2024-03-08'),

-- ── Parfums de Marly products (brand_id = 8) ───────────────
(15, 8,  'Althair',         'men',   48,  220, 360,109, 'A bold, aristocratic masculine fragrance — bergamot and spicy pink pepper open to a heart of iris and violet, resting on precious woods and musk.', 'Bergamot, Pink Pepper, Iris, Violet, Sandalwood, Musk', '[]', '[]', '2024-03-09'),
(16, 8,  'Layton',          'men',   48,  220, 360, 67, 'A lavish and velvety fragrance — apple and bergamot sparkle over a floral heart of jasmine, violet, and geranium, settling on creamy sandalwood and vanilla.', 'Apple, Bergamot, Jasmine, Violet, Geranium, Sandalwood, Vanilla', '[]', '[]', '2024-03-10'),
(17, 8,  'Valaya',          'women', 40,  180, 300,  0, 'A majestic floral oriental for women — bergamot and rhubarb open to a heart of rose and peony, softly anchored in musk and woody amber.',             'Bergamot, Rhubarb, Rose, Peony, Musk, Woody Amber',             '[]', '[]', '2024-03-11'),
(18, 8,  'Delina',          'women', 32,  180, 220, 34, 'A feminine masterpiece — Turkish rose, lychee, and rhubarb sparkle over a heart of peony and lily of the valley, resting on soft musks and vanilla.', 'Turkish Rose, Lychee, Rhubarb, Peony, Lily of the Valley, Musk, Vanilla', '[]', '[]', '2024-03-12'),

-- ── Xerjoff products (brand_id = 9) ────────────────────────
(19, 9,  'Naxos',           'men',   48,  220, 360,109, 'An ode to the Mediterranean — honey, lavender, and tobacco fuse with cinnamon and tonka bean to create a warm, intoxicating, luxurious composition.', 'Lavender, Honey, Tobacco, Cinnamon, Tonka Bean, Vanilla',       '[]', '[]', '2024-03-13'),
(20, 9,  'Erba Pura',       'men',   48,  220, 360, 84, 'A solar, luminous fragrance of extraordinary freshness — citrus, coconut, and white musks evoke a carefree summer on a sun-drenched Italian coast.', 'Sicilian Orange, Lemon, Coconut, White Musk, Ambergris',         '[]', '[]', '2024-03-14'),
(21, 9,  'Coro',            'women', 40,  280, 300, 84, 'An opulent floral oriental — bergamot and mandarin open to a heart of rose and jasmine, deepened by precious oud, vanilla, and balsamic musks.',       'Bergamot, Mandarin, Rose, Jasmine, Oud, Vanilla, Musk',         '[]', '[]', '2024-03-15');

-- ── ORDERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id         VARCHAR(20) PRIMARY KEY,
  customer   VARCHAR(180),
  email      VARCHAR(180),
  items      JSON,
  total      DECIMAL(10,2),
  payment    VARCHAR(30),
  status     VARCHAR(30) DEFAULT 'Confirmed',
  address    TEXT,
  created    DATE
);

-- ── MESSAGES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(120),
  email   VARCHAR(180),
  subject VARCHAR(255),
  message TEXT,
  is_read TINYINT(1) DEFAULT 0,
  created DATE
);

-- ── PAYMENT SETTINGS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(80) PRIMARY KEY,
  setting_value TEXT
);

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('payment_card_enabled',  '1'),
('payment_card_soon',     '0'),
('payment_wish_enabled',  '1'),
('payment_wish_soon',     '0'),
('payment_cod_enabled',   '1'),
('payment_cod_soon',      '0');

-- ── CART ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  product_id INT,
  size_key   VARCHAR(20),
  size_label VARCHAR(40),
  price      DECIMAL(10,2),
  qty        INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
