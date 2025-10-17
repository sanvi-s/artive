"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.getUser = getUser;
exports.updateUser = updateUser;
const User_1 = require("../models/User");
const authController_1 = require("./authController");
Object.defineProperty(exports, "authMiddleware", { enumerable: true, get: function () { return authController_1.authMiddleware; } });
async function getUser(req, res) {
    const { id } = req.params;
    const user = await User_1.User.findById(id, { username: 1, displayName: 1, avatarUrl: 1, bannerUrl: 1, bio: 1 }).lean();
    if (!user)
        return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ id: user._id, ...user });
}
async function updateUser(req, res) {
    const { id } = req.params;
    if (req.userId !== id)
        return res.status(403).json({ error: { message: 'Forbidden' } });
    const { displayName, avatarUrl, bannerUrl, bio } = req.body || {};
    const updated = await User_1.User.findByIdAndUpdate(id, { $set: { displayName, avatarUrl, bannerUrl, bio } }, { new: true, projection: { username: 1, displayName: 1, avatarUrl: 1, bannerUrl: 1, bio: 1 } }).lean();
    return res.json({ id: updated?._id, ...updated });
}
