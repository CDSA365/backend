import { Request, Response } from "express";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    create_announcement,
    delete_announcement,
    fetch_announcement,
    find_announcement,
} from "../queries/admin_queries";

export default class AnnouncementController {
    protected db: DB;
    constructor() {
        this.db = new DB();
    }

    public getAnnouncements = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                fetch_announcement
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public makeAnouncement = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            req.body.start_time = moment(req.body.start_time).toISOString();
            req.body.end_time = moment(req.body.end_time).toISOString();
            const [result] = await conn.query<ResultSetHeader>(
                create_announcement,
                req.body
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to make announcement");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public deleteAnnouncement = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { id } = req.params;
        try {
            const [result] = await conn.query<ResultSetHeader>(
                delete_announcement,
                [id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to delete announcement");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public findAnnouncement = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { entity } = req.params;
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                find_announcement,
                [entity.toUpperCase()]
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
