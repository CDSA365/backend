import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    create_seo_record,
    delete_seo_record,
    get_active_seo_config,
    read_all_seo_record,
} from "../queries/admin_queries";

export default class SeoController {
    protected readonly db: DB;

    constructor() {
        this.db = new DB();
    }

    public get = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_active_seo_config
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public create = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(
                create_seo_record,
                req.body
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error creating SEO record");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public readAll = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                read_all_seo_record
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public update = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
        } catch (error: any) {
        } finally {
            conn.release();
        }
    };

    public delete = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { id } = req.params;
            const [result] = await conn.query<ResultSetHeader>(
                delete_seo_record,
                [id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error deleting record");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public activate = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const ids = req.body.map((item: any) => item.id);
        const caseQuery = req.body.map(
            (item: { id: number; status: number }) =>
                `WHEN ${item.id} THEN ${item.status}`
        );
        const query = `UPDATE seo_config SET status = (CASE id ${caseQuery.join(
            " "
        )} END) WHERE id in (${ids.join(", ")})`;
        try {
            const [result] = await conn.query<ResultSetHeader>(query);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error updating SEO Config");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
