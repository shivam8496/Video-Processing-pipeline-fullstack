import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
    destination:'./uploads/',
    filename:function(req ,file ,cb){
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()*1e9);
        cb(null,file.fieldname+'-'+uniqueSuffix+path.extname(file.originalname));
    }
});


function checkFiletype(file,cb){
    const filetypes = /mp4|mov|avi|mkv|webm/ ;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    }
    else {
        cb("error only videos with extention with (.mp4 , .mov , .avi , .mkv , .webm) Allowed !!");
    }

};



const upload = multer({
    storage:storage,
    limits : {fileSize:100*1024*1024} ,//100 mb
    fileFilter:function(req , file ,cb){
        checkFiletype(file,cb);
    }
})

export {upload};