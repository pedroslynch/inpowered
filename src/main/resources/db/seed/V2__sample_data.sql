-- Sample data for development.
-- Passwords: admin@inpowered.ai / Admin@123 ; seller accounts / Seller@123
INSERT INTO app_user (email, password_hash, full_name, role) VALUES
    ('admin@inpowered.ai', '$2a$10$IhuoC1mkhjKhqGnxlaqLfuxQr3umlriP4aB5tYGNbFj5u0H07jA5e', 'System Administrator', 'ADMIN'),
    ('maria.silva@inpowered.ai', '$2a$10$BpfkgqbF3/zbbXtgAqauJu5UpsKfvb6E7TUSW0OzXgfikYW8LD1HC', 'Maria Silva', 'SELLER'),
    ('john.carter@inpowered.ai', '$2a$10$BpfkgqbF3/zbbXtgAqauJu5UpsKfvb6E7TUSW0OzXgfikYW8LD1HC', 'John Carter', 'SELLER');

INSERT INTO seller (name, email, phone, user_id) VALUES
    ('Maria Silva', 'maria.silva@inpowered.ai', '+55 11 98888-1001', (SELECT id FROM app_user WHERE email = 'maria.silva@inpowered.ai')),
    ('John Carter', 'john.carter@inpowered.ai', '+1 212 555-0142', (SELECT id FROM app_user WHERE email = 'john.carter@inpowered.ai'));

INSERT INTO customer (name, email, phone, document) VALUES
    ('Acme Retail Ltd.', 'purchasing@acmeretail.com', '+1 415 555-0101', '12.345.678/0001-90'),
    ('Blue Ocean Media', 'ops@blueocean.media', '+1 646 555-0177', '98.765.432/0001-10'),
    ('Northwind Traders', 'buyers@northwind.com', '+44 20 7946 0958', '45.678.912/0001-33');

INSERT INTO product (name, characteristics, brand, price, manufacturing_date) VALUES
    ('Laptop Pro 14', '14-inch display, 16 GB RAM, 512 GB SSD', 'Lenovo', 7899.90, '2026-03-15'),
    ('Wireless Mouse', 'Bluetooth 5.0, 2400 DPI, rechargeable', 'Logitech', 249.90, '2026-01-20'),
    ('4K Monitor 27', '27-inch IPS, 3840x2160, USB-C 65 W', 'Dell', 2899.00, '2025-11-05'),
    ('Mechanical Keyboard', 'Hot-swappable switches, RGB backlight', 'Keychron', 699.00, '2026-02-10'),
    ('Noise Cancelling Headset', 'Over-ear, ANC, 30 h battery', 'Sony', 1799.00, '2025-12-01');

INSERT INTO sale (seller_id, customer_id, sale_date, notes) VALUES
    ((SELECT id FROM seller WHERE email = 'maria.silva@inpowered.ai'), (SELECT id FROM customer WHERE name = 'Acme Retail Ltd.'), '2026-09-28', 'Office refresh - first batch'),
    ((SELECT id FROM seller WHERE email = 'maria.silva@inpowered.ai'), (SELECT id FROM customer WHERE name = 'Blue Ocean Media'), '2026-10-01', NULL),
    ((SELECT id FROM seller WHERE email = 'john.carter@inpowered.ai'), (SELECT id FROM customer WHERE name = 'Northwind Traders'), '2026-10-02', 'Delivery to London office');

INSERT INTO sale_item (sale_id, product_id, quantity, unit_price)
SELECT s.id, p.id, v.quantity, p.price
FROM (VALUES
        ('Office refresh - first batch', 'Laptop Pro 14', 2),
        ('Office refresh - first batch', 'Wireless Mouse', 2),
        (NULL, '4K Monitor 27', 1),
        (NULL, 'Mechanical Keyboard', 3),
        ('Delivery to London office', 'Noise Cancelling Headset', 4),
        ('Delivery to London office', 'Laptop Pro 14', 1)
     ) AS v(notes, product, quantity)
JOIN sale s ON s.notes IS NOT DISTINCT FROM v.notes
JOIN product p ON p.name = v.product;

UPDATE sale s
SET total_amount = (SELECT coalesce(sum(i.quantity * i.unit_price), 0) FROM sale_item i WHERE i.sale_id = s.id);
