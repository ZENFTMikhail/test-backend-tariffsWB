// Функция для преобразования строки с запятой в число
export function parseDecimal(str: string): number | null {
    if (str === '-' || str === '' || str === null || str === undefined) {
        return null;
    }
    const num = parseFloat(str.replace(',', '.'));
    return isNaN(num) ? null : num;
}