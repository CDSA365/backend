import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import { find_admin, get_all_users } from "../queries/admin_queries";

export default class AdminController {
    private readonly db: DB;

    constructor() {
        this.db = new DB();
    }

    public getAdmin = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
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

    public getAllAdmins = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(get_all_users);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
