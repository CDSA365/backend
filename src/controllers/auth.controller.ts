import { Request, Response } from "express";
import md5 from "md5";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { user_exists } from "../constants/constant";
import DB from "../constructs/db";
import {
    create_admin,
    admin_lookup,
    get_secret,
    find_user,
    update_email_status,
    login_trainer,
    update_trainer_by_token,
    get_data_for_password_reset,
    udpate_password,
    get_data_for_token,
} from "../queries/admin_queries";
import {
    PasswordResetEmailContext,
    RegisterUserDataType,
    TransportInfo,
    VerificationEmailContext,
    WriteResult,
} from "../types/types";
import speakeasy, { GenerateSecretOptions } from "speakeasy";
import * as QRCode from "qrcode";
import EmailService from "../services/mail-service";
import Token from "../services/token-service";
import DataTransformer from "../services/data-transform-service";
import moment from "moment";

const { ADMIN_PORTAL, SENDER_EMAIL, STUDENT_PORTAL, TRAINER_PORTAL } =
    process.env;
export default class AuthController {
    protected emailService: EmailService;
    protected transformer: DataTransformer;
    protected token: Token;
    protected db: DB;

    constructor() {
        this.emailService = new EmailService();
        this.transformer = new DataTransformer();
        this.token = new Token();
        this.db = new DB();
    }

