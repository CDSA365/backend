import { Request, Response } from "express";
import moment from "moment-timezone";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    create_category,
    get_trainer_categories,
    get_student_categories,
    get_class_categories,
    add_to_trainer_category,
    add_to_student_category,
    add_to_class_category,
    get_trainer_category_detail,
    get_student_category_detail,
    get_classes_category_detail,
    update_category,
    remove_entity_from_category,
    delete_category,
} from "../queries/admin_queries";

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

    public getCategory = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { entity } = req.params;
        let query = "";
        try {
            if (entity === "trainer") query = get_trainer_categories;
            if (entity === "student") query = get_student_categories;
            if (entity === "class") query = get_class_categories;
            const [result] = await conn.query<RowDataPacket[]>(query);
            if (result) res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        } finally {
            conn.release();
        }
    };

    public addToCategory = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            let query = "";
            const { cat_id, user_list } = req.body;
            const { entity } = req.params;
            const values = user_list.map((user: any) => [
                `${user}${cat_id}`,
                user,
                cat_id,
            ]);
            console.log(entity);
            if (entity === "trainer") query = add_to_trainer_category;
            if (entity === "student") query = add_to_student_category;
            if (entity === "class") query = add_to_class_category;
            const [result] = await conn.query<ResultSetHeader>(query, [values]);
            console.log(result);
            if (result.affectedRows > 0) {
                res.status(200).json({
                    success: true,
                    message: `${entity} added to Category`,
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: `Unable to add ${entity} to category`,
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getCategoryDetails = async (req: Request, res: Response) => {
        const { entity, cat_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            let query: string = "";
            let response: any = {};
            let entities: any = [];
            if (entity === "trainer") query = get_trainer_category_detail;
            if (entity === "student") query = get_student_category_detail;
            if (entity === "class") query = get_classes_category_detail;
            const [result] = await conn.query<RowDataPacket[]>(query, [cat_id]);
            result.length &&
                result.map((res) => {
                    if (res.id !== null) {
                        const entityData =
                            entity !== "class"
                                ? {
                                      id: res.id,
                                      name: res.name,
                                      email: res.email,
                                      phone: res.phone,
                                  }
                                : {
                                      id: res.id,
                                      title: res.title,
                                      description: res.description,
                                      slug: res.slug,
                                      status: res.status,
                                      progress_state: res.progress_state,
                                      start_time: moment(res.start_time)
                                          .tz("Asia/Kolkata")
                                          .format("LLL"),
                                      end_time: moment(res.end_time)
                                          .tz("Asia/Kolkata")
                                          .format("LLL"),
                                  };
                        entities.push(entityData);
                    }
                });
            response["id"] = result[0].cat_id;
            response["name"] = result[0].cat_name;
            response["description"] = result[0].cat_description;
            response[entity] = entities;
            res.status(200).json(response);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public udpateCategory = async (req: Request, res: Response) => {
        const { cat_id, entity } = req.params;
        const conn = await this.db.getConnection();
        try {
            let table = "";
            if (entity === "trainer") table = "trainer_categories";
            if (entity === "student") table = "student_categories";
            if (entity === "class") table = "class_categories";
            const [result] = await conn.query<ResultSetHeader>(
                update_category,
                [table, req.body, cat_id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to update category. Please try again!");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public removeEntity = async (req: Request, res: Response) => {
        const { entity, cat_id, entity_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            let table = "";
            let catColumn = `${entity}_category_id`;
            let entityColumn = `${entity}_id`;
            if (entity === "trainer") table = "trainer_in_categories";
            if (entity === "student") table = "student_in_categories";
            if (entity === "class") table = "class_in_categories";
            const [result] = await conn.query<ResultSetHeader>(
                remove_entity_from_category,
                [table, entityColumn, entity_id, catColumn, cat_id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error(`Unable to remove ${entity} from categories.`);
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public deleteCategory = async (req: Request, res: Response) => {
        const { entity, cat_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            let table = "";
            if (entity === "trainer") table = "trainer_categories";
            if (entity === "student") table = "student_categories";
            if (entity === "class") table = "class_categories";
            const [result] = await conn.query<ResultSetHeader>(
                delete_category,
                [table, cat_id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error deleting the category");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };
}
