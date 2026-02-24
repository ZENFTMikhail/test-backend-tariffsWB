/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
   const sheets = [
        {
            spreadsheet_id: "12inYwdJZ-468dQj2lXQgYJNpD6qgCjf72SR3RmetEYA",
            name: "Тарифы WB - Основная",
            is_active: true,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            spreadsheet_id: "1OquDVeai6429XjtPMtZFqYkR9BPLB3-fOvpmdecyfq8",
            name: "Тарифы WB - Тестовая",
            is_active: true,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }
    ];
    
    for (const sheet of sheets) {
        await knex("spreadsheets")
            .insert(sheet)
            .onConflict(["spreadsheet_id"])
            .merge();
    }
}
