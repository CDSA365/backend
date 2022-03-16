import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import DB from "../constructs/db";
import {
    create_trainer,
    fetch_trainers,
    find_trainer,
    find_user,
    find_user_by_id,
    update_invite_status,
} from "../queries/admin_queries";
import EmailService from "../services/email-service";

const db = new DB();

export default class TrainerController {
    protected emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

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

    public findTrainerById = async (req: Request, res: Response) => {};

    public sendInvite = async (req: Request, res: Response) => {
        const { id } = req.body;
        const conn = await db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                find_user_by_id,
                [id]
            );
            if (!result.length) {
                res.status(404).json({
                    error: true,
                    message: "Trainer not found!",
                });
            } else {
                const promises = result.map((trainer: any) => {
                    const name = `${trainer.first_name} ${trainer.last_name}`;
                    const to = trainer.email;
                    const subject = "Invitation to register";
                    const template = "registeration-invite";
                    return this.emailService.sendMail(to, subject, template);
                });
                const resp = await Promise.allSettled(promises);
                const statusPromises = resp.map((res: any) => {
                    if (res.value.sent) {
                        return this.updateInviteStatus(res.value.email, conn);
                    }
                });
                const statusResp = await Promise.allSettled(statusPromises);
                res.status(200).json(statusResp);
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    protected updateInviteStatus = (
        email: string,
        conn: PoolConnection
    ): Promise<number> => {
        return new Promise(async (resolve, reject) => {
            try {
                const [result] = await conn.query<ResultSetHeader>(
                    update_invite_status,
                    [email]
                );
                result ? resolve(1) : reject(0);
            } catch (error) {
                console.log(error);
                reject(0);
            }
        });
    };
}
