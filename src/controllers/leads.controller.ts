import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import { formatPhone } from "../helpers/helpers";
import {
    add_leads,
    delete_leads,
    get_leads,
    update_leads,
} from "../queries/admin_queries";

export default class LeadsController {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public addLead = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            req.body.phone = formatPhone(req.body.phone);
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

    public deleteLeads = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { lead_id } = req.params;
        try {
            const [result] = await conn.query<ResultSetHeader>(delete_leads, [
                lead_id,
            ]);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to delete lead.");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public updateLeads = async (req: Request, res: Response) => {
        const { lead_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(update_leads, [
                req.body,
                lead_id,
            ]);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to update lead status.");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
