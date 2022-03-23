import { Request, Response } from "express";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    create_class,
    delete_class,
    fetch_classes,
    udpate_class,
} from "../queries/admin_queries";

export default class ClassController {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public createClass = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const data = {
                title: req.body.title,
                description: req.body.description,
                start_time: moment(req.body.start).toISOString(),
                end_time: moment(req.body.end).toISOString(),
                status: req.body.status ?? 0,
            };
            const [result] = await conn.query<ResultSetHeader>(create_class, [
                data,
            ]);
            if (result.affectedRows) {
                res.status(200).json({
                    success: true,
                    message: `class "${req.body.title}" created.`,
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: "Error creating class",
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public fetchclasses = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(fetch_classes);
            res.status(200).json(result);
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public updateClass = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { id, status } = req.body;
        const updateValue = { status: status };
        try {
            const [result] = await conn.query<ResultSetHeader>(udpate_class, [
                updateValue,
                id,
            ]);
            if (result.affectedRows) {
                res.status(200).json({
                    success: true,
                    message: "Class published",
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: "Class cannot be published",
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public deleteClass = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { id } = req.params;
        try {
            const [result] = await conn.query<ResultSetHeader>(delete_class, [
                id,
            ]);
            if (result.affectedRows) {
                res.status(200).json({
                    success: true,
                    message: `Class deleted`,
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: `Class cannot be deleted`,
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
