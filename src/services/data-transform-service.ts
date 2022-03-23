export default class DataTransformer {
    constructor() {}

    public transformForCategories = (datas: any[]) => {
        let transformedData: any[] = [];
        datas.map((data) => {
            const index = transformedData.findIndex((d) => d.id == data.id);
            if (index == -1) {
                const targetData = datas.filter((d) => d.id == data.id);
                const categories: any[] = [];
                targetData.map((tdata) => {
                    if (tdata.category_name !== null) {
                        categories.push({
                            id: tdata.category_id,
                            name: tdata.category_name,
                        });
                    }
                });
                data.categories = categories;
                if ("password" in data) delete data.password;
                if ("auth_token" in data) delete data.auth_token;
                if ("category_id" in data) delete data.category_id;
                if ("category_name" in data) delete data.category_name;
                transformedData.push(data);
            }
        });
        return transformedData;
    };
}
