declare module 'streamifier' {
  import { Readable } from 'stream';
  const streamifier: {
    createReadStream(buffer: Buffer, options?: any): Readable;
  };
  export = streamifier;
}


