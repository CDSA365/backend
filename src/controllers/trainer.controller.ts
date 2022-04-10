import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import DB from "../constructs/db";
import {
    create_trainer,
    create_trainer_time_log,
    fetch_all_trainers,
    fetch_trainers,
    find_one_trainer,
    find_trainer,
    find_trainer_with_token,
    find_user_by_id,
    get_trainer_in_classes,
    get_trainer_month_attendance,
    get_trainer_week_attendance,
    get_trainer_year_attendance,
    unassign_trainer,
    update_invite_status,
    update_trainer_by_token,
    update_trainer_time_log,
} from "../queries/admin_queries";
import DataTransformer from "../services/data-transform-service";
import EmailService from "../services/email-service";
import Token from "../services/token-service";
import { InvitationEmailContext, TransportInfo } from "../types/types";
import crypto from "crypto";
import { months } from "../constants/constant";

const { TRAINER_PORTAL } = process.env;
export default class TrainerController {
    protected emailService: EmailService;
    protected transformer: DataTransformer;
    protected token: Token;
    protected db: DB;

    constructor() {
        this.db = new DB();
        this.emailService = new EmailService();
        this.transformer = new DataTransformer();
        this.token = new Token();
    }

    public createTrainer = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { first_name, last_name, email, salary } = req.body;
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
                const auth_token = crypto.randomBytes(20).toString("hex");
                const [result] = await conn.query<ResultSetHeader>(
                    create_trainer,
                    [first_name, last_name, email, salary, auth_token]
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
                    const tokenPayload = {
                        first_name: trainer.first_name,
                        last_name: trainer.last_name,
                        email: trainer.email,
                        token: trainer.auth_token,
                    };
                    const token = this.token.get(tokenPayload);
                    const info: TransportInfo = {
                        to: trainer.email,
                        subject: "Invitation to join Carpe Diem Skills Academy",
                    };
                    const context: InvitationEmailContext = {
                        first_name: trainer.first_name,
                        last_name: trainer.last_name,
                        url: `${TRAINER_PORTAL}/invite/${token}`,
                        token,
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

    public verifyTrainer = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { token } = req.params;
        try {
            const trainer: any = this.token.verify(token);
            const [[{ count }]] = await conn.query<RowDataPacket[]>(
                find_trainer_with_token,
                [trainer.email, trainer.token]
            );
            console.log(trainer.email, trainer.token, count);
            if (count) {
                res.status(200).json({ verified: true, ...trainer });
            } else {
                throw new Error("Request cannot be verified");
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

    public getAssignedClasses = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { id } = req.params;
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_trainer_in_classes,
                [id]
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public unassignClassToTrainer = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { trainer, class_id } = req.params;
            const [result] = await conn.query<ResultSetHeader>(
                unassign_trainer,
                [trainer, class_id]
            );
            if (result.affectedRows) {
                res.status(200).send({
                    success: true,
                    message: `Trainer unassaigned`,
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: `Cannot unassign trainer`,
                });
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public updateTrainer = (req: Request, res: Response) => {
        const { token } = req.params;
        const { body } = req;
        body.password = this.transformer.encrypt(body.password);
        this.db.getConnection().then((conn) => {
            conn.query<ResultSetHeader>(update_trainer_by_token, [body, token])
                .then(([result]) => {
                    if (result.affectedRows) {
                        res.status(200).json({ success: true });
                    } else {
                        res.status(422).json({
                            error: true,
                            message: "Cannot update trainer",
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: true, message: err.message });
                })
                .finally(() => {
                    conn.release();
                });
        });
    };

    public createTrainerLog = async (req: Request, res: Response) => {
        this.db
            .getConnection()
            .then((conn) => {
                conn.query<ResultSetHeader>(create_trainer_time_log, req.body)
                    .then(([result]) => {
                        if (result.affectedRows) {
                            res.status(200).json(result);
                        } else {
                            throw new Error("Unable to update trainer log");
                        }
                    })
                    .catch((err) => {
                        throw new Error(err.message);
                    })
                    .finally(() => conn.release());
            })
            .catch((err) => {
                res.status(500).json({ error: true, message: err.message });
            });
    };

    public udpateTrainerLog = async (req: Request, res: Response) => {
        const { trainer_id, class_id } = req.params;
        this.db
            .getConnection()
            .then((conn) => {
                conn.query<ResultSetHeader>(update_trainer_time_log, [
                    req.body,
                    trainer_id,
                    class_id,
                ])
                    .then(([result]) => {
                        if (result.affectedRows) {
                            res.status(200).json(result);
                        } else {
                            throw new Error("Unable to update trainer log");
                        }
                    })
                    .catch((err) => {
                        throw new Error(err.message);
                    })
                    .finally(() => conn.release());
            })
            .catch((err) => {
                res.status(500).json({ error: true, message: err.message });
            });
    };

    public getAttendance = async (req: Request, res: Response) => {
        const { trainer_id, week, month, year } = req.params;
        this.db.getConnection().then((conn) => {
            conn.query<RowDataPacket[]>(get_trainer_week_attendance, [
                trainer_id,
                year,
                month,
                week,
            ])
                .then(([result]) => {
                    const transformedData =
                        this.transformer.transformAttendance(result);
                    res.status(200).json(transformedData);
                })
                .finally(() => conn.release());
        });
    };

    public getMonthlyDurations = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { trainer_id, year, month } = req.params;
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_trainer_month_attendance,
                [trainer_id, year, month]
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getYearlyDurations = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { trainer_id, year } = req.params;
        const obj: any = { year: +year };
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_trainer_year_attendance,
                [trainer_id, year]
            );
            Object.entries(months).map(([key, value]) => {
                const filtered = result.filter((o) => o.month === value);
                const duration = filtered.map((o) => ({
                    duration: o.duration,
                    salary: o.salary,
                }));
                const sum = duration.reduce(
                    (a, b) =>
                        Number(a) + Number(b.duration) * (b.salary / (60 * 60)),
                    0
                );
                obj[key] = +sum.toFixed(2);
            });
            const total: any = Object.values(obj).reduce(
                (a: any, b) => a + b,
                0
            );
            obj["total"] = +(total - obj.year).toFixed(2);
            res.status(200).json(obj);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
