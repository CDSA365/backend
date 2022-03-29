import { ResultSetHeader } from "mysql2";
import DB from "../constructs/db";
import {
    create_class_in_cat,
    create_trainer_in_classes,
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
}
