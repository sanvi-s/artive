"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
exports.deleteFromCloudinary = deleteFromCloudinary;
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinaryService_1 = require("../services/cloudinaryService");
async function uploadToCloudinary(req, res) {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: { message: 'Missing file field' } });
    // Validate file type
    if (!file.mimetype?.startsWith('image/')) {
        return res.status(400).json({ error: { message: 'Only image files are allowed' } });
    }
    // Validate file size (additional check beyond multer)
    if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: { message: 'File too large. Maximum size is 10MB.' } });
    }
    const folder = req.body?.folder || 'artive/uploads';
    const publicId = req.body?.public_id;
    try {
        try {
            console.debug(`[uploads] incoming upload`, { folder, publicId, size: file.size, mimetype: file.mimetype });
        }
        catch { }
        // Add timeout to prevent hanging uploads
        const uploadResult = await Promise.race([
            new Promise((resolve, reject) => {
                const upload = cloudinaryService_1.cloudinary.uploader.upload_stream({
                    folder,
                    public_id: publicId,
                    resource_type: 'auto',
                    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                    timeout: 30000, // 30 second timeout
                }, (err, result) => (err ? reject(err) : resolve(result)));
                streamifier_1.default.createReadStream(file.buffer).pipe(upload);
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000))
        ]);
        try {
            console.debug(`[uploads] uploaded`, { public_id: uploadResult.public_id, url: uploadResult.secure_url, width: uploadResult.width, height: uploadResult.height });
        }
        catch { }
        return res.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
        });
    }
    catch (err) {
        try {
            console.error(`[uploads] error`, err?.message || err);
        }
        catch { }
        // Provide more specific error messages
        let errorMessage = 'Upload failed';
        if (err.message?.includes('timeout')) {
            errorMessage = 'Upload timed out. Please try again with a smaller image.';
        }
        else if (err.message?.includes('File too large')) {
            errorMessage = 'File is too large. Maximum size is 10MB.';
        }
        else if (err.message) {
            errorMessage = err.message;
        }
        return res.status(500).json({ error: { message: errorMessage } });
    }
}
async function deleteFromCloudinary(req, res) {
    const { public_id } = req.params;
    if (!public_id)
        return res.status(400).json({ error: { message: 'Missing public_id' } });
    try {
        const result = await cloudinaryService_1.cloudinary.uploader.destroy(public_id, { invalidate: true });
        return res.json({ result });
    }
    catch (err) {
        return res.status(500).json({ error: { message: err.message } });
    }
}
