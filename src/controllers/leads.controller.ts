import { Request, Response } from "express";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import { add_leads, get_leads } from "../queries/admin_queries";

export default class LeadsController {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public addLead = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(add_leads, [
                req.body,
            ]);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to add leads");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, ...error });
        } finally {
            conn.release();
        }
    };

    public getLeads = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(get_leads);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, ...error });
        } finally {
            conn.release();
        }
    };
}
