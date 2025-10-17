"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lineageController_1 = require("../controllers/lineageController");
const router = (0, express_1.Router)();
router.get('/:id', lineageController_1.getLineage);
router.get('/:id/export', lineageController_1.exportLineage);
exports.default = router;
