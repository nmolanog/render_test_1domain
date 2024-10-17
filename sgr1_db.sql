/*create db*/
CREATE DATABASE sgr1;
/*connect to db*/
\c sgr1

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table users(
    user_id uuid primary key default
    uuid_generate_v4(),
    user_name varchar(255) not null,
    user_email varchar(255) not null,
    user_password varchar(255) not null,
    usertype varchar(50) not null
);


/* create tables */
CREATE TABLE "student" (
  "id_stu" SERIAL PRIMARY KEY,
  "id" varchar,
  "name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "ur_mail" varchar NOT NULL,
  "priv_mail" varchar,
  "phone" varchar,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
   timestamp timestamp default current_timestamp,
   "inactive_descr" varchar
);

CREATE TABLE "program" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "duration" integer NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
   timestamp timestamp default current_timestamp,
   "inactive_descr" varchar
);

CREATE TABLE "enrollment" (
  "id" SERIAL PRIMARY KEY,
  "student_id" integer,
  "program_id" integer,
  "start_date" date NOT NULL,
  "start_date_semester" date NOT NULL,
  "end_date" date NOT NULL,
  "state" varchar NOT NULL DEFAULT 'active',
  "current_commit" INT NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
   timestamp timestamp default current_timestamp,
   "inactive_descr" varchar
);

CREATE TABLE "commitment" (
  "id" SERIAL PRIMARY KEY,
  "commit_num" int NOT NULL,
  "enroll_id" integer,
  "due_date" date NOT NULL,
  "deliver_date" date DEFAULT NULL,
  "state" varchar NOT NULL DEFAULT 'pending',
  "obs" varchar DEFAULT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
   timestamp timestamp default current_timestamp,
   "inactive_descr" varchar
);

CREATE TABLE "appointment" (
  "id" SERIAL PRIMARY KEY,
  "commit_id" integer,
  "set_date" date NOT NULL,
  "date" date NOT NULL,
  "location" varchar NOT NULL,
  "fullfiled" varchar NOT NULL,
  "obs" varchar,
  "end_commit" varchar NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
   timestamp timestamp default current_timestamp,
   "inactive_descr" varchar
);

CREATE TABLE "defferrings" (
  "id" SERIAL PRIMARY KEY,
   "enroll_id" integer NOT NULL,
   "deffering_date" date NOT NULL,
   "deffering_date_semester" date NOT NULL,
   "return_date" date,
   "deffer_state" varchar NOT NULL DEFAULT 'active',
   "active" BOOLEAN NOT NULL DEFAULT TRUE,
   timestamp timestamp default current_timestamp,
   "inactive_descr" varchar
);

/* define relations */

ALTER TABLE "enrollment" ADD FOREIGN KEY ("student_id") REFERENCES "student" ("id_stu") ON DELETE CASCADE;

ALTER TABLE "enrollment" ADD FOREIGN KEY ("program_id") REFERENCES "program" ("id") ON DELETE CASCADE;

ALTER TABLE "commitment" ADD FOREIGN KEY ("enroll_id") REFERENCES "enrollment" ("id") ON DELETE CASCADE;

ALTER TABLE "appointment" ADD FOREIGN KEY ("commit_id") REFERENCES "commitment" ("id") ON DELETE CASCADE;

ALTER TABLE "defferrings" ADD FOREIGN KEY ("enroll_id") REFERENCES "enrollment" ("id") ON DELETE CASCADE;

/* define some  Constraints*/
ALTER TABLE "program" ADD CHECK (duration > 0 AND duration <8);

CREATE UNIQUE INDEX student_myc ON student (id) WHERE (active is TRUE);
CREATE UNIQUE INDEX program_myc ON program (name) WHERE (active is TRUE);
CREATE UNIQUE INDEX enrollment_myc ON enrollment (student_id, program_id) WHERE (active is TRUE);
CREATE UNIQUE INDEX commitment_myc ON commitment (commit_num, enroll_id) WHERE (active is TRUE);

/*views*/

CREATE VIEW enrollment_app AS
SELECT t2.enroll_id, t2.student_id, t2.student_full_name, t2.student_urmail, p.name AS program, p.duration AS duration, 
t2.start_date_semester, t2.end_date, 
LEAST(p.duration+EXTRACT(YEAR FROM age(t2.end_date)),p.duration) AS current_year,
t2.state, t2.active  
            FROM program p 
            JOIN (select e.id AS enroll_id, s.id AS student_id, concat(s.name, ' ', s.last_name) AS student_full_name,
            s.ur_mail as student_urmail, e.program_id AS program_id, e.start_date_semester AS start_date_semester,
            e.end_date AS end_date, e.state as state, e.active
            FROM student s join enrollment e ON s.id_stu = e.student_id 
            WHERE s.active = TRUE AND e.active = TRUE) t2 ON p.id = t2.program_id WHERE p.active = TRUE;

CREATE VIEW appointment_app AS            
select enr.enroll_id, enr.student_id, enr.student_full_name, enr.student_urmail, enr.program, 
enr.duration, enr.start_date_semester, enr.end_date, enr.current_year, enr.state as enr_state,
apo2.apo_id, apo2.commit_id, apo2.set_date as apo_set_date, apo2.date as apo_date, apo2.fullfiled as apo_fullfiled, apo2.location as apo_location,
apo2.obs as apo_obs, apo2.end_commit as apo_end_commit,
apo2.commit_num, apo2.due_date as commit_due_date, apo2.deliver_date as commit_deliver_date, apo2.commit_state 
from enrollment_app enr
join
(select apo.id as apo_id, com.id as commit_id, apo.set_date, apo.date, apo.fullfiled, apo.location, apo.obs, apo.end_commit,
com.commit_num, com.enroll_id, com.due_date, com.deliver_date, com.state as commit_state
from commitment com
LEFT JOIN (
  select * from appointment where active is TRUE OR active is NULL
) apo
on com.id = apo.commit_id
where com.active is TRUE) apo2
on enr.enroll_id=apo2.enroll_id
where enr.active is TRUE;

CREATE VIEW stud_for_enroll AS
SELECT 
    st.id_stu, st.id, st.name, st.last_name, st.ur_mail, st.active,
    CASE 
        WHEN BOOL_OR(e.state = 'active') THEN 'active'
        ELSE MAX(e.state)
    END AS enroll_state
FROM 
    student st
LEFT OUTER JOIN  
    enrollment e
ON 
    st.id_stu = e.student_id
GROUP BY 
    st.id_stu;

/* insert some data */
/*user login*/
INSERT INTO users (user_name,user_email,user_password,usertype) 
VALUES 
( 'Nico','nmolanog@gmail.com', '$2a$10$nu5fHfjKdtT9MjQ2MyAz7eFq18zr4V9gynWyAS9bDCK/S.AuJ6iEK', 'admin');

/*students*/
INSERT INTO student (id,name,last_name,ur_mail,priv_mail,phone) 
VALUES 
('81883773', 'Nico Andres','Molano Gonzalez', 'nmolanog@urosario.edu.co',NULL, '+573029693231'),
('108635473', 'Lina Camila','Otero Silva', 'lcoteros@urosario.edu.co',NULL, '+573017053269'),
('69352415', 'Andrea','Bello Castro', 'abc@urosario.edu.co',NULL, '+573074263539'),
('361753268', 'Camilo Juan','Gonzalez helo', 'cjgonzalez@urosario.edu.co',NULL, '3016983215'),
('48197482', 'Natalia Maria','Gomez Gomez', 'natalia.gomez@urosario.edu.co',NULL, '307983241'),
('96145876', 'Victor','Marin Castro', 'victor.castro@urosario.edu.co',NULL, '3096365875'),
('37545289', 'Sindy Jhovanna','Campi Mull', 'sindy.campi@urosario.edu.co',NULL, '3064231212');

INSERT INTO student (id,name,last_name,ur_mail,priv_mail,phone, active) 
VALUES ('78965321', 'Daut','ivanov vodka', 'daut@urosario.edu.co',NULL, '+573074263539',false);

