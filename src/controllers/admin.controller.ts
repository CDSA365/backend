import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import { find_admin } from "../queries/admin_queries";

const db = new DB();

export default class AdminController {
    constructor() {}

    public getAdmin = async (req: Request, res: Response) => {
        const conn = await db.getConnection();
        try {
            const { id } = req.params;
            if (id) {
                const [[result]] = await conn.query<RowDataPacket[]>(
                    find_admin,
                    [id]
                );
                if (result) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({
                        error: true,
                        message: "User not found!",
                    });
                }
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
