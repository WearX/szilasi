import { Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export const getMessages = async (req: any, res: Response) => {
    try {
        const email = req.user.email;
        const db = await mysql.createConnection(config.database);
        
        const [msgs] = await db.query(`
            SELECT m.* FROM messages m
            LEFT JOIN group_members gm ON m.groupId = gm.groupId AND gm.userEmail = ?
            WHERE 
            (m.groupId IS NULL AND (m.receiverEmail = ? OR m.senderEmail = ? OR m.receiverEmail IS NULL))
            OR 
            (m.groupId IS NOT NULL AND gm.userEmail IS NOT NULL)
        `, [email, email, email]) as any;
        
        await db.end();
        res.json(msgs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Adatbázis hiba" });
    }
};

export const createMessage = async (req: any, res: Response) => {
    try {
        const sender = req.user.email;
        const { message, targetEmail, groupId } = req.body;
        const db = await mysql.createConnection(config.database);
        
        await db.query(
            "INSERT INTO messages (senderEmail, receiverEmail, groupId, message) VALUES (?, ?, ?, ?)", 
            [sender, targetEmail || null, groupId || null, message]
        );
        await db.end();
        res.status(201).json({ message: "Elküldve" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Hiba" });
    }
};

export const deleteMessages = async (_req: any, res: Response) => {
    res.json({ message: "Törlés funkció" }); 
};