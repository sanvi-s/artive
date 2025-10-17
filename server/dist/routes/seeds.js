"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const seedController_1 = require("../controllers/seedController");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const writeLimiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 30 });
router.get('/', seedController_1.listSeeds);
router.get('/:id', seedController_1.getSeed);
router.get('/:id/details', seedController_1.getSeedOrFork);
router.post('/', authController_1.authMiddleware, writeLimiter, seedController_1.createSeed);
router.put('/:id', authController_1.authMiddleware, writeLimiter, seedController_1.updateSeed);
router.delete('/:id', authController_1.authMiddleware, writeLimiter, seedController_1.softDeleteSeed);
exports.default = router;
