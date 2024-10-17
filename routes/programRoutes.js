const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");


//get handler for search in programs
router.get("/search", isAuthenticated, async (req, res) => {
    const { attribute, query } = req.query;
    const validAttributes = ['name', 'duration'];

    if (!validAttributes.includes(attribute)) {
        return res.status(400).json({ error: 'Invalid attribute' });
    }

    try {
        const text = `SELECT * FROM program WHERE CAST(${attribute} AS TEXT) ILIKE $1 AND active IS TRUE`;
        const values = [`%${query}%`];

        // Execute the query
        const result = await pool.query(text, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//get handler for search in students for enrollments
router.get("/search4enroll", isAuthenticated, async (req, res) => {
    const { query } = req.query;

    try {
        const text = `SELECT *
FROM program
WHERE (name ILIKE $1 OR CAST(duration AS TEXT) ILIKE $1) AND active IS TRUE`;
        const values = [`%${query}%`];

        // Execute the query
        const result = await pool.query(text, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//post program
router.post("/insert", isAuthenticated, async (req, res) => {
    try {
        const program = req.body;

        const values = Object.values(program);
        const columns = Object.keys(program).join(', ');
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const query = `INSERT INTO program (${columns}) VALUES(${placeholders}) RETURNING *`;

        const newProgram = await pool.query(query, values);
        
        res.status(201).json(newProgram.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//copy program
router.post("/copy/:id", isAuthenticated, async (req, res) => {
    try {
        //get only what I need
        const { id } = req.params;

        const query = "INSERT INTO program (name, duration, timestamp, active, inactive_descr) SELECT name, duration, timestamp, FALSE, 'edit' FROM program WHERE id = $1;";
        const newStudent = await pool.query(query, [id]);

        res.status(201).json(newStudent);
    } catch (err) {
        console.error(err.message);
    }
});

//put edit for program, edit-delete logic
// beware! this should be valid for programs withouth enrollments
// for programs with enrollments only name should be allowed to be edited
router.put("/edit/:idProg", isAuthenticated, async (req, res) => {
    try {
        const { idProg } = req.params;
        const programDB = req.body;
        const { id, ...program } = programDB;
        if (idProg != id) {
            return res.status(400).json({ error: `id (${id}) != idProg (${idProg})` });
        }
        //build query
        const values = Object.values(program);
        const columns = Object.keys(program);
        const colValuePair = columns.map((col, index) => `${col}=$${index + 1}`).join(', ');
        const query = `UPDATE program SET ${colValuePair}, timestamp = current_timestamp WHERE id = $3`;

        values.push(id);

        const updateStudentActive = await pool.query(query, values);
        res.status(200).json(`program with id ${id} edited`);
    } catch (err) {
        if (err.code === '23505') {
            // Unique constraint violation
            return res.status(409).json({ error: "A program with the provided unique field already exists." });
        } else {
            // Generic error handling
            console.error(err.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

//put delete for programs, edit-delete logic
router.put("/deactivate/:idProg", isAuthenticated, async (req, res) => {
    const { idProg } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query1 = `UPDATE program SET active = FALSE, timestamp = current_timestamp, inactive_descr = 'delete' WHERE id = $1`;
        await client.query(query1, [idProg]);

        const query2 = `UPDATE enrollment SET active = FALSE, inactive_descr = 'delete from program' WHERE program_id = $1`;
        await client.query(query2, [idProg]);

        const query3 = `UPDATE commitment SET active = FALSE, inactive_descr = 'delete from program' WHERE enroll_id IN (SELECT id from enrollment WHERE program_id = $1)`;
        await client.query(query3, [idProg]);

        await client.query('COMMIT');

        res.status(200).json(`program with id ${idProg} deactivated`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in transaction', err);
        res.status(500).send('An error occurred while deactivating the student');
    } finally {
        client.release();
    }
});

//get number of enrolmments associated with program
router.get("/enrollmentsnum/:idProg", isAuthenticated, async (req, res) => {
    const { idProg } = req.params;
    try {
        const text = `SELECT COUNT(program_id) FROM enrollment WHERE program_id =$1 AND active IS TRUE`;
        // Execute the query
        const result = await pool.query(text, [idProg]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//get names from programs
router.get("/allnames", isAuthenticated, async (req, res) => {
    
    try {
        const result = await pool.query(`SELECT name FROM program WHERE active IS TRUE`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;