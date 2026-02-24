export interface WarehouseTariff {
    warehouseName: string;
    geoName: string;
    boxDeliveryBase: string;
    boxDeliveryCoefExpr: string;
    boxDeliveryLiter: string;
    boxDeliveryMarketplaceBase: string;
    boxDeliveryMarketplaceCoefExpr: string;
    boxDeliveryMarketplaceLiter: string;
    boxStorageBase: string;
    boxStorageCoefExpr: string;
    boxStorageLiter: string;
}

export interface WBApiResponse {
    response: {
        data: {
            dtNextBox: string;
            dtTillMax: string;
            warehouseList: WarehouseTariff[];
        }
    }
}