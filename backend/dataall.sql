-- Reset tables (请在 columbia_help_out 库下执行)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE task_events;
TRUNCATE TABLE task_tags;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO users (uid, email, display_name, is_verified, photo_url)
VALUES
    ('mock-user-1', 'jordan@columbia.edu', 'Jordan Lee', 1, 'https://i.pravatar.cc/120?u=jordan'),
    ('mock-user-2', 'li.andy@columbia.edu', 'Andy Li', 1, 'https://i.pravatar.cc/120?u=andy'),
    ('mock-user-3', 'chen.mei@columbia.edu', 'Mei Chen', 1, 'https://i.pravatar.cc/120?u=mei'),
    ('mock-user-4', 'pat.singh@columbia.edu', 'Pat Singh', 0, 'https://i.pravatar.cc/120?u=pat'),
    ('mock-user-5', 'alex.taylor@columbia.edu', 'Alex Taylor', 1, 'https://i.pravatar.cc/120?u=alex');

-- Tasks
-- 字段顺序：uid,title,short_description,category,credits,location,duration_minutes,status,is_verified,is_online,urgency,created_at,updated_at,claimed_by_uid,claimed_at,completed_at
INSERT INTO tasks (
    uid,title,short_description,category,credits,location,duration_minutes,status,is_verified,is_online,urgency,created_at,updated_at,claimed_by_uid,claimed_at,completed_at
) VALUES
-- Open / published by mock-user-1
('mock-user-1','Borrow 45W USB-C charger','Need a 45W USB-C charger near Butler','campus',30,'Butler Library lobby',30,'open',1,0,'urgent',NOW()-INTERVAL 40 MINUTE,NOW()-INTERVAL 40 MINUTE,NULL,NULL,NULL),
('mock-user-1','Buy a Lunch','Grab lunch from Ferris Booth Commons','daily',10,'Ferris Booth Commons',20,'open',1,0,'normal',NOW()-INTERVAL 3 HOUR,NOW()-INTERVAL 3 HOUR,NULL,NULL,NULL),
('mock-user-1','Friend referral bonus','Share a referral link for a role','other',50,'Online',5,'open',1,1,'flexible',NOW()-INTERVAL 2 DAY,NOW()-INTERVAL 2 DAY,NULL,NULL,NULL),

-- Claimed by mock-user-2 (publisher mock-user-1)
('mock-user-1','Help pick a package','Pick a package from package center','campus',15,'Package Center',15,'claimed',1,0,'normal',NOW()-INTERVAL 5 HOUR,NOW()-INTERVAL 5 HOUR,'mock-user-2',NOW()-INTERVAL 4 HOUR,NULL),

-- Completed by mock-user-2 (publisher mock-user-1)
('mock-user-1','Share class notes','Send EE class notes PDF','academic',12,'Online',10,'completed',1,1,'flexible',NOW()-INTERVAL 3 DAY,NOW()-INTERVAL 1 DAY,'mock-user-2',NOW()-INTERVAL 2 DAY,NOW()-INTERVAL 1 DAY),

-- Cancelled by publisher (mock-user-1)
('mock-user-1','Move small shelf','Need to move a small shelf','daily',25,'East Campus',25,'cancelled',1,0,'normal',NOW()-INTERVAL 4 DAY,NOW()-INTERVAL 3 DAY,NULL,NULL,NULL),

-- Open / published by mock-user-2
('mock-user-2','Language exchange','30-min English/Chinese exchange','other',18,'Butler 2F',30,'open',1,0,'flexible',NOW()-INTERVAL 70 MINUTE,NOW()-INTERVAL 70 MINUTE,NULL,NULL,NULL),
('mock-user-2','Math study buddy','Calc III problem review','academic',22,'Mudd 3rd floor',45,'open',1,0,'normal',NOW()-INTERVAL 8 HOUR,NOW()-INTERVAL 8 HOUR,NULL,NULL,NULL),

-- Claimed by mock-user-1 (publisher mock-user-2)
('mock-user-2','Buy a drink','Grab a coffee from Blue Java','daily',5,'Blue Java',10,'claimed',1,0,'normal',NOW()-INTERVAL 6 HOUR,NOW()-INTERVAL 6 HOUR,'mock-user-1',NOW()-INTERVAL 5 HOUR,NULL),

