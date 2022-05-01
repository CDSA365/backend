import e, { Request, Response } from "express";
import moment from "moment-timezone";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import Razorpay from "razorpay";
import DB from "../constructs/db";
import {
    create_payment_history,
    extend_due_date,
    get_payment_history,
    get_payment_history_by_email,
    get_payment_history_by_id,
    get_payment_history_by_phone,
    update_payment_history,
} from "../queries/admin_queries";
import crypto from "crypto";
import SMS from "../services/sms-service";
import { generateReceipt } from "../helpers/helpers";

const { PAYMENT_ID, PAYMENT_SECRET } = process.env;

export default class PaymentController {
    protected razorPay: any;
    protected db: DB;
    protected sms: SMS;

    constructor() {
        this.db = new DB();
        this.sms = new SMS();
        this.razorPay = new Razorpay({
            key_id: PAYMENT_ID,
            key_secret: PAYMENT_SECRET,
        });
    }

    private getNextDue = (gap: number, period: any) => {
        const nextDue = moment().add(gap, period).format();
        return nextDue;
    };

    public createOrder = async (req: Request, res: Response) => {
        const options = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: generateReceipt(),
        };
        this.razorPay.orders.create(options, async (err: any, order: any) => {
            if (err) {
                res.status(422).json({
                    error: true,
                    message: "Payment Declined",
                });
            } else {
                const conn = await this.db.getConnection();
                try {
                    const values = {
                        student_id: req.body.student_id,
                        order_id: order.id,
                        receipt_id: order.receipt,
                        amount: order.amount,
                        paid: order.amount_paid,
                        due: order.amount_due,
                        currency: order.currency,
                        offer_id: order.offer_id,
                        status: order.status,
                        notes: JSON.stringify(order.notes),
                        order_created_at: moment
                            .unix(order.created_at)
                            .tz("Asia/Kolkata")
                            .format(),
                    };
                    console.log(values);
                    const [result] = await conn.query<ResultSetHeader>(
                        create_payment_history,
                        [values]
                    );
                    if (result.affectedRows) {
                        res.status(200).json(order);
                    } else {
                        throw new Error("Unable to create payment order");
                    }
                } catch (error: any) {
                    res.status(500).json({
                        error: true,
                        message: error.message,
                    });
                } finally {
                    conn.release();
                }
            }
        });
    };

    public createManualPaymentOrder = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const value = {
                student_id: req.body.student_id,
                receipt_id: generateReceipt(),
                amount: req.body.amount,
                paid: req.body.paid,
                due: req.body.due,
                currency: "INT",
                status: "paid",
                notes: "Captured Manually",
                order_created_at: moment().format(),
                next_due: this.getNextDue(req.body.gap, req.body.period),
            };
            const [result] = await conn.query<ResultSetHeader>(
                create_payment_history,
                [value]
            );
            if (result.affectedRows) {
                res.status(200).json(value);
            } else {
                throw new Error("Unable to create payment order");
            }
        } catch (error: any) {
            res.status(500).json({
                error: true,
                ...error,
            });
        } finally {
            conn.release();
        }
    };

    public verifyPayment = async (req: Request, res: Response) => {
        const body =
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
        const signature = crypto
            .createHmac("sha256", String(PAYMENT_SECRET))
            .update(body.toString())
            .digest("hex");
        if (signature === req.body.razorpay_signature) {
            const conn = await this.db.getConnection();
            try {
                const values = {
                    payment_id: req.body.razorpay_payment_id,
                    paid: req.body.paid,
                    due: req.body.due,
                    status: req.body.status,
                    error_code: req.body.error_code,
                    next_due: this.getNextDue(req.body.gap, req.body.period),
                };
                const [result] = await conn.query<ResultSetHeader>(
                    update_payment_history,
                    [values, req.body.razorpay_order_id]
                );
                if (result.affectedRows) {
                    res.status(200).json(result);
                } else {
                    throw new Error("Error while logging payment history");
                }
            } catch (error: any) {
                res.status(500).json({ error: true, message: error.message });
            } finally {
                conn.release();
            }
        } else {
            res.status(422).json({
                error: true,
                message:
                    "Unable to verify payment. Please contact support for assistance",
            });
        }
    };

    public captureFailedPayment = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const {
            code,
            metadata: { payment_id, order_id },
            status,
        } = req.body;
        try {
            const values = {
                error_code: code,
                payment_id: payment_id,
                status,
            };
            const [result] = await conn.query<ResultSetHeader>(
                update_payment_history,
                [values, order_id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error capturing payment history");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getPaymentHistory = async (req: Request, res: Response) => {
        const { id } = req.params;
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_payment_history,
                [id]
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getPaymentHistoryforManualCapture = async (
        req: Request,
        res: Response
    ) => {
        const { entity, key } = req.params;
        const conn = await this.db.getConnection();
        let query = "";
        switch (key) {
            case "student_id":
                query = get_payment_history_by_id;
                break;
            case "student_email":
                query = get_payment_history_by_email;
                break;
            case "student_phone":
                query = get_payment_history_by_phone;
                break;
            default:
                break;
        }
        try {
            const [result] = await conn.query<RowDataPacket[]>(query, [entity]);
            if (result.length) {
                const response: any = {};
                const paymentData: any[] = [];
                result.map((r) => {
                    paymentData.push({
                        receipt: r.receipt_id,
                        amount: r.amount / 100,
                        paid: r.paid / 100,
                        due: r.due / 100,
                        next_due: r.next_due,
                        status: r.status,
                        paid_on: r.updated_at,
                    });
                    response["id"] = r.student_id;
                    response["name"] = r.first_name + " " + r.last_name;
                    response["email"] = r.email;
                    response["phone"] = r.phone;
                    response["fee"] = r.fee;
                    response["gap"] = r.gap;
                    response["period"] = r.period;
                    response["payment_data"] = paymentData;
                });
                res.status(200).json(response);
            } else {
                throw new Error("No payment data found");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, ...error });
        } finally {
            conn.release();
        }
    };

    public extendDueDate = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        console.log(req.body);
        const { gap, period, currentDue } = req.body;
        const { payment_id } = req.params;
        try {
            const date = currentDue ? moment(currentDue) : moment();
            const next_due = moment(date).add(gap, period).format();
            const [result] = await conn.query<ResultSetHeader>(
                extend_due_date,
                [next_due, payment_id]
            );
            if (result.affectedRows) {
                const message = `Hi!, Your next fee payment due date is extended ${gap} ${period} to ${moment(
                    next_due
                )
                    .tz("Asia/Kolkata")
                    .format(
                        "LL"
                    )}. Please pay the fee before the due date to continue taking classes.`;
                this.sms.send(message);
                res.status(200).json(result);
            } else {
                throw new Error("Unable to process the request");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
