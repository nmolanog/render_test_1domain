const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");

//gets
//get handler for appointments associated to commit_id
router.get("/search4commit_id/:commit_id", isAuthenticated, async (req, res) => {
    const { commit_id } = req.params;

    try {
        const text = `SELECT * FROM appointment_app WHERE commit_id = $1`;

        // Execute the query
        const result = await pool.query(text, [commit_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//gets
//get handler for appointments associated to commit_id
router.get("/searchallappo/:enroll_id", isAuthenticated, async (req, res) => {
    const { enroll_id } = req.params;

    try {
        const text = `SELECT apo_date FROM appointment_app WHERE enroll_id = $1 AND apo_date IS NOT NULL`;
        // Execute the query
        const result = await pool.query(text, [enroll_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//posts
//post appointment
router.post("/insert", isAuthenticated, async (req, res) => {
    try {
        const enrollment = req.body;
        const values = Object.values(enrollment);
        const columns = Object.keys(enrollment).join(', ');
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const query = `INSERT INTO appointment (${columns}) VALUES(${placeholders}) RETURNING id`;
        const newEnrollment = await pool.query(query, values);

        res.status(201).json(newEnrollment.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//puts
//put edit for students, edit-delete logic
router.put("/fullfile/:id", isAuthenticated, async (req, res) => {

    try {
        const { id } = req.params;
        const data = req.body;
        
        const values = Object.values(data);
        const columns = Object.keys(data);
        const colValuePair = columns.map((col, index) => `${col}=$${index + 1}`).join(', ');
        values.push(id);
        const indexId = values.length;
        console.log()
        const query = `UPDATE appointment SET ${colValuePair}, timestamp = current_timestamp WHERE id = $${indexId}`;      

        const updateAppoitnment = await pool.query(query, values);
        res.status(200).json(`Aopointment with id ${id} updated`);
    } catch (err) {       
            // Generic error handling
            console.error(err.message);
            res.status(500).json({ error: "Internal Server Error - /appointment/fullfile/:id" });
    }

});

router.put("/deactivate/:id", isAuthenticated, async (req, res) => {

    const { id } = req.params;
    try {
        const query = `UPDATE appointment SET active = FALSE , timestamp = current_timestamp, inactive_descr = 'delete' WHERE id = $1`;

        const deleteAppo = await pool.query(query, [id]);

        res.status(200).json(`appointment with id ${id} deactivated`);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    } 
});


module.exports = router;