-- Completed by mock-user-1 (publisher mock-user-2)
('mock-user-2','Poster design review','Review a club poster','other',28,'Online',25,'completed',1,1,'normal',NOW()-INTERVAL 5 DAY,NOW()-INTERVAL 2 DAY,'mock-user-1',NOW()-INTERVAL 4 DAY,NOW()-INTERVAL 2 DAY),

-- Cancelled by claimer (mock-user-1) (publisher mock-user-2)
('mock-user-2','Pick up dry cleaning','Dry cleaning pickup at 110th','daily',14,'110th St Laundry',20,'cancelled',1,0,'urgent',NOW()-INTERVAL 7 DAY,NOW()-INTERVAL 5 DAY,'mock-user-1',NOW()-INTERVAL 6 DAY,NULL),

-- Open / published by mock-user-3
('mock-user-3','Exam proctor helper','Need someone to watch bags','campus',16,'Lerner',60,'open',1,0,'normal',NOW()-INTERVAL 1 DAY,NOW()-INTERVAL 1 DAY,NULL,NULL,NULL),
('mock-user-3','Film gear carry','Help carry light stands','daily',35,'Dodge Hall entrance',40,'open',1,0,'urgent',NOW()-INTERVAL 9 HOUR,NOW()-INTERVAL 9 HOUR,NULL,NULL,NULL),

-- Claimed by mock-user-5 (publisher mock-user-3)
('mock-user-3','Resume review','30-min resume review','other',20,'Online',30,'claimed',1,1,'flexible',NOW()-INTERVAL 12 HOUR,NOW()-INTERVAL 12 HOUR,'mock-user-5',NOW()-INTERVAL 10 HOUR,NULL),

-- Completed by mock-user-4 (publisher mock-user-3)
('mock-user-3','Stats tutoring','Stats tutoring for HW set','academic',40,'Butler 6F',60,'completed',1,0,'normal',NOW()-INTERVAL 8 DAY,NOW()-INTERVAL 5 DAY,'mock-user-4',NOW()-INTERVAL 7 DAY,NOW()-INTERVAL 5 DAY),

-- Open / published by mock-user-4 (unverified publisher)
('mock-user-4','Event photography','Take photos at club event','other',60,'Low Steps',90,'open',0,0,'urgent',NOW()-INTERVAL 2 HOUR,NOW()-INTERVAL 2 HOUR,NULL,NULL,NULL),

-- Claimed by mock-user-1 (publisher mock-user-4)
('mock-user-4','Grocery drop','Deliver groceries to dorm','daily',18,'Broadway & 114th',25,'claimed',0,0,'normal',NOW()-INTERVAL 30 HOUR,NOW()-INTERVAL 30 HOUR,'mock-user-1',NOW()-INTERVAL 28 HOUR,NULL),

-- Open / published by mock-user-5
('mock-user-5','CS project pairing','Pair program for 1 hour','academic',32,'Online',60,'open',1,1,'normal',NOW()-INTERVAL 15 HOUR,NOW()-INTERVAL 15 HOUR,NULL,NULL,NULL),

-- Completed by mock-user-2 (publisher mock-user-5)
('mock-user-5','Dog walking','Walk a corgi at Riverside','daily',25,'Riverside Park 112th entrance',35,'completed',1,0,'flexible',NOW()-INTERVAL 10 DAY,NOW()-INTERVAL 7 DAY,'mock-user-2',NOW()-INTERVAL 9 DAY,NOW()-INTERVAL 7 DAY),

-- Cancelled by publisher mock-user-5
('mock-user-5','Laptop setup help','Set up dev environment','academic',30,'CEPSR lobby',50,'cancelled',1,0,'normal',NOW()-INTERVAL 3 DAY,NOW()-INTERVAL 2 DAY,NULL,NULL,NULL),

-- Another open task for mock-user-1 to enrich list
('mock-user-1','Flyer distribution','Distribute 50 flyers on campus','daily',20,'College Walk',50,'open',1,0,'flexible',NOW()-INTERVAL 6 HOUR,NOW()-INTERVAL 6 HOUR,NULL,NULL,NULL),

