import { Request, Response } from "express";
import OTPService from "../services/otp-service";

export default class OTPController {
    protected otp: OTPService;

    constructor() {
        this.otp = new OTPService();
    }

    public sendOTPSMS = async (req: Request, res: Response) => {
        const { phone } = req.body;
        try {
            const result = await this.otp.sendOTP(phone);
            if (result) {
                res.status(200).json(result);
            } else {
                throw new Error(`Error sending OTP to ${phone}`);
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        }
    };

    public verifyOtp = async (req: Request, res: Response) => {
        const { phone, otp } = req.body;
        try {
            const result = await this.otp.verifyOTP(phone, otp);
            if (result) {
                res.status(200).json(result);
            } else {
                throw new Error("OTP is either invalid or expired");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    };
}
