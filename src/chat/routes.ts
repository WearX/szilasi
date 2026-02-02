import { Router } from "express"
import verifyToken from "../middleware/auth"
import { pool } from "./db"

const router = Router()

router.get("/rooms/:room/messages", verifyToken, async (req: any, res: any) => {
  try {
    const room = String(req.params.room || "general")
    const limit = Math.min(Number(req.query.limit || 50), 200)

    const [rows] = await pool.query(
      `
      SELECT m.id, m.room, m.text, UNIX_TIMESTAMP(m.created_at) * 1000 AS ts,
             u.userId, u.email, u.avatar
      FROM chat_room_messages m
      JOIN users u ON u.userId = m.from_user_id
      WHERE m.room = ?
      ORDER BY m.id DESC
      LIMIT ?
      `,
      [room, limit]
    )

    const data = (rows as any[]).reverse().map(r => ({
      type: "room_message",
      room: r.room,
      from: { userId: r.userId, email: r.email, avatar: r.avatar },
      text: r.text,
      ts: Number(r.ts),
      id: r.id
    }))

    return res.status(200).send(data)
  } catch (e) {
    console.error("room history error:", e)
    return res.status(500).send({ error: "Szoba history hiba" })
  }
})

router.get("/dm/:otherUserId/messages", verifyToken, async (req: any, res: any) => {
  try {
    const meId = Number(req.user?.userId)
    const otherId = Number(req.params.otherUserId)
    const limit = Math.min(Number(req.query.limit || 50), 200)

    if (!meId || !otherId) return res.status(400).send({ error: "Hibás userId" })

    const [rows] = await pool.query(
      `
      SELECT m.id, m.from_user_id, m.to_user_id, m.text, UNIX_TIMESTAMP(m.created_at) * 1000 AS ts,
             u.userId, u.email, u.avatar
      FROM chat_private_messages m
      JOIN users u ON u.userId = m.from_user_id
      WHERE (m.from_user_id = ? AND m.to_user_id = ?)
         OR (m.from_user_id = ? AND m.to_user_id = ?)
      ORDER BY m.id DESC
      LIMIT ?
      `,
      [meId, otherId, otherId, meId, limit]
    )

    const data = (rows as any[]).reverse().map(r => ({
      type: "private_message",
      from: { userId: r.userId, email: r.email, avatar: r.avatar },
      toUserId: Number(r.to_user_id),
      text: r.text,
      ts: Number(r.ts),
      id: r.id
    }))

    return res.status(200).send(data)
  } catch (e) {
    console.error("dm history error:", e)
    return res.status(500).send({ error: "DM history hiba" })
  }
})

export default router