-- Another claimed task to show My Claimed (claimer mock-user-1)
('mock-user-3','Data entry help','Enter survey data to sheet','other',22,'Online',45,'claimed',1,1,'normal',NOW()-INTERVAL 20 HOUR,NOW()-INTERVAL 20 HOUR,'mock-user-1',NOW()-INTERVAL 18 HOUR,NULL);

-- Tags
INSERT INTO task_tags (task_id, tag)
SELECT id, 'charger' FROM tasks WHERE title='Borrow 45W USB-C charger'
UNION ALL SELECT id, 'butler' FROM tasks WHERE title='Borrow 45W USB-C charger'
UNION ALL SELECT id, 'lunch' FROM tasks WHERE title='Buy a Lunch'
UNION ALL SELECT id, 'referral' FROM tasks WHERE title='Friend referral bonus'
UNION ALL SELECT id, 'package' FROM tasks WHERE title='Help pick a package'
UNION ALL SELECT id, 'notes' FROM tasks WHERE title='Share class notes'
UNION ALL SELECT id, 'move' FROM tasks WHERE title='Move small shelf'
UNION ALL SELECT id, 'language' FROM tasks WHERE title='Language exchange'
UNION ALL SELECT id, 'math' FROM tasks WHERE title='Math study buddy'
UNION ALL SELECT id, 'coffee' FROM tasks WHERE title='Buy a drink'
UNION ALL SELECT id, 'design' FROM tasks WHERE title='Poster design review'
UNION ALL SELECT id, 'cleaning' FROM tasks WHERE title='Pick up dry cleaning'
UNION ALL SELECT id, 'proctor' FROM tasks WHERE title='Exam proctor helper'
UNION ALL SELECT id, 'film' FROM tasks WHERE title='Film gear carry'
UNION ALL SELECT id, 'resume' FROM tasks WHERE title='Resume review'
UNION ALL SELECT id, 'tutoring' FROM tasks WHERE title='Stats tutoring'
UNION ALL SELECT id, 'photo' FROM tasks WHERE title='Event photography'
UNION ALL SELECT id, 'delivery' FROM tasks WHERE title='Grocery drop'
UNION ALL SELECT id, 'pair-program' FROM tasks WHERE title='CS project pairing'
UNION ALL SELECT id, 'dog' FROM tasks WHERE title='Dog walking'
UNION ALL SELECT id, 'setup' FROM tasks WHERE title='Laptop setup help'
UNION ALL SELECT id, 'flyer' FROM tasks WHERE title='Flyer distribution'
UNION ALL SELECT id, 'data-entry' FROM tasks WHERE title='Data entry help';

-- Task events (optional but丰富状态流转)
INSERT INTO task_events (task_id, actor_uid, from_status, to_status, note, created_at)
SELECT id, 'mock-user-2', NULL, 'claimed', 'Accepted the task', claimed_at FROM tasks WHERE title='Help pick a package'
UNION ALL SELECT id, 'mock-user-2', 'claimed', 'completed', 'Delivered notes', completed_at FROM tasks WHERE title='Share class notes'
UNION ALL SELECT id, 'mock-user-1', NULL, 'claimed', 'Took the coffee task', claimed_at FROM tasks WHERE title='Buy a drink'
UNION ALL SELECT id, 'mock-user-1', 'claimed', 'completed', 'Poster reviewed', completed_at FROM tasks WHERE title='Poster design review'
UNION ALL SELECT id, 'mock-user-1', 'claimed', 'cancelled', 'Could not pick up', NOW()-INTERVAL 5 DAY FROM tasks WHERE title='Pick up dry cleaning'
UNION ALL SELECT id, 'mock-user-5', NULL, 'claimed', 'Resume review booked', claimed_at FROM tasks WHERE title='Resume review'
          UNION ALL SELECT id, 'mock-user-4', NULL, 'claimed', 'Started tutoring', claimed_at FROM tasks WHERE title='Stats tutoring'
          UNION ALL SELECT id, 'mock-user-2', NULL, 'claimed', 'Walking dog', claimed_at FROM tasks WHERE title='Dog walking'
          UNION ALL SELECT id, 'mock-user-1', NULL, 'claimed', 'Data entry started', claimed_at FROM tasks WHERE title='Data entry help';