import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import config from "../config/config";
import url from "url";
import mysql from "mysql2/promise";

const wss = new WebSocketServer({ port: 8080 });

async function getGroupMembers(groupId: number) {
    const conn = await mysql.createConnection(config.database);
    const [rows]: any = await conn.query("SELECT userEmail FROM group_members WHERE groupId = ?", [groupId]);
    await conn.end();
    return rows.map((r: any) => r.userEmail);
}

function updateUsers() {
    const users = [...new Set(Array.from(wss.clients).map((c: any) => c.email).filter(e => e))];
    wss.clients.forEach((client: any) => {
        if (client.readyState === 1) client.send(JSON.stringify({ type: "users", users }));
    });
}

wss.on("connection", async (ws: any, req) => {
    try {
        const token = url.parse(req.url!, true).query.token as string;
        ws.email = (jwt.verify(token, config.jwtSecret!) as any).email;
    } catch { return ws.close(); }
    
    updateUsers();

    ws.on("message", async (msg: any) => {
        const data = JSON.parse(msg);
        const { message, targetEmail, groupId, type, members } = data;

        if (type === "newGroup") {
            const targets = [...members, ws.email];
            
            wss.clients.forEach((client: any) => {
                if (client.readyState === 1 && targets.includes(client.email)) {

                    client.send(JSON.stringify({ type: "updateGroups" }));
                }
            });
            return;
        }

        if (groupId) {
            const groupMembers = await getGroupMembers(groupId);
            const resp = JSON.stringify({ type: "group", groupId, senderEmail: ws.email, message });

            wss.clients.forEach((client: any) => {
                if (client.readyState === 1 && groupMembers.includes(client.email)) {
                    client.send(resp);
                }
            });
        } 
        else {
            const resp = JSON.stringify({
                type: targetEmail ? "private" : "broadcast",
                senderEmail: ws.email,
                receiverEmail: targetEmail || null,
                message
            });
            wss.clients.forEach((client: any) => {
                if (client.readyState === 1 && (!targetEmail || client.email === targetEmail || client === ws)) {
                    client.send(resp);
                }
            });
        }
    });

    ws.on("close", updateUsers);
});