import knex from '#postgres/knex.js';
import { parseDecimal } from '#services/wbApi/utils.js';
import { WarehouseTariff } from '#services/wbApi/wbTypes.types.js';


export async function saveTariffs(date: string, tariffs: WarehouseTariff[]) {
    const operations = tariffs.map(tariff => {
        const record = {
            date: date,
            warehouse_name: tariff.warehouseName,
            geo_name: tariff.geoName || null,
            
            // Тарифы доставки
            box_delivery_base: parseDecimal(tariff.boxDeliveryBase),
            box_delivery_coef_expr: parseDecimal(tariff.boxDeliveryCoefExpr),
            box_delivery_liter: parseDecimal(tariff.boxDeliveryLiter),
            
            // Тарифы маркетплейса
            box_delivery_marketplace_base: parseDecimal(tariff.boxDeliveryMarketplaceBase),
            box_delivery_marketplace_coef_expr: parseDecimal(tariff.boxDeliveryMarketplaceCoefExpr),
            box_delivery_marketplace_liter: parseDecimal(tariff.boxDeliveryMarketplaceLiter),
            
            // Тарифы хранения
            box_storage_base: parseDecimal(tariff.boxStorageBase),
            box_storage_coef_expr: parseDecimal(tariff.boxStorageCoefExpr),
            box_storage_liter: parseDecimal(tariff.boxStorageLiter),
            
            updated_at: knex.fn.now()
        };

        return knex('box_tariffs')
            .insert(record)
            .onConflict(['date', 'warehouse_name'])
            .merge();
    });

    await Promise.all(operations);
    console.log(`[${new Date().toISOString()}] Сохранено ${tariffs.length} записей за ${date}`);
}

export async function getTariffsByDate(date: string) {
    return knex('box_tariffs')
        .where('date', date)
        .orderBy('box_delivery_coef_expr', 'asc');
}

export async function getLatestTariffs() {
    const latestDate = await knex('box_tariffs')
        .max('date as maxDate')
        .first();
    
    if (!latestDate?.maxDate) return [];
    
    return getTariffsByDate(latestDate.maxDate);
}