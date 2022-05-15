import { compile } from "handlebars";
import moment from "moment-timezone";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import { formatPhone } from "../helpers/helpers";
import { create_otp_entry, fetch_otp_record } from "../queries/admin_queries";
import SMS from "./sms-service";

export default class OTPService {
    protected db: DB;
    protected sms: SMS;

    constructor() {
        this.db = new DB();
        this.sms = new SMS();
    }

    private generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };

    public sendOTP = (phone: number) => {
        return new Promise(async (resolve, reject) => {
            try {
                const otp = this.generateOTP();
                const message = this.compileOTPSMS(otp);
                const dbResp = await this.createDBEntry(phone, otp);
                if (dbResp) {
                    const result = await this.sms.send(message, phone);
                    resolve(result);
                } else {
                    reject(false);
                }
            } catch (error) {
                console.log(error);
                reject(false);
            }
        });
    };

    private createDBEntry = async (phone: number, otp: number) => {
        const conn = await this.db.getConnection();
        try {
            const validTill = moment()
                .tz("Europe/London")
                .add(5, "minutes")
                .toISOString();
            const [result] = await conn.query<ResultSetHeader>(
                create_otp_entry,
                [formatPhone(phone), otp, validTill]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            conn.release();
        }
    };

    private compileOTPSMS = (otp: number) => {
        const message = `{{1}} is the OTP to verify your account with CDSA 365.`;
        const data = {
            1: otp,
        };
        const template = compile(message);
        const SMSbody = template(data);
        return SMSbody;
    };

    public verifyOTP = async (phone: number | string, otp: number) => {
        const conn = await this.db.getConnection();
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(
                fetch_otp_record,
                [formatPhone(phone), otp]
            );
            return result && result.count !== 0;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            conn.release();
        }
    };
}
