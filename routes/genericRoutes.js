const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");

//generic get handler for tables
router.get("/:table", isAuthenticated, async (req, res) => {


        const { table } = req.params;
        const validTables = ["student", "program"];
        
        if (!validTables.includes(table)) {
            return res.status(400).json({ error: "Invalid table name" });
        }
        
        try {
            const result = await pool.query(`SELECT * FROM ${table} WHERE active IS TRUE`);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Internal server error" });
        }

});

module.exports = router;