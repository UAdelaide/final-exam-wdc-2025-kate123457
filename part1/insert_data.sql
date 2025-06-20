
INSERT INTO Users (username, email, password_hash, role) VALUES

('alice123',  'alice@example.com',  'hashed123', 'owner'),
('bobwalker', 'bob@example.com',    'hashed456', 'walker'),
('carol123',  'carol@example.com',  'hashed789', 'owner'),

('dave123',   'dave@example.com',   'hashed101', 'owner'),
('erinwalker','erin@example.com',   'hashed102', 'walker');


INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max',   'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'dave123'),  'Rocky', 'large'),
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Coco',  'small'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Milo',  'medium');

/* ---------- 3. 五个遛狗请求 ---------- */
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT dog_id FROM Dogs WHERE name = 'Max'),   '2025-06-10 08:00:00', 30, 'Parklands',      'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave',  'accepted'),
((SELECT dog_id FROM Dogs WHERE name = 'Rocky'), '2025-06-10 10:30:00', 60, 'Riverside Park', 'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Coco'),  '2025-06-11 14:00:00', 30, 'City Gardens',   'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Milo'),  '2025-06-12 07:45:00', 40, 'Hilltop Trail',  'open');
