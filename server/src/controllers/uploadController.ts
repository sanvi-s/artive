import type { Request, Response } from 'express';
import streamifier from 'streamifier';
import { cloudinary } from '../services/cloudinaryService';

export async function uploadToCloudinary(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: { message: 'Missing file field' } });
  const folder = (req.body?.folder as string) || 'artive/uploads';
  const publicId = req.body?.public_id as string | undefined;

  try {
    try { console.debug(`[uploads] incoming upload`, { folder, publicId, size: file.size, mimetype: file.mimetype }); } catch {}
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });

    try { console.debug(`[uploads] uploaded`, { public_id: uploadResult.public_id, url: uploadResult.secure_url, width: uploadResult.width, height: uploadResult.height }); } catch {}
    return res.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (err: any) {
    try { console.error(`[uploads] error`, err?.message || err); } catch {}
    return res.status(500).json({ error: { message: err.message } });
  }
}

export async function deleteFromCloudinary(req: Request, res: Response) {
  const { public_id } = req.params as { public_id: string };
  if (!public_id) return res.status(400).json({ error: { message: 'Missing public_id' } });
  try {
    const result = await cloudinary.uploader.destroy(public_id, { invalidate: true });
    return res.json({ result });
  } catch (err: any) {
    return res.status(500).json({ error: { message: err.message } });
  }
}