    public register = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const admin = req.body;
            const { email, password } = admin;
            const [[{ count }]] = await conn.query<RowDataPacket[]>(
                admin_lookup,
                [email, password]
            );
            if (count) {
                res.status(400).send(user_exists);
            } else {
                const resp = await this.createAdmin(admin, conn);
                const [result, secret_token] = resp;
                const { insertId } = result;
                this.sendEmailVerification(insertId, admin, secret_token);
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json(error);
        } finally {
            conn.release();
        }
    };

    private createAdmin = async (
        admin: RegisterUserDataType,
        conn: PoolConnection
    ): Promise<[WriteResult, string]> => {
        try {
            const { first_name, last_name, email, phone, password } = admin;
            const [secret_token, qrcode] = await this.generateSecrets(email);
            const [result] = await conn.query<ResultSetHeader>(create_admin, [
                first_name,
                last_name,
                email,
                phone,
                this.transformer.encrypt(password),
                secret_token,
                secret_token,
            ]);
            return [{ ...result, qrcode }, secret_token];
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    private generateSecrets = async (email: string) => {
        const options: GenerateSecretOptions = {
            length: 20,
            issuer: `CDSA365 (${email})`,
            name: `CDSA365 (${email})`,
        };
        const secret = speakeasy.generateSecret(options);
        const secretUrl = secret.otpauth_url as string;
        const qrcode = await QRCode.toDataURL(secretUrl);
        return [secret.base32, qrcode];
    };

    public verifyTotp = async (req: Request, res: Response) => {
        const { id, code } = req.body;
        const conn = await this.db.getConnection();
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(get_secret, [
                id,
            ]);
            if (result) {
                const verified = speakeasy.totp.verify({
                    secret: result.secret_token,
                    token: code,
                    encoding: "base32",
                });
                res.status(verified ? 200 : 400).json({ verified, id });
            } else {
                res.status(400).json({ verified: false });
            }
        } catch (error: any) {
            res.status(500).json(error.message);
        } finally {
            conn.release();
        }
    };

    public login = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { email, password } = req.body;
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(find_user, [
                email,
            ]);
            if (result) {
                if (result.password !== this.transformer.encrypt(password)) {
                    res.status(400).json({
                        error: true,
                        message: "Wrong Password",
                    });
                } else {
                    delete result["password"];
                    res.status(200).json(result);
                }
            } else {
                res.status(400).json({
                    error: true,
                    message: "Invalid Email",
                });
            }
        } catch (error: any) {
            res.status(500).json(error.message);
        } finally {
            conn.release();
        }
    };

    public sendEmailVerification = async (
        id: number,
        user: any,
        secret: string
    ) => {
        const payload = { id, email: user.email, secret };
        const token = this.token.get(payload, 60 * 5);
        const link = `${ADMIN_PORTAL}/email/verify/${token}`;
        const transportInfo: TransportInfo = {
            from: String(SENDER_EMAIL),
            to: user.email,
            subject: "Verify email for CDSA 365",
        };
        const context: VerificationEmailContext = {
            email: user.eamil,
            token: token,
            url: link,
        };
        return this.emailService
            .sendVerificationEmail(transportInfo, context)
            .then((result) => result)
            .catch((err) => {
                throw new Error(err);
            });
    };

    public verifyEmail = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { token } = req.params;
            const payload: any = this.token.verify(token);
            const { id, email, secret } = payload;
            const [result] = await conn.query<ResultSetHeader>(
                update_email_status,
                [id, email, secret]
            );
            if (result && result.affectedRows) {
                res.status(200).json({
                    verified: true,
                    message: "Email verified!",
                });
            } else {
                res.status(401).json({
                    verified: false,
                    message: "Email Verification failed!",
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(401).json({ verified: false, message: error.message });
        } finally {
            conn.release();
        }
    };

    /*********************
     * TRAINER SECTION
     ********************/
    public trainerLogin = (req: Request, res: Response) => {
        const { password: pass, email } = req.body;
        const password = this.transformer.encrypt(pass);
        this.db.getConnection().then((conn) => {
            conn.query<RowDataPacket[]>(login_trainer, [email, password])
                .then(([[result]]) => {
                    if (result) {
                        conn.query<ResultSetHeader>(update_trainer_by_token, [
                            { last_login: moment().format() },
                            result.auth_token,
                        ])
                            .then(([resp]) => {
                                if (resp.affectedRows) {
                                    delete result.password;
                                    res.status(200).json(result);
                                } else {
                                    throw new Error(
                                        "Something went wrong. Try again!"
                                    );
                                }
                            })
                            .catch((err) => {
                                res.status(500).json({
                                    error: true,
                                    errors: [{ msg: err.message }],
                                });
                            })
                            .finally(() => {
                                conn.release();
                            });
                    } else {
                        res.status(400).json({
                            error: true,
                            errors: [{ msg: "Email or password is incorrect" }],
                        });
                    }
                })
                .catch((err) => {
                    res.status(500).json({
                        error: true,
                        errors: [{ msg: err.message }],
                    });
                })
                .finally(() => conn.release());
        });
    };

    public sendPasswordResetEmail = async (req: Request, res: Response) => {
        this.db
            .getConnection()
            .then((conn) => {
                const { email, portal } = req.body;
                let table = "";
                if (portal === "student") table = "students";
                if (portal === "trainer") table = "trainers";
                if (portal === "admin") table = "admins";
                if (table) {
                    conn.query<RowDataPacket[]>(get_data_for_password_reset, [
                        table,
                        email,
                    ])
                        .then(([[result]]) => {
                            if (result) {
                                const transportInfo: TransportInfo = {
                                    to: result.email,
                                    subject: "Reset password for CDSA365",
                                };
                                const context: PasswordResetEmailContext = {
                                    first_name: result.first_name,
                                    link: this.getResetPasswordLink(
                                        result,
                                        portal
                                    ),
                                };
                                this.emailService
                                    .sendPasswordResetEmail(
                                        transportInfo,
                                        context
                                    )
                                    .then(() => {
                                        res.status(200).json({
                                            message: `Reset password link is sent to ${email}`,
                                        });
                                    })
                                    .catch(() => {
                                        throw new Error(
                                            "Error while sending password reset email. Try again!"
                                        );
                                    });
                            } else {
                                res.status(500).json({
                                    error: true,
                                    message:
                                        "No account is associated with this email address",
                                });
                            }
                        })
                        .catch((err) => {
                            res.status(500).json({
                                error: true,
                                message: err.message,
                            });
                        })
                        .finally(() => conn.release());
                } else {
                    conn.release();
                    res.status(500).json({
                        error: true,
                        message: "Wrong entity provided",
                    });
                }
            })
            .catch((err) =>
                res.status(500).json({ error: true, message: err.message })
            );
    };

    protected getResetPasswordLink = (userData: any, portal: string) => {
        let host = "";
        const token = this.token.get({
            email: userData.email,
            portal: portal,
            token: userData.auth_token,
        });
        switch (portal) {
            case "student":
                host = String(STUDENT_PORTAL);
                break;
            case "trainer":
                host = String(TRAINER_PORTAL);
                break;
            case "admin":
                host = String(ADMIN_PORTAL);
                break;
            default:
                break;
        }
        const link = `${host}/reset-password/${token}`;
        return link;
    };

    public updatePassword = async (req: Request, res: Response) => {
        const { entity, id, password } = req.body;
        const conn = await this.db.getConnection();
        try {
            let table = "";
            if (entity === "student") table = "students";
            if (entity === "trainer") table = "trainers";
            if (entity === "admin") table = "admins";
            const pass = this.transformer.encrypt(password);
            const [result] = await conn.query<ResultSetHeader>(
                udpate_password,
                [table, pass, id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to reset passwrod");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public verifyToken = async (req: Request, res: Response) => {
        const { token } = req.params;
        const conn = await this.db.getConnection();
        try {
            const payload: any = this.token.verify(token);
            const { email, portal, token: tkn } = payload;
            let table = "";
            if (portal === "admin") table = "admins";
            if (portal === "student") table = "students";
            if (portal === "trainer") table = "trainers";
            const [[result]] = await conn.query<RowDataPacket[]>(
                get_data_for_token,
                [table, email, tkn]
            );
            if (result) {
                res.status(200).json({
                    id: result.id,
                    email: result.email,
                    token: result.auth_token,
                });
            } else {
                throw new Error("Token verification failed");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
