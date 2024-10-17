const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");

//posts
//post student
router.post("/insert", isAuthenticated, async (req, res) => {
        try {
            const student = req.body;
            const values = Object.values(student);
            const columns = Object.keys(student).join(', ');
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

            const query = `INSERT INTO student (${columns}) VALUES(${placeholders}) RETURNING *`;
            const newStudent = await pool.query(query, values);

            res.status(201).json(newStudent);
        } catch (err) {
            console.error(err.message);
        } 
});


//get handler for search in students
router.get("/search", isAuthenticated, async (req, res) => {

        const { attribute, query } = req.query;
        const validAttributes = ['id', 'name', 'last_name', 'ur_mail', 'priv_mail', 'phone'];

        if (!validAttributes.includes(attribute)) {
            return res.status(400).json({ error: 'Invalid attribute' });
        }

        try {
            const text = `SELECT * FROM student WHERE ${attribute} ILIKE $1 AND active IS TRUE`;
            const values = [`%${query}%`];

            // Execute the query
            const result = await pool.query(text, values);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Internal server error" });
        }
});

//get ids from students
router.get("/allids", isAuthenticated, async (req, res) => {

        try {
            const result = await pool.query(`SELECT id FROM student WHERE active IS TRUE`);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Internal server error" });
        }
});

//copy student
router.post("/copy/:id", isAuthenticated, async (req, res) => {

        try {
            //get only what I need
            const { id } = req.params;

            const query = "INSERT INTO student (id, name, last_name, ur_mail, priv_mail, phone, timestamp, active, inactive_descr) SELECT id, name, last_name, ur_mail, priv_mail, phone, timestamp, FALSE, 'edit' FROM student WHERE id_stu = $1;";
            const newStudent = await pool.query(query, [id]);

            res.status(201).json(newStudent);
        } catch (err) {
            console.error(err.message);
        }
});


//puts
//put edit for students, edit-delete logic
router.put("/edit/:id", isAuthenticated, async (req, res) => {

        try {
            const { id } = req.params;
            const studentDB = req.body;
            const { id_stu, ...student } = studentDB;
            if (id != id_stu) {
                return res.status(400).json({ error: `id (${id}) != id_stu (${id_stu})` });
            }
            //build query
            const values = Object.values(student);
            const columns = Object.keys(student);
            const colValuePair = columns.map((col, index) => `${col}=$${index + 1}`).join(', ');
            const query = `UPDATE student SET ${colValuePair}, timestamp = current_timestamp WHERE id_stu = $7`;

            values.push(id_stu);

            const updateStudentActive = await pool.query(query, values);
            res.status(200).json(`student with id ${id_stu} edited`);
        } catch (err) {
            if (err.code === '23505') {
                // Unique constraint violation
                return res.status(409).json({ error: "A student with the provided unique field already exists." });
            } else {
                // Generic error handling
                console.error(err.message);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }

});


//put delete for students, edit-delete logic
router.put("/deactivate/:id", isAuthenticated, async (req, res) => {

        const { id } = req.params;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const query1 = `UPDATE student SET active = FALSE, timestamp = current_timestamp, inactive_descr = 'delete' WHERE id_stu = $1`;
            await client.query(query1, [id]);

            const query2 = `UPDATE enrollment SET active = FALSE, inactive_descr = 'delete from student' WHERE student_id = $1`;
            await client.query(query2, [id]);

            const query3 = `UPDATE commitment SET active = FALSE, inactive_descr = 'delete from student' WHERE enroll_id IN (SELECT id from enrollment WHERE student_id = $1)`;
            await client.query(query3, [id]);

            await client.query('COMMIT');

            res.status(200).json(`student with id ${id} deactivated`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error in transaction', err);
            res.status(500).send('An error occurred while deactivating the student');
        } finally {
            client.release();
        }
});

//get handler for search in students for enrollments
router.get("/search4enroll", isAuthenticated, async (req, res) => {
    const { query } = req.query;

    try {
        const text = `SELECT id_stu, id, name, last_name, ur_mail
FROM stud_for_enroll
WHERE (id ILIKE $1 OR name ILIKE $1 OR last_name ILIKE $1 OR ur_mail ILIKE $1) AND active IS TRUE AND (enroll_state NOT IN ('active','Deferred') OR enroll_state IS NULL)`;
        const values = [`%${query}%`];

        // Execute the query
        const result = await pool.query(text, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//get handler for search in students for enroll_id (used for commits)
router.get("/search4enrollid/:enroll_id", isAuthenticated, async (req, res) => {
    const { enroll_id } = req.params;

    try {
        const text = `SELECT st.id_stu, st.id, st.name, st.last_name, st.ur_mail
FROM student st
LEFT OUTER JOIN  
enrollment e
ON st.id_stu=e.student_id
WHERE st.id_stu = $1 AND st.active IS TRUE`;

        // Execute the query
        const result = await pool.query(text, [enroll_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;