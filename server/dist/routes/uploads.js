"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const writeLimiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 15 });
router.post('/', writeLimiter, upload.single('file'), uploadController_1.uploadToCloudinary);
router.delete('/:public_id', writeLimiter, uploadController_1.deleteFromCloudinary);
exports.default = router;
