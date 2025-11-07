import { Mongoose, mongoose, } from 'mongoose';

const videoSchema = new mongoose.Schema(

{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    title:{
        type:String,
        required:[true,'Please add a title'],
        trim:true
    },
    originalFileName:{
        type:String,
        required:[true,'Please add a Filename'],
        trim:true
    },
    filePath:{
        type:String,
        required:[true,'Please add a FilePath'],
        trim:true
    },
    fileSize:{
        type:Number,
        required:true,
    },
    processingStatus:{
        type:String,
        enum:['pending','processing','analyzing','complete','failed'],
        default:'pending'
    },
    sensitivityStatus:{
        type:String,
        enum:['unknown','flagged','safe'],
        default:'unknown'
    }
},
    {
        timestamps:true
    }
);


const Video = mongoose.model('Video',videoSchema)
export default Video;