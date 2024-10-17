const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");

//get all enrollments
router.get("/all", isAuthenticated, async (req, res) => {
   
    try {
        const result = await pool.query(`SELECT * FROM enrollment_app`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//get handler for search in enrollments
router.get("/search", isAuthenticated, async (req, res) => {
    const { attribute, query } = req.query;
    const validAttributes = ['enroll_id', 'student_id', 'student_full_name', 'student_urmail', 
        'program', 'duration','start_date_semester','end_date','current_year','state'];
        //console.log("success")

    if (!validAttributes.includes(attribute)) {
        return res.status(400).json({ error: 'Invalid attribute' });
    }

    try {
        const text = `SELECT * FROM enrollment_app WHERE CAST(${attribute} AS TEXT) ILIKE $1 AND active IS TRUE`;
        const values = [`%${query}%`];

        // Execute the query
        const result = await pool.query(text, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//get handler for search in enrollments for commits
router.get("/search/:enroll_id", isAuthenticated, async (req, res) => {
    const { enroll_id } = req.params;

    try {
        const text = `SELECT * FROM enrollment_app WHERE enroll_id = $1 AND active IS TRUE`;
        // Execute the query
        const result = await pool.query(text, [enroll_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


//posts
//post enrrolment
router.post("/insert", isAuthenticated, async (req, res) => {
    try {
        const enrollment = req.body;
        const values = Object.values(enrollment);
        const columns = Object.keys(enrollment).join(', ');
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const query = `INSERT INTO enrollment (${columns},state) VALUES(${placeholders},'active') RETURNING id`;
        const newEnrollment = await pool.query(query, values);

        res.status(201).json(newEnrollment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
});

//puts
//put edit for commits delivered
router.put("/end/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const query = `UPDATE enrollment SET state = 'Finished' WHERE id = $1`;

        const updateCommit = await pool.query(query, [id]);
        res.status(200).json(`Enrroll with id ${id} edited`);
    } catch (err) {

            console.error(err.message);
            res.status(500).json({ error: "Internal Server Error" });
    }
});

//get number of appointments associated with enroll
router.get("/appointmentsnum/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const text = `SELECT COUNT(apo_id) FROM appointment_app WHERE enroll_id =$1 AND apo_id IS NOT NULL`;
        // Execute the query
        const result = await pool.query(text, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//put delete for programs, edit-delete logic
router.put("/deactivate/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query1 = `UPDATE enrollment SET active = FALSE, timestamp = current_timestamp, inactive_descr = 'delete', state = 'delete' WHERE id = $1`;
        await client.query(query1, [id]);

        const query2 = `UPDATE commitment SET active = FALSE, inactive_descr = 'delete from enrollment' WHERE enroll_id = $1`;
        await client.query(query2, [id]);

        const query3 = `UPDATE appointment SET active = FALSE, inactive_descr = 'delete from enrollment' WHERE commit_id IN (SELECT id from commitment WHERE enroll_id = $1)`;
        await client.query(query3, [id]);

        await client.query('COMMIT');

        res.status(200).json(`program with id ${id} deactivated`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in transaction', err);
        res.status(500).send('An error occurred while deactivating the student');
    } finally {
        client.release();
    }
});

//put defer enrooll
router.put("/defer/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const {deffering_date,deffering_date_semester} = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query1 = `UPDATE enrollment SET state = 'Deferred', timestamp = current_timestamp WHERE id = $1`;
        await client.query(query1, [id]);

        const query2 = `INSERT INTO defferrings (enroll_id, deffering_date, deffering_date_semester) VALUES($1,$2,$3)`;
        await client.query(query2, [id,deffering_date,deffering_date_semester]);

        await client.query('COMMIT');

        res.status(200).json(`Enroll with id ${id} deferred`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in transaction deferring', err);
        res.status(500).send('An error occurred while registering deferrings');
    } finally {
        client.release();
    }
});

//get deferrings
router.get("/searchdeferr/:enroll_id", isAuthenticated, async (req, res) => {
    const { enroll_id } = req.params;

    try {
        const text = `SELECT * FROM defferrings WHERE enroll_id = $1 AND active IS TRUE AND deffer_state = 'active'`;
        // Execute the query
        const result = await pool.query(text, [enroll_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//put reactivate enrooll
router.put("/reactivate/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const {enroll_id,return_date} = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query1 = `UPDATE enrollment SET state = 'active', timestamp = current_timestamp WHERE id = $1`;
        await client.query(query1, [enroll_id]);

        const query2 = `UPDATE defferrings SET return_date= $1, timestamp = current_timestamp, deffer_state='returned' WHERE id = $2`;
        await client.query(query2, [return_date,id]);

        await client.query('COMMIT');

        res.status(200).json(`Enroll with id ${id} deferred`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in transaction deferring', err);
        res.status(500).send('An error occurred while registering deferrings');
    } finally {
        client.release();
    }
});


module.exports = router;