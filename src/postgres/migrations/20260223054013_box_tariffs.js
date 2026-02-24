/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable('box_tariffs', (table) => {
        table.increments('id').primary();
        
        table.date('date').notNullable();
        
        table.string('warehouse_name', 255).notNullable();
        
        table.string('geo_name', 255);
        
        // ТАРИФЫ ДОСТАВКИ
        table.decimal('box_delivery_base', 10, 2);
        table.decimal('box_delivery_coef_expr', 10, 2);
        table.decimal('box_delivery_liter', 10, 2);
        
        // ТАРИФЫ МАРКЕТПЛЕЙСА
        table.decimal('box_delivery_marketplace_base', 10, 2);
        table.decimal('box_delivery_marketplace_coef_expr', 10, 2);
        table.decimal('box_delivery_marketplace_liter', 10, 2);
        
        // ТАРИФЫ ХРАНЕНИЯ
        table.decimal('box_storage_base', 10, 2);
        table.decimal('box_storage_coef_expr', 10, 2);
        table.decimal('box_storage_liter', 10, 2);
        

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        
        // Уникальность
        table.unique(['date', 'warehouse_name']);
    });

    // Индексы
    await knex.schema.alterTable('box_tariffs', (table) => {
        table.index('date');
        table.index('box_delivery_coef_expr');
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('box_tariffs');
}