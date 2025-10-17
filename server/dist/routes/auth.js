"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const authController_2 = require("../controllers/authController");
const router = (0, express_1.Router)();
const writeLimiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 10 });
router.post('/register', writeLimiter, authController_1.register);
router.post('/login', writeLimiter, authController_1.login);
router.get('/me', authController_2.authMiddleware, authController_1.me);
exports.default = router;
