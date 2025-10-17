// Override Mongoose types to be more lenient for production builds
declare module 'mongoose' {
  interface Model<T> {
    find(...args: any[]): any;
    findById(...args: any[]): any;
    findByIdAndUpdate(...args: any[]): any;
    findOne(...args: any[]): any;
    findOneAndUpdate(...args: any[]): any;
    create(...args: any[]): any;
    updateMany(...args: any[]): any;
    updateOne(...args: any[]): any;
    deleteOne(...args: any[]): any;
    deleteMany(...args: any[]): any;
    countDocuments(...args: any[]): any;
    aggregate(...args: any[]): any;
  }
  
  interface Document {
    save(...args: any[]): any;
    toObject(...args: any[]): any;
  }
  
  interface Query<T> {
    lean(...args: any[]): any;
    populate(...args: any[]): any;
    sort(...args: any[]): any;
    limit(...args: any[]): any;
    skip(...args: any[]): any;
    select(...args: any[]): any;
    exec(...args: any[]): any;
  }
}
