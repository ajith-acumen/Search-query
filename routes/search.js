const express = require("express");
const router = express.Router();

const searchService = require("../services/searchService");

router.post("/", (req, res) => {
    const results = searchService(req.body);
    res.json(results);
});

module.exports = router;