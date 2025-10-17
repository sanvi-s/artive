"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const forkController_1 = require("../controllers/forkController");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)({ mergeParams: true });
const writeLimiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 30 });
router.get('/', forkController_1.listForks);
router.get('/:id', forkController_1.getFork);
router.post('/:id', authController_1.authMiddleware, writeLimiter, forkController_1.createFork);
router.delete('/:id', authController_1.authMiddleware, forkController_1.deleteFork);
exports.default = router;
