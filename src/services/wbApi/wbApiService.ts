import axios from 'axios';
import env from '#config/env/env.js';
import { WarehouseTariff, WBApiResponse } from './wbTypes.types.js';


const WB_API_URL = 'https://common-api.wildberries.ru/api/v1/tariffs/box';
const API_KEY = env.WB_API_KEY; 


// Получаем данные с WB
export async function fetchBoxTariffs(date: string): Promise<WarehouseTariff[]> {
    try {
        const response = await axios.get<WBApiResponse>(WB_API_URL, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            },
            params: {
                date: date
            }
        });

        return response.data.response.data.warehouseList;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Неверный API ключ WB');
            } else if (error.response?.status === 429) {
                throw new Error('Слишком много запросов к WB API');
            }
        }
        throw error;
    }
}