/*program*/
INSERT INTO program (name,duration) 
VALUES 
('Cardiologia',3),
('Anestesia',2),
('Nefrologia',1);

/*enrollments*/
INSERT INTO enrollment (student_id,program_id,start_date,start_date_semester,end_date,state,current_commit)
VALUES 
((SELECT id_stu FROM student WHERE id ='81883773'),3,'01/02/2020','01/01/2020','14/12/2020','Finished',1),
((SELECT id_stu FROM student WHERE id ='108635473'),2,'01/08/2020','01/07/2020','30/06/2021','Finished',2),
((SELECT id_stu FROM student WHERE id ='69352415'),1,'01/02/2020','01/01/2020','14/12/2022','Finished',3);

/* testing, it works
update enrollment set active = FALSE where id = 3;
INSERT INTO enrollment (student_id,program_id,start_date,end_date,state)
VALUES ((SELECT id_stu FROM student WHERE id ='69352415'),3,'01/08/2020','30/06/2023','active');

INSERT INTO enrollment (student_id,program_id,start_date,end_date,state)
VALUES ((SELECT id_stu FROM student WHERE id ='69352415'),3,'01/02/2020','14/12/2022','active');

INSERT INTO enrollment (student_id,program_id,start_date,end_date,state,active)
VALUES ((SELECT id_stu FROM student WHERE id ='69352415'),3,'01/02/2020','14/12/2022','active',FALSE);
*/


/*commitment*/
/*for enrollment1*/
INSERT INTO commitment (commit_num, enroll_id, due_date, deliver_date, state, obs) 
VALUES 
(1,1,'30/10/2020','30/10/2020','delivered',NULL),
/*for enrollment2*/
(1,2,'30/04/2021','30/04/2021','delivered',NULL),
(2,2,'30/04/2022','30/04/2022','delivered',NULL),
/*for enrollment3*/
(1,3,'30/10/2020','30/10/2020','delivered',NULL),
(2,3,'30/10/2021','30/10/2021','delivered',NULL),
(3,3,'30/10/2022','30/10/2022','delivered',NULL);

/* testing
INSERT INTO commitment (commit_num, enroll_id, due_date, deliver_date, state, obs) 
VALUES 
(1,1,'30/10/2020','30/10/2020','pending',NULL);

INSERT INTO commitment (commit_num, enroll_id, due_date, deliver_date, state, obs, active) 
VALUES 
(1,1,'30/10/2020','30/10/2020','pending',NULL,FALSE);
*/

INSERT INTO appointment ( commit_id, set_date, date, location, obs,end_commit,fullfiled) 
VALUES 
/*for enrollment1 commit 1*/
(1,'01/06/2020','05/06/2020','FCI','diseno protocolo','no','yes'),
(1,'03/08/2020','13/08/2020','zoom','analisis datos','no','yes'),
(1,'15/10/2020','25/10/2020','FCI','entrega final','yes','yes'),

/*for enrollment2 commit 1*/
(2,'15/11/2020','25/11/2020','FCI','diseno protocolo','no','yes'),
(2,'21/11/2020','29/11/2020','FCI','diseno protocolo ok','yes','yes'),
/*for enrollment2 commit 2*/
(3,'02/02/2021','09/02/2021','zoom','prueba piloto datos','no','yes'),
(3,'15/02/2021','22/02/2021','zoom','depuracion datos','no','yes'),
(3,'24/03/2021','26/03/2021','zoom','analisis','no','yes'),
(3,'01/05/2021','05/05/2021','zoom','entrega final','yes','yes'),

/*for enrollment3 commit 1,2,3*/
(4,'01/11/2020','15/11/2020','zoom','entrega final ok','yes','yes'),
(5,'01/11/2021','15/11/2021','zoom','entrega final ok','yes','yes'),
(6,'01/11/2022','15/11/2022','zoom','entrega final ok','yes','yes');


select * from users;
select * from student;
select * from program;
select * from enrollment;
select * from commitment;
select * from enrollment_app;
select * from appointment;
select * from appointment_app;
select * from defferrings;
select * from stud_for_enroll;