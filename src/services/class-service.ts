import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    assign_student_in_classes_bluk,
    create_class_in_cat,
    create_trainer_in_classes,
    get_student_in_category,
} from "../queries/admin_queries";

export default class ClassServices {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public assignClassToTrainer = async (
        trainer_id: string | number,
        calss_id: string | number
    ): Promise<number | string> => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                const [result] = await conn.query<ResultSetHeader>(
                    create_trainer_in_classes,
                    [trainer_id, calss_id]
                );
                if (result.affectedRows) {
                    resolve(result.insertId);
                } else {
                    throw new Error("Unable to assign trainer to class");
                }
            } catch (error: any) {
                reject(error.message);
            } finally {
                conn.release();
            }
        });
    };

    public assignClassToCategory = async (
        category_id: string | number,
        class_id: string | number
    ): Promise<string | number> => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                const [result] = await conn.query<ResultSetHeader>(
                    create_class_in_cat,
                    [class_id, category_id]
                );
                if (result.affectedRows) {
                    resolve(result.insertId);
                } else {
                    throw new Error("Unable to assign class to category");
                }
            } catch (error: any) {
                reject(error.message);
            } finally {
                conn.release();
            }
        });
    };

    public assignClassToStudents = (category_id: number, class_id: number) => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                const [students] = await conn.query<RowDataPacket[]>(
                    get_student_in_category,
                    [category_id]
                );
                if (students.length) {
                    const values = students.map((student) => [
                        `${student.student_id}${class_id}`,
                        student.student_id,
                        class_id,
                    ]);
                    if (values.length) {
                        try {
                            const [result] = await conn.query<ResultSetHeader>(
                                assign_student_in_classes_bluk,
                                [values]
                            );
                            if (result.affectedRows) {
                                resolve(true);
                            } else {
                                reject(false);
                            }
                        } catch (error) {
                            console.log(error);
                            reject(false);
                        }
                    } else {
                        reject(false);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(false);
            } finally {
                conn.release();
            }
        });
    };
}
