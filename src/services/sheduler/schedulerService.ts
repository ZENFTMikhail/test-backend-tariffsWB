import { exportToAllSheets } from '#services/googleSheetService/googleSheetsService.js';
import { saveTariffs } from '#services/tariffs/tariffService.js';
import { fetchBoxTariffs } from '#services/wbApi/wbApiService.js';
import cron from 'node-cron';


export async function updateTariffs() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[${new Date().toISOString()}] Запуск обновления тарифов за ${today}`);
    
    try {
        const tariffs = await fetchBoxTariffs(today);
        await saveTariffs(today, tariffs);
        console.log(`[${new Date().toISOString()}] Обновление завершено успешно`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Ошибка обновления:`, error);
    }
}

// Запуск каждый час (в 5 минут) обновление тарифов в БД
cron.schedule('5 * * * *', async () => {
    try {
        await updateTariffs();
        console.log(`[${new Date().toISOString()}] Обновили тарифы в БД`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Критическая ошибка в cron:`, error);
    }
});

// Экспорт данных в таблицы раз в день
cron.schedule('38 11 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Запуск ежедневного экспорта в Google Sheets`);
    try {
        await exportToAllSheets();
        console.log(`[${new Date().toISOString()}] Экспорт завершён`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Ошибка экспорта:`, error);
    }
});