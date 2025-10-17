"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ sub: userId }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
}
async function register(req, res) {
    const { email, username, displayName, password } = req.body || {};
    if (!email || !username || !displayName || !password) {
        logger_1.logger.warn(`register: missing fields email=${!!email} username=${!!username} displayName=${!!displayName}`);
        return res.status(400).json({ error: { message: 'Missing fields' } });
    }
    const emailLower = String(email).toLowerCase();
    const existingByEmail = await User_1.User.findOne({ email: emailLower }).lean();
    if (existingByEmail) {
        logger_1.logger.info(`register: email taken ${emailLower}`);
        return res.status(409).json({ error: { message: 'Email taken' } });
    }
    const existingByUsername = await User_1.User.findOne({ username }).lean();
    if (existingByUsername) {
        logger_1.logger.info(`register: username taken ${username}`);
        return res.status(409).json({ error: { message: 'Username taken' } });
    }
    const passwordHash = await bcrypt_1.default.hash(String(password), 10);
    const user = await User_1.User.create({ email: emailLower, username, displayName, passwordHash });
    const token = signToken(String(user._id));
    logger_1.logger.info(`register: success userId=${user._id}`);
    return res.json({ token, user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName } });
}
async function login(req, res) {
    const { identifier, username, password } = req.body || {};
    const id = identifier || username; // backward compatible
    if (!id || !password) {
        logger_1.logger.warn(`login: missing fields identifier=${!!id}`);
        return res.status(400).json({ error: { message: 'Missing fields' } });
    }
    const query = id.includes('@') ? { email: String(id).toLowerCase() } : { username: id };
    const user = await User_1.User.findOne(query);
    if (!user || !user.passwordHash) {
        logger_1.logger.info(`login: invalid credentials for ${JSON.stringify(query)}`);
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    const ok = await bcrypt_1.default.compare(String(password), user.passwordHash);
    if (!ok) {
        logger_1.logger.info(`login: password mismatch for userId=${user._id}`);
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    const token = signToken(String(user._id));
    logger_1.logger.info(`login: success userId=${user._id}`);
    return res.json({ token, user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName } });
}
async function me(req, res) {
    if (!req.userId)
        return res.status(401).json({ error: { message: 'Unauthorized' } });
    const user = await User_1.User.findById(req.userId).lean();
    if (!user)
        return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ id: user._id, email: user.email, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl, bannerUrl: user.bannerUrl });
}
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: { message: 'Missing Authorization header' } });
    const token = header.replace('Bearer ', '');
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ error: { message: 'Invalid token' } });
    }
}
