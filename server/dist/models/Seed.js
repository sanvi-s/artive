"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seed = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SeedSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, maxlength: 120 },
    contentSnippet: { type: String, maxlength: 400 },
    contentFull: { type: String, maxlength: 20000 },
    contentIsExternal: { type: Boolean, default: false },
    type: { type: String, enum: ['poem', 'visual', 'music', 'code', 'other'], default: 'other', index: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    forkCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: { type: [String], index: true },
    thumbnailUrl: { type: String },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });
SeedSchema.index({ type: 1, createdAt: -1 });
SeedSchema.index({ title: 'text', contentSnippet: 'text' });
exports.Seed = mongoose_1.default.models.Seed || mongoose_1.default.model('Seed', SeedSchema);
