const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");

//posts
//post commitment
router.post("/insert/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const commitments = req.body;

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Insert each commitment into the database
        for (const item of commitments) {
            const { commit_num, due_date } = item;

            await pool.query(
                "INSERT INTO commitment (enroll_id, commit_num, due_date) VALUES ($1, $2, $3)",
                [id, commit_num, due_date]
            );
        }

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(201).send("Commitments inserted successfully");
    } catch (err) {
        // Rollback the transaction in case of error
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//gets
//get handler for commits associated to enroll_id
router.get("/search4enroll_id/:enroll_id", isAuthenticated, async (req, res) => {
    const { enroll_id } = req.params;

    try {
        const text = `SELECT * FROM commitment WHERE enroll_id = $1 AND active IS TRUE`;

        // Execute the query
        const result = await pool.query(text, [enroll_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/search4id/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const text = `SELECT * FROM commitment WHERE id = $1 AND active IS TRUE`;

        // Execute the query
        const result = await pool.query(text, [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//puts
//put edit for commits delivered
router.put("/end/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const {date} = req.body;
        const query = `UPDATE commitment SET state = 'delivered',deliver_date = $2, timestamp = current_timestamp WHERE id = $1`;

        const updateCommit = await pool.query(query, [id, date]);
        res.status(200).json(`commit with id ${id} edited`);
    } catch (err) {

            console.error(err.message);
            res.status(500).json({ error: "Internal Server Error" });
    }
});

//puts
//put update commits and enroll dates due to reactivation
router.put("/update_duedate", isAuthenticated, async (req, res) => {
    const updateArray = req.body;
    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Insert each commitment into the database
        for (const item of updateArray) {
            const { id, due_date } = item;

            await pool.query(
                "UPDATE commitment SET due_date = $1, timestamp = current_timestamp WHERE id = $2",
                [due_date,id ]
            );
        }

        await pool.query(
            "UPDATE enrollment SET end_date = $1, timestamp = current_timestamp WHERE id = (SELECT enroll_id FROM commitment WHERE id = $2)",
            [updateArray[updateArray.length - 1].due_date, updateArray[updateArray.length - 1].id ]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(201).send("Commitments due_date updated successfully");
    } catch (err) {
        // Rollback the transaction in case of error
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//put edit for commits delivered
router.put("/omit/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const query = `UPDATE commitment SET state = 'omited', timestamp = current_timestamp WHERE id = $1`;

        const omitCommit = await pool.query(query, [id]);
        res.status(200).json(`commit with id ${id} omited`);
    } catch (err) {

            console.error(err.message);
            res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;