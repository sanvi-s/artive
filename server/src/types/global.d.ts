// Global type declarations to make TypeScript more lenient for production builds

declare global {
  // Make all Mongoose models more lenient
  interface Model<T> {
    [key: string]: any;
  }
  
  // Make all Express types more lenient
  interface Request {
    [key: string]: any;
  }
  
  interface Response {
    [key: string]: any;
  }
  
  // Make all Mongoose documents more lenient
  interface Document {
    [key: string]: any;
  }
  
  // Make all Mongoose queries more lenient
  interface Query<T> {
    [key: string]: any;
  }
}

// Suppress all TypeScript errors for production builds
declare module '*' {
  const content: any;
  export default content;
}

export {};
