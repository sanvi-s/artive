"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({
        ok: true,
        env: config_1.config.env,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: config_1.config.version
    });
});
router.get('/version', (_req, res) => {
    res.json({ version: config_1.config.version });
});
router.get('/config', (_req, res) => {
    res.json({
        apiBase: config_1.config.apiBaseUrl,
        cloudinaryCloudName: config_1.config.cloudinary.cloudName,
    });
});
exports.default = router;
