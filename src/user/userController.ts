import config from "../config/config"
import mysql from "mysql2/promise"
import jwt from "jsonwebtoken"
import { User } from "./user"
import { uploadAvatarMiddleware } from "../middleware/upload"
import { File } from "../file/file"

const isDuplicateEmailError = (err: any): boolean => {
    return err?.code === "ER_DUP_ENTRY" || err?.errno === 1062
}

export const signIn = async (req: any, res: any) => {
    const { email, password } = req.body
    if (!(email && password)) {
        return res.status(400).send({ error: "Nem megfelelően megadott adatok!" })
    }

    const connection = await mysql.createConnection(config.database)
    try {
        const [results] = await connection.query('select login(?,?) as id', [email, password]) as Array<any>

        if (!results[0].id) {
            return res.status(401).send({ error: "Nem megfelelő felhasználónév vagy jelszó!" })
        }
        if (!config.jwtSecret) {
            return res.status(400).send({ error: "Hiba a titkos kulcsnál!" })
        }
        const token = jwt.sign({ userId: results[0].id, email }, config.jwtSecret, { expiresIn: "2h" })

        res.status(200).send({ token: token })
    } catch (e) {
        console.log(e)
        res.status(500).send({ error: "Szerver hiba történt" })
    }
}

export const signUp = async (req: any, res: any) => {
    try {
        await uploadAvatarMiddleware(req, res)

        const userBody: Partial<User> = req.body
        
        if (!userBody.email || !userBody.password) {
            if (req.file) {
                new File(req.file).deleteFileDir()
            }
            return res.status(400).send({ error: "Hiányzó adat: Email és jelszó kötelező!" })
        }

        const user: User = new User(userBody as Partial<User>)
        
        await user.saveToDatabase(req.file || null)
        
        if (!config.jwtSecret) {
            return res.status(400).send({ error: "Hiba a titkos kulcsnál!" })
        }
        const token = jwt.sign({ userId: user.userId, email: user.email }, config.jwtSecret, { expiresIn: "2h" })
        res.status(200).send({ token: token, user: user.getUserData() })

    } catch (err) {
        if (req.file) {
            new File(req.file).deleteFileDir()  
        }
        if (isDuplicateEmailError(err)) {
            return res.status(409).send({ error: "Ez az email cím már regisztrált!" })
        }
        res.status(500).send({ error: "Szerver hiba történt" })
    }
}

export const changeAvatar = async (req:any, res:any) => {
    try {
        await uploadAvatarMiddleware(req, res)
        
        if (req.file === undefined) {
            return res.status(400).send({ error: "Töltsön fel fájlt!" })
        }
        
        const file: File = new File(req.file, req.user.userId)
        const user = new User()
        await user.loadDataFromDb(req.user.userId)
        const oldAvatar = user.avatar
        
        user.avatar = req.file.filename
        await file.saveToDatabase()
        await user.updateAvatar()
        
        const oldFile = new File()
        if (oldAvatar) {
            await oldFile.loadDataFromDb(oldAvatar)
            await oldFile.deleteFromDatabaseAndDir()
        }
        
        res.status(200).send({ message: `A fájl feltöltése sikerült! ${req.file.originalname}` })
    }
    catch (err) {
        res.status(500).send({
            error: `A fájl feltöltés nem sikerült! ` + err
        })
    }
}