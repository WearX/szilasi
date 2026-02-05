import dotenv from "dotenv"
import multer from "multer"
import util from "util"
import config from "../config/config"
dotenv.config()



const storage = multer.diskStorage({
    destination: (_req,_file,cb) => {
        cb(null,config.baseDir + config.uploadDir)
    }
})

const avatarStorage = multer.diskStorage({
    destination: (_req,_file,cb) => {
        cb(null,config.baseDir + config.uploadDir)
    }
})

const uploadFile = multer ({
    storage: avatarStorage,
    limits:{fileSize: config.maxSize}
}).single("file")


const uploadAvatar = multer ({
    storage: storage,
    limits:{fileSize: config.maxSize},
    fileFilter: (_req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            return cb(new Error('Invalid mime type'));
        }
    }
}).single("avatar")

const uploadFiles =  multer ({
    storage: storage,
    limits:{fileSize: config.maxSize}
}).array("files",10)

const uploadChatImage = multer({
    storage: storage,
    limits: { fileSize: config.maxSize },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            return cb(new Error('Only images allowed'));
        }
    }
}).single("image")

export const uploadMiddleware = util.promisify(uploadFile)
export const uploadAvatarMiddleware = util.promisify(uploadAvatar)
export const uploadMiddlewareMultiple = util.promisify(uploadFiles)
export const uploadChatImageMiddleware = util.promisify(uploadChatImage)