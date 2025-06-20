INSERT INTO Users (username, email, password_hash, role) VALUES ('alice123', 'alice@example.com', 'hashed123', 'owner');
INSERT INTO Users (username, email, password_hash, role) VALUES ('bobwalker', 'bob@example.com', 'hashed456', 'walker');
INSERT INTO Users (username, email, password_hash, role) VALUES ('carol123', 'carol@example.com', 'hashed789', 'owner');
INSERT INTO Users (username, email, password_hash, role) VALUES ('user4', 'user4@example.com', 'hasheduser4', 'owner');
INSERT INTO Users (username, email, password_hash, role) VALUES ('user5', 'user5@example.com', 'hasheduser5', 'owner');

INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='alice123'), 'Max', 'medium');
INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='carol123'), 'Bella', 'small');
INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='user4'), 'dog3', 'small');
INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='alice123'), 'dog4', 'small');
INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='user5'), 'dog5', 'small');

INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Max'), '2025-06-10 08:00:00', 30, 'Parkdands', 'open');
INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Bella'), '2025-06-10 09:30:00', 30, 'Beachside Ave', 'accepted');
INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Max'), '2025-06-11 08:00:00', 30, 'Parkdands', 'open');
INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Max'), '2025-06-12 08:00:00', 30, 'Parkdands', 'open');
INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='dog4'), '2025-06-10 08:00:00', 30, 'Parkdands', 'open');