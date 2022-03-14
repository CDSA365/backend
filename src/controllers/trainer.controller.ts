import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    create_trainer,
    fetch_trainers,
    find_trainer,
} from "../queries/admin_queries";

const db = new DB();

export default class TrainerController {
    constructor() {}

    public createTrainer = async (req: Request, res: Response) => {
        const conn = await db.getConnection();
        try {
            const { first_name, last_name, email } = req.body;
            const [[{ count }]] = await conn.query<RowDataPacket[]>(
                find_trainer,
                [email]
            );
            if (count) {
                res.status(422).json({
                    error: true,
                    message: "Trainer exists!",
                });
            } else {
                const [result] = await conn.query<ResultSetHeader>(
                    create_trainer,
                    [first_name, last_name, email]
                );
                if (result) {
                    res.status(200).json({
                        success: true,
                        id: result.insertId,
                    });
                }
            }
        } catch (error: any) {
            res.status(500).json({
                error: true,
                message: error.message,
            });
        } finally {
            conn.release();
        }
    };

    public fetchTrainers = async (req: Request, res: Response) => {
        const conn = await db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(fetch_trainers);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json(error.message);
        } finally {
            conn.release();
        }
    };
}
