



export function generateRandomSquares(count = 20) {
    const cols = 16;
    const rows = 9;
    const stepX = 100 / cols; // ~6.25%
    const stepY = 100 / rows; // ~11.11%

    const polygons: { full: string; collapsed: string }[] = [];

    for (let i = 0; i < count; i++) {
        // Случайная стартовая ячейка (оставляем место для размера 1 или 2)
        const xIdx = Math.floor(Math.random() * (cols - 1));
        const yIdx = Math.floor(Math.random() * (rows - 1));

        // Случайный размер: 1 или 2 ячейки
        const wCells = Math.random() > 0.6 ? 2 : 1;
        const hCells = Math.random() > 0.6 ? 2 : 1;

        // Координаты в процентах
        const x1 = xIdx * stepX;
        const y1 = yIdx * stepY;
        const x2 = (xIdx + wCells) * stepX;
        const y2 = (yIdx + hCells) * stepY;

        // Полный квадрат
        const full = `polygon(${x1}% ${y1}%, ${x2}% ${y1}%, ${x2}% ${y2}%, ${x1}% ${y2}%)`;

        // Сжатый квадрат (в точку левого верхнего угла)
        const collapsed = `polygon(${x1}% ${y1}%, ${x1}% ${y1}%, ${x1}% ${y1}%, ${x1}% ${y1}%)`;

        polygons.push({ full, collapsed });
    }

    return {
        full: polygons.map((p) => p.full).join(", "),
        collapsed: polygons.map((p) => p.collapsed).join(", "),
    };
}