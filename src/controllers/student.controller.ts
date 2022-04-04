import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    assign_student_to_class,
    check_if_student_exists,
    find_student,
    get_all_students,
    register_student,
    update_student,
} from "../queries/admin_queries";
import DataTransformer from "../services/data-transform-service";

export default class StudentController {
    protected db: DB;
    protected transformer: DataTransformer;

    constructor() {
        this.db = new DB();
        this.transformer = new DataTransformer();
    }

    public registerStudent = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        req.body.password = this.transformer.encrypt(req.body.password);
        req.body.auth_token = this.transformer.encrypt(
            req.body.email + req.body.first_name + req.body.last_name
        );
        try {
            const [[{ count }]] = await conn.query<RowDataPacket[]>(
                check_if_student_exists,
                [req.body.email, req.body.phone]
            );
            console.log(count);
            if (count) {
                res.status(422).json("User exists");
            } else {
                const [result] = await conn.query<ResultSetHeader>(
                    register_student,
                    req.body
                );
                if (result.affectedRows) {
                    res.status(200).json("Student created");
                } else {
                    res.status(500).json("Cannot register student");
                }
            }
        } catch (error: any) {
            res.status(500).json(error.message);
            console.log(error);
        } finally {
            conn.release();
        }
    };

    public login = async (req: Request, res: Response) => {
        let { email, password } = req.body;
        password = this.transformer.encrypt(password);
        const conn = await this.db.getConnection();
        try {
            const [[user]] = await conn.query<RowDataPacket[]>(find_student, [
                email,
            ]);
            if (user) {
                if (user.status === 0) {
                    res.status(422).json({
                        error: true,
                        message: "Student not activated",
                    });
                } else if (user.password !== password) {
                    res.status(422).json({
                        error: true,
                        message: "Incorrect password",
                    });
                } else {
                    res.status(200).json({
                        id: user.id,
                        token: user.auth_token,
                        email_verified: user.email_verified,
                        phone_verified: user.phone_verified,
                    });
                }
            } else {
                res.status(404).json({
                    error: true,
                    message: "Email not found",
                });
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    };

    public getAllStudents = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_all_students
            );
            const transformedResult =
                this.transformer.transformForCategories(result);
            res.status(200).json(transformedResult);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public updateStudent = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { id } = req.params;
        try {
            const [result] = await conn.query<ResultSetHeader>(update_student, [
                req.body,
                id,
            ]);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                res.status(422).json({
                    error: true,
                    message: "Unable to update student",
                });
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release;
        }
    };

    public assignStudentToClass = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { list } = req.body;
        const values = list.map((ids: any) => [`${ids}${id}`, ids, id]);
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(
                assign_student_to_class,
                [values]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                res.status(422).json({
                    error: true,
                    message: "Unable to assign student to class",
                });
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
