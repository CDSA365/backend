import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    assign_student_in_classes_bluk,
    create_class_in_cat,
    create_trainer_in_classes,
    get_recurring_class_by_id,
    get_student_in_category,
} from "../queries/admin_queries";

export default class ClassServices {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    private getRecurringClass = async (id: string) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_recurring_class_by_id,
                [id]
            );
            return result;
        } catch (error: any) {
            console.log(error);
            return [];
        } finally {
            conn.release();
        }
    };

    public assignClassToTrainer = async (
        trainer_id: string | number,
        calss_id: string | number,
        recurranceID: string,
        recurringClass: boolean = false
    ): Promise<number | string> => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                let insertData: any[] = [];
                insertData = await this.getTrainerDataToInsert(
                    recurringClass,
                    recurranceID,
                    trainer_id,
                    insertData,
                    calss_id
                );
                const [result] = await conn.query<ResultSetHeader>(
                    create_trainer_in_classes,
                    [insertData]
                );
                if (result.affectedRows) {
                    resolve(result.insertId);
                } else {
                    throw new Error("Unable to assign trainer to class");
                }
            } catch (error: any) {
                console.log(error);
                reject(error.message);
            } finally {
                conn.release();
            }
        });
    };

    public assignClassToCategory = async (
        category_id: string | number,
        class_id: string | number,
        recurranceID: string,
        recurringClass: boolean = false
    ): Promise<string | number> => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                let insertData: any[] = [];
                insertData = await this.getClassCatDataToInsert(
                    recurringClass,
                    recurranceID,
                    category_id,
                    insertData,
                    class_id
                );
                const [result] = await conn.query<ResultSetHeader>(
                    create_class_in_cat,
                    [insertData]
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

    public assignClassToStudents = (
        category_id: number,
        class_id: number,
        recurranceID: string,
        recurringClass: boolean = false
    ) => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                const [students] = await conn.query<RowDataPacket[]>(
                    get_student_in_category,
                    [category_id]
                );
                if (students.length) {
                    let insertData: any[] = [];
                    if (recurringClass) {
                        const list = await this.getRecurringClass(recurranceID);
                        students.map((student) => {
                            list.map((cls) => {
                                insertData.push([
                                    `${student.student_id}${cls.id}`,
                                    student.student_id,
                                    cls.id,
                                ]);
                            });
                        });
                    } else {
                        students.map((student) => {
                            insertData.push([
                                `${student.student_id}${class_id}`,
                                student.student_id,
                                class_id,
                            ]);
                        });
                    }
                    if (insertData.length) {
                        try {
                            const [result] = await conn.query<ResultSetHeader>(
                                assign_student_in_classes_bluk,
                                [insertData]
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

    private async getClassCatDataToInsert(
        recurringClass: boolean,
        recurranceID: string,
        category_id: string | number,
        insertData: any[],
        class_id: string | number
    ) {
        if (recurringClass) {
            const list = await this.getRecurringClass(recurranceID);
            const data = list.map((cls) => [cls.id, category_id]);
            insertData = [...data];
        } else {
            insertData = [[class_id, category_id]];
        }
        return insertData;
    }

    private async getTrainerDataToInsert(
        recurringClass: boolean,
        recurranceID: string,
        trainer_id: string | number,
        insertData: any[],
        calss_id: string | number
    ) {
        if (recurringClass) {
            const list = await this.getRecurringClass(recurranceID);
            const data = list.map((cls) => [
                `${trainer_id}${cls.id}`,
                trainer_id,
                cls.id,
            ]);
            insertData = [...data];
        } else {
            insertData = [[`${trainer_id}${calss_id}`, trainer_id, calss_id]];
        }
        return insertData;
    }
}
