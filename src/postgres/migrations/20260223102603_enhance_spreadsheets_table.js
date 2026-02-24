/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.alterTable('spreadsheets', (table) => {
        table.string('name', 255);
        table.timestamp('last_export_at');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.alterTable('spreadsheets', (table) => {
        table.dropColumn('name');
        table.dropColumn('last_export_at');
        table.dropColumn('is_active');
        table.dropColumn('created_at');
    });
}
