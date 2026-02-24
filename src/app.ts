import express from "express";
import knex, { migrate, seed } from "#postgres/knex.js";
import { updateTariffs } from "#services/sheduler/schedulerService.js";
import { fetchBoxTariffs } from "#services/wbApi/wbApiService.js";
import { saveTariffs } from "#services/tariffs/tariffService.js";
import { addSpreadsheet, exportToAllSheets, removeSpreadsheet } from "#services/googleSheetService/googleSheetsService.js";

const app = express();
const port = Number(process.env.PORT) || 5005;


app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "BTLZ Test API",
        status: "work",
        timestamp: new Date().toISOString(),
    });
});

app.get("/tariffs/api", async (req, res) => {
    try {
        const tariffs = await knex('box_tariffs')
            .where('date', new Date().toISOString().split('T')[0])
            .orderBy('box_delivery_coef_expr', 'asc');
        res.json(tariffs);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения данных' });
    }
});

app.post("/sheets/add", async (req, res) => {
    try {
        const { sheetId, name } = req.body;
        if (!sheetId) {
            return res.status(400).json({ error: "sheetId обязателен" });
        }
        await addSpreadsheet(sheetId, name);
        res.json({ message: `Таблица ${sheetId} добавлена` });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});


app.delete("/sheets/:sheetId", async (req, res) => {
    try {
        const { sheetId } = req.params;
        await removeSpreadsheet(sheetId);
        res.json({ message: `Таблица ${sheetId} удалена` });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.post("/sheets/export", async (req, res) => {
    try {
        await exportToAllSheets();
        res.json({ message: "Экспорт запущен" });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});


async function startServer() {
    try {
        await migrate.latest();
        await seed.run();
        console.log("База данных готова");

        app.listen(port, "0.0.0.0", () => {
            console.log(`Сервер запущен на порту ${port}`);
        });
         console.log("Запуск первоначального обновления тарифов...");
        await updateTariffs();
        
        console.log("Планировщик запущен (будет обновлять тарифы каждый час)");
    } catch (error) {
        console.error("Ошибка запуска:", error);
        process.exit(1);
    }
}

startServer();
