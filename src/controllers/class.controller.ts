import { Request, Response } from "express";
import moment from "moment-timezone";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    add_remarks,
    create_class,
    delete_class,
    fetch_all_classes,
    fetch_classes,
    get_class_by_id,
    get_class_by_slug,
    get_remarks,
    get_remarks_for_admin,
    get_students_in_class,
    udpate_class,
    update_class_category,
    update_trainer_in_class,
} from "../queries/admin_queries";
import ClassServices from "../services/class-service";
import DataTransformer from "../services/data-transform-service";
import CommonController from "./common.controller";
import { createSlugWithKey } from "../helpers/helpers";

export default class ClassController {
    protected db: DB;
    protected transformer: DataTransformer;
    protected classService: ClassServices;
    protected commonCtrl: CommonController;

    constructor() {
        this.db = new DB();
        this.transformer = new DataTransformer();
        this.classService = new ClassServices();
        this.commonCtrl = new CommonController();
    }

    public createClass = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const startTime = moment(req.body.start)
                .tz("Asia/Kolkata")
                .format();
            const endTime = moment(req.body.end).tz("Asia/Kolkata").format();
            const diff = moment.duration(moment(endTime).diff(startTime));
            const data = {
                title: req.body.title,
                description: req.body.description,
                slug: createSlugWithKey(req.body.title),
                start_time: startTime,
                end_time: endTime,
                duration: Number(diff.asMinutes()),
                status: req.body.status ?? 0,
                type: req.body.type,
                video_link: req.body.video_link,
            };
            const [result] = await conn.query<ResultSetHeader>(create_class, [
                data,
            ]);
            if (result.affectedRows) {
                const promises: any = [];
                if (req.body.trainer) {
                    promises.push(
                        this.classService.assignClassToTrainer(
                            req.body.trainer,
                            result.insertId
                        )
                    );
                }
                if (req.body.category) {
                    promises.push(
                        this.classService.assignClassToCategory(
                            req.body.category,
                            result.insertId
                        )
                    );
                }
                if (req.body.studentCategory) {
                    promises.push(
                        this.classService.assignClassToStudents(
                            req.body.studentCategory,
                            result.insertId
                        )
                    );
                }
                await Promise.allSettled(promises);
                res.status(200).json({
                    success: true,
                    message: `class "${req.body.title}" created.`,
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: "Error creating class",
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public fetchclasses = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(fetch_classes);
            res.status(200).json(result);
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public fetchAllClasses = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                fetch_all_classes
            );
            if (result.length) {
                const newData = this.transformer.transformForCategories(result);
                res.status(200).json(newData);
            } else {
                res.status(200).json(result);
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public updateClass = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const { id: class_id } = req.params;
        try {
            if ("title" in req.body) {
                req.body.slug = createSlugWithKey(req.body.title);
            }
            if ("start" in req.body) {
                req.body.start_time = req.body.start;
                delete req.body.start;
            }
            if ("end" in req.body) {
                req.body.end_time = req.body.end;
                delete req.body.end;
            }
            if ("trainer" in req.body) {
                await conn.query<ResultSetHeader>(update_trainer_in_class, [
                    `${req.body.trainer}${class_id}`,
                    req.body.trainer,
                    class_id,
                ]);
                delete req.body.trainer;
            }
            if ("category" in req.body) {
                await conn.query<ResultSetHeader>(update_class_category, [
                    req.body.category,
                    class_id,
                ]);
                delete req.body.category;
            }
            const [result] = await conn.query<ResultSetHeader>(udpate_class, [
                req.body,
                class_id,
            ]);
            if (result.affectedRows) {
                res.status(200).json({
                    success: true,
                    message: "Class published",
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: "Class cannot be published",
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public deleteClass = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(delete_class, [
                req.body,
            ]);
            if (result.affectedRows) {
                res.status(200).json({
                    success: true,
                    message: `Class deleted`,
                });
            } else {
                res.status(422).json({
                    error: true,
                    message: `Class cannot be deleted`,
                });
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public startClassForTrainer = async (req: Request, res: Response) => {
        const { trainer_id, class_id, time } = req.body;
        this.db.getConnection().then((conn) => {
            const data = {
                day: moment(time).format("dddd"),
                month: moment(time).format("MMMM"),
                year: moment(time).format("YYYY"),
            };
        });
    };

    public getStudentsInClass = async (req: Request, res: Response) => {
        const { class_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_students_in_class,
                [class_id]
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public addRemarks = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(add_remarks, [
                req.body,
            ]);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to process request");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getRemarks = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { class_id, trainer_id } = req.params;
            const [result] = await conn.query<RowDataPacket[]>(get_remarks, [
                class_id,
                trainer_id,
            ]);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getClassBySlug = async (req: Request, res: Response) => {
        const { slug } = req.params;
        const conn = await this.db.getConnection();
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(
                get_class_by_slug,
                [slug]
            );
            if (result) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to fetch class details.");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public getClassById = async (req: Request, res: Response) => {
        const { class_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            const [[result]] = await conn.query<RowDataPacket[]>(
                get_class_by_id,
                [class_id]
            );
            if (result) {
                res.status(200).json(result);
            } else {
                throw new Error("Unable to fetch class details.");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public fetchRemarksForAdmin = async (req: Request, res: Response) => {
        const { class_id } = req.params;
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                get_remarks_for_admin,
                [class_id]
            );
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    };
}
