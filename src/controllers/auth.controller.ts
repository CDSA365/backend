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
} from "../queries/admin_queries";
import {
    RegisterUserDataType,
    TransportInfo,
    VerificationEmailContext,
    WriteResult,
} from "../types/types";
import speakeasy, { GenerateSecretOptions } from "speakeasy";
import * as QRCode from "qrcode";
import JWT from "jsonwebtoken";
import EmailService from "../services/email-service";

const db = new DB();
const { SIGNING_KEY } = process.env;

export default class AuthController {
    protected emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
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
                this.sendEmailVerification(insertId, email, secret_token);
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
        email: string,
        secret: string
    ) => {
        const payload = { id, email, secret };
        const jwtOption = {
            expiresIn: 60,
        };
        const token = JWT.sign(payload, String(SIGNING_KEY), jwtOption);
        const info: TransportInfo = { to: email };
        const context: VerificationEmailContext = {
            id: id,
            email: email,
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
}
