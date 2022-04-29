import DB from "../constructs/db";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { get_counts_report } from "../queries/admin_queries";

export default class DashController {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public getCounts = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(
                get_counts_report
            );
            if (result) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to get count data");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, ...error });
        } finally {
            conn.release();
        }
    };
}
