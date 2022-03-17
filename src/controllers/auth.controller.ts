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
} from "../queries/admin_queries";
import {
    RegisterUserDataType,
    TransportInfo,
    VerificationEmailContext,
    WriteResult,
} from "../types/types";
import speakeasy, { GenerateSecretOptions } from "speakeasy";
import * as QRCode from "qrcode";
import EmailService from "../services/email-service";
import Token from "../services/token-service";

const db = new DB();

export default class AuthController {
    protected emailService: EmailService;
    protected token: Token;

    constructor() {
        this.emailService = new EmailService();
        this.token = new Token();
    }

    public register = async (req: Request, res: Response) => {
        const conn = await db.getConnection();
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
                md5(password),
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
        const conn = await db.getConnection();
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
        const conn = await db.getConnection();
        const { email, password } = req.body;
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(find_user, [
                email,
            ]);
            if (result) {
                if (result.password !== md5(password)) {
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
        const info: TransportInfo = { to: user.email };
        const context: VerificationEmailContext = {
            id: id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            token: token,
            url: `http://localhost:3000/email/verify/${token}`,
        };
        return this.emailService
            .sendVerificationEmail(info, context)
            .then((result) => result)
            .catch((err) => {
                throw new Error(err);
            });
    };

    public verifyEmail = async (req: Request, res: Response) => {
        const conn = await db.getConnection();
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
}
