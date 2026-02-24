import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import knex from '#postgres/knex.js';
import env from '#config/env/env.js';
import fs from 'fs';
import { TariffRow } from './sheetTypes.types.js';

// Аутентификация через сервисный аккаунт
function getAuthClient() {
    try {
        const credentials = JSON.parse(
            fs.readFileSync(env.GOOGLE_CREDENTIALS_PATH, 'utf8')
        );
        
        return new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    } catch (error) {
        console.error('Ошибка загрузки credentials.json:', error);
        throw error;
    }
}

// Получить список активных таблиц из БД
async function getActiveSpreadsheets() {
    return knex('spreadsheets')
        .where('is_active', true)
        .select('spreadsheet_id', 'name');
}

// Получить актуальные данные для выгрузки
async function getTariffsForExport(): Promise<TariffRow[]> {
    const latestDate = await knex('box_tariffs')
        .max('date as maxDate')
        .first();
    
    if (!latestDate?.maxDate) {
        return [];
    }
    
    const tariffs = await knex('box_tariffs')
        .where('date', latestDate.maxDate)
        .orderBy('box_delivery_coef_expr', 'asc')
        .select(
            'warehouse_name',
            'geo_name',
            'box_delivery_base',
            'box_delivery_coef_expr',
            'box_delivery_liter',
            'box_delivery_marketplace_base',
            'box_delivery_marketplace_coef_expr',
            'box_delivery_marketplace_liter',
            'box_storage_base',
            'box_storage_coef_expr',
            'box_storage_liter'
        );
    
    return tariffs;
}

// Форматирование данных
function formatDataForSheet(tariffs: TariffRow[]): any[][] {
    const headers = [
        'Название склада',
        'Регион',
        'Доставка (база)',
        'Доставка (коэф)',
        'Доставка (литр)',
        'Маркетплейс (база)',
        'Маркетплейс (коэф)',
        'Маркетплейс (литр)',
        'Хранение (база)',
        'Хранение (коэф)',
        'Хранение (литр)',
        'Дата обновления'
    ];
    
    const rows = [headers];
    const today = new Date().toLocaleDateString('ru-RU');
    
    tariffs.forEach(t => {
        rows.push([
            t.warehouse_name,
            t.geo_name || '-',
            t.box_delivery_base?.toString() || '-',
            t.box_delivery_coef_expr?.toString() || '-',
            t.box_delivery_liter?.toString() || '-',
            t.box_delivery_marketplace_base?.toString() || '-',
            t.box_delivery_marketplace_coef_expr?.toString() || '-',
            t.box_delivery_marketplace_liter?.toString() || '-',
            t.box_storage_base?.toString() || '-',
            t.box_storage_coef_expr?.toString() || '-',
            t.box_storage_liter?.toString() || '-',
            today
        ]);
    });
    
    return rows;
}

async function updateSheet(sheetId: string, rows: any[][]) {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId: sheetId,
            range: 'stocks_coefs!A2:L',
        });
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'stocks_coefs!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: rows
            }
        });
        
        await knex('spreadsheets')
            .where('spreadsheet_id', sheetId)
            .update({ 
                last_export_at: knex.fn.now(),
                updated_at: knex.fn.now() 
            });
        
        console.log(`Таблица ${sheetId} обновлена, записей: ${rows.length - 1}`);
        return true;
    } catch (error) {
        console.error(`Ошибка обновления таблицы ${sheetId}:`, error);
        return false;
    }
}

// Основная функция экспорта
export async function exportToAllSheets() {
    console.log(`[${new Date().toISOString()}] Начинаем экспорт в Google Sheets...`);
    
    try {
        const tariffs = await getTariffsForExport();
        
        if (tariffs.length === 0) {
            console.log('Нет данных для экспорта');
            return;
        }
        
        const rows = formatDataForSheet(tariffs);
    
        const spreadsheets = await getActiveSpreadsheets();
        
        if (spreadsheets.length === 0) {
            console.log('Нет активных таблиц для экспорта');
            return;
        }
        
        console.log(`Обновляем ${spreadsheets.length} таблиц...`);
        
        // Обновляем каждую таблицу
        let successCount = 0;
        for (const sheet of spreadsheets) {
            const success = await updateSheet(sheet.spreadsheet_id, rows);
            if (success) successCount++;
        }
        
        console.log(`[${new Date().toISOString()}] Экспорт завершен. Успешно: ${successCount}/${spreadsheets.length}`);
    } catch (error) {
        console.error('Критическая ошибка экспорта:', error);
    }
}

// Добавление новой таблицы
export async function addSpreadsheet(sheetId: string, name: string = '') {
    try {

        const existing = await knex('spreadsheets')
            .where('spreadsheet_id', sheetId)
            .first();
        
        if (existing) {
            await knex('spreadsheets')
                .where('spreadsheet_id', sheetId)
                .update({ 
                    is_active: true,
                    updated_at: knex.fn.now()
                });
            console.log(`Таблица ${sheetId} активирована`);
        } else {
            await knex('spreadsheets').insert({
                spreadsheet_id: sheetId,
                name: name,
                is_active: true,
                created_at: knex.fn.now()
            });
            console.log(`Таблица ${sheetId} добавлена`);
        }
        return true;
    } catch (error) {
        console.error('Ошибка добавления таблицы:', error);
        return false;
    }
}

// Удаление/деактивация таблицы
export async function removeSpreadsheet(sheetId: string) {
    try {
        await knex('spreadsheets')
            .where('spreadsheet_id', sheetId)
            .update({ 
                is_active: false,
                updated_at: knex.fn.now()
            });
        console.log(`Таблица ${sheetId} деактивирована`);
        return true;
    } catch (error) {
        console.error('Ошибка удаления таблицы:', error);
        return false;
    }
}

// Получение статуса всех таблиц
export async function getSpreadsheetsStatus() {
    return knex('spreadsheets')
        .select('spreadsheet_id', 'name', 'is_active', 'last_export_at', 'created_at')
        .orderBy('created_at', 'desc');
}