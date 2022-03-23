import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import DB from "../constructs/db";
import {
    add_to_class_category,
    add_to_student_category,
    add_to_trainer_category,
    create_trainer,
    fetch_all_trainers,
    fetch_trainers,
    find_one_trainer,
    find_trainer,
    find_user,
    find_user_by_id,
    update_invite_status,
} from "../queries/admin_queries";
import DataTransformer from "../services/data-transform-service";
import EmailService from "../services/email-service";
import { InvitationEmailContext, TransportInfo } from "../types/types";

export default class TrainerController {
    protected emailService: EmailService;
    protected transformer: DataTransformer;
    protected db: DB;

    constructor() {
        this.db = new DB();
        this.emailService = new EmailService();
        this.transformer = new DataTransformer();
    }

    public createTrainer = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
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

    public fetchAllTrainers = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                fetch_all_trainers
            );
            if (result.length) {
                const newData = this.transformer.transformForCategories(result);
                res.status(200).json(newData);
            } else {
                res.status(200).json(result);
            }
        } catch (error: any) {
            res.status(500).json(error.message);
        } finally {
            conn.release();
        }
    };

    public fetchTrainers = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(fetch_trainers);
            if (result.length) {
                const newData = this.transformer.transformForCategories(result);
                res.status(200).json(newData);
            } else {
                res.status(200).json(result);
            }
        } catch (error: any) {
            res.status(500).json(error.message);
        } finally {
            conn.release();
        }
    };

    public getTrainer = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { id } = req.params;
            const [result] = await conn.query<RowDataPacket[]>(
                find_one_trainer,
                [id]
            );
            if (result.length) {
                const [TR] = this.transformer.transformForCategories(result);
                res.status(200).json(TR);
            } else {
                res.status(404).json({
                    error: true,
                    message: "Trainer not found",
                });
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

    public sendInvite = async (req: Request, res: Response) => {
        const { id } = req.body;
        const conn = await this.db.getConnection();
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
                    const info: TransportInfo = {
                        to: trainer.email,
                        subject: "Invitation to join CDSA 365",
                    };
                    const context: InvitationEmailContext = {
                        first_name: trainer.first_name,
                        last_name: trainer.last_name,
                        token: "",
                        url: `http://localhost:3000/invite/0`,
                    };
                    return this.emailService.sendInvitationMail(info, context);
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
