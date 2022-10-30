import { ResultSetHeader } from "mysql2";
import DB from "../constructs/db";
import { update_image_meta } from "../queries/admin_queries";

interface SeoResult {
    id: number;
    page: string;
    title: string;
    description: string;
    keywords: string;
    created_at: Date;
    updated_at: Date;
    image_id: string | null;
    image_title: string | null;
    image_alt: string | null;
    image_url: string | null;
}

interface TransformedData {
    page: string;
    title: string;
    description: string;
    keywords: string;
    images: ImageData[];
}

interface ImageData {
    id: string;
    page: string;
    title: string;
    alt: string;
    url: string;
}

export default class SeoService {
    protected db: DB;

    constructor() {
        this.db = new DB();
    }

    public transformSeoData = (result: SeoResult[]) => {
        let transformedData: TransformedData = {} as TransformedData;
        let images: ImageData[] = [];
        result.map((key) => {
            transformedData["page"] = key.page;
            transformedData["title"] = key.title;
            transformedData["description"] = key.description;
            transformedData["keywords"] = key.keywords;
            if (key.image_id) {
                images.push({
                    id: key.image_id,
                    page: key.page,
                    title: key.image_title ?? "",
                    alt: key.image_alt ?? "",
                    url: key.image_url ?? "",
                });
            }
        });
        transformedData["images"] = images;
        return transformedData;
    };

    public bulkTransformSeoData = (result: SeoResult[]) => {
        let processed = "";
        const transformed: TransformedData[] = [];
        result.map((x) => {
            if (processed !== x.page) {
                const grouped = result.filter((y) => y.page === x.page);
                transformed.push(this.transformSeoData(grouped));
                processed = x.page;
            }
        });
        return transformed;
    };

    public updateImageMeta = async (id: string, title: string, alt: string) => {
        const conn = await this.db.getConnection();
        try {
            const [result] = await conn.query<ResultSetHeader>(
                update_image_meta,
                [title, alt, id]
            );
            if (!result.affectedRows) {
                throw new Error("Error updating record");
            }
        } catch (error: any) {
            throw new Error(error);
        } finally {
            conn.release();
        }
    };
}
