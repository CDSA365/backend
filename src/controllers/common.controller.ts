import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import DB from "../constructs/db";
import { create_category } from "../queries/admin_queries";

export default class CommonController {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public createCategory = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { entity, name, description, image } = req.body;
        let tableName = "";
        try {
            if (entity === "trainer") tableName = "trainer_categories";
            if (entity === "student") tableName = "student_categories";
            if (entity === "class") tableName = "class_categories";
            const [result] = await conn.query<ResultSetHeader>(
                create_category,
                [tableName, name, description]
            );
            if (result && result.affectedRows) {
                res.status(200).json({
                    success: true,
                    message: `${entity} category created`,
                });
            } else {
                throw new Error(`Error creating ${entity} category`);
            }
        } catch (error: any) {
            console.log(error);
            res.status(401).json(error.message);
        } finally {
            conn.release();
        }
    };
}
