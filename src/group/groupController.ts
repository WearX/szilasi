import { Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export const createGroup = async (req: any, res: Response) => {
    try {
        const creatorId = req.user.userId;
        const creatorEmail = req.user.email;
        const { name, members } = req.body; 

        if (!members || members.length < 2) {
            return res.status(400).json({ error: "Legalább 2 embert válassz ki!" });
        }

        const db = await mysql.createConnection(config.database);
        
        const [resGroup]: any = await db.query(
            "INSERT INTO `groups` (name, createdBy) VALUES (?, ?)", 
            [name, creatorId]
        );
        const groupId = resGroup.insertId;

        const allMembers = [...members, creatorEmail];
        for (const email of allMembers) {
            await db.query("INSERT INTO group_members (groupId, userEmail) VALUES (?, ?)", [groupId, email]);
        }

        await db.end();
        return res.status(201).json({ message: "Csoport kész!", groupId, name });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Hiba történt" });
    }
};

export const getUserGroups = async (req: any, res: Response) => {
    try {
        const db = await mysql.createConnection(config.database);
        const [groups] = await db.query(
            `SELECT g.id, g.name FROM \`groups\` g 
             JOIN group_members gm ON g.id = gm.groupId 
             WHERE gm.userEmail = ?`, 
            [req.user.email]
        ) as any;
        await db.end();
        return res.json(groups);
    } catch (err) {
        return res.status(500).json({ error: "Hiba" });
    }
};