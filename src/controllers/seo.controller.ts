import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    create_seo_record,
    delete_seo_record,
    get_active_seo_config,
    get_seo_for_page,
    read_all_seo_record,
} from "../queries/admin_queries";
import SeoService from "../services/seo-service";

export default class SeoController {
    protected readonly db: DB;
    protected seoService: SeoService;

    constructor() {
        this.db = new DB();
        this.seoService = new SeoService();
    }

    public get = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { page } = req.query;
            const [result] = await conn.query<RowDataPacket[]>(
                get_seo_for_page,
                [page]
            );
            if (result) {
                const transformed = this.seoService.transformSeoData(
                    result as any
                );
                res.status(200).json(transformed);
            } else {
                res.status(403).json({
                    error: true,
                    message: "Data not found",
                });
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public create = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { page, title, description, keywords } = req.body;
            const [result] = await conn.query<ResultSetHeader>(
                create_seo_record,
                [page, title, description, keywords]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error creating SEO record");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public readAll = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<RowDataPacket[]>(
                read_all_seo_record
            );
            const transformed = this.seoService.bulkTransformSeoData(
                result as any
            );
            res.status(200).json(transformed);
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public update = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
        } catch (error: any) {
        } finally {
            conn.release();
        }
    };

    public delete = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        try {
            const { id } = req.params;
            const [result] = await conn.query<ResultSetHeader>(
                delete_seo_record,
                [id]
            );
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error deleting record");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public activate = async (req: Request, res: Response) => {
        const conn = await this.db.getConnection();
        const ids = req.body.map((item: any) => item.id);
        const caseQuery = req.body.map(
            (item: { id: number; status: number }) =>
                `WHEN ${item.id} THEN ${item.status}`
        );
        const query = `UPDATE seo_config SET status = (CASE id ${caseQuery.join(
            " "
        )} END) WHERE id in (${ids.join(", ")})`;
        try {
            const [result] = await conn.query<ResultSetHeader>(query);
            if (result.affectedRows) {
                res.status(200).json(result);
            } else {
                throw new Error("Error updating SEO Config");
            }
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            conn.release();
        }
    };

    public updateImageSeo = async (req: Request, res: Response) => {
        const { imageId } = req.params;
        const { title, alt } = req.body;
        try {
            await this.seoService.updateImageMeta(imageId, title, alt);
            res.status(200).json({ imageId, title, alt });
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    };
}
