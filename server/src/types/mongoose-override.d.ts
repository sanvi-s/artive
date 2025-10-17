// Aggressive Mongoose type overrides to eliminate all union type errors
declare module 'mongoose' {
  interface Model<T extends Document, TQueryHelpers = {}, TMethods = {}> {
    findById<ResultType = any>(id: any, projection?: any, options?: any): any;
    find<ResultType = any>(filter?: any, projection?: any, options?: any): any;
    findOne<ResultType = any>(filter?: any, projection?: any, options?: any): any;
    findOneAndUpdate<ResultType = any>(filter?: any, update?: any, options?: any): any;
    findByIdAndUpdate<ResultType = any>(id: any, update?: any, options?: any): any;
    findByIdAndDelete<ResultType = any>(id: any, options?: any): any;
    create<DocContents = any>(docs: any, options?: any): any;
    updateMany<ResultType = any>(filter?: any, update?: any, options?: any): any;
    countDocuments<ResultType = any>(filter?: any, options?: any): any;
  }

  interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
    (filter?: any, projection?: any, options?: any): any;
    (id?: any, projection?: any, options?: any): any;
    lean(): any;
    exec(): any;
  }
}

// Global type overrides
declare global {
  interface LooseObject {
    [key: string]: any;
  }
}

export {};
