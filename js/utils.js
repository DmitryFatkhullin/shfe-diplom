function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function createDayObject(date, isFirst = false) {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const dayOfWeek = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const month = monthNames[date.getMonth()];
    return {
        date: formatDate(date),
        dayOfWeek: dayOfWeek,
        dayNumber: dayNumber,
        month: month,
        topLine: isFirst ? 'Сегодня' : dayOfWeek + ',',
        bottomLine: isFirst ? `${dayOfWeek}, ${dayNumber}` : dayNumber.toString()
    };
}

function getNextDayFrom(date) {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return next;
}

function getInitialDays(count = 6) {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(createDayObject(date, i === 0));
    }
    return days;
}

function saveToSession(key, data) {
    try {
        const value = data === undefined ? null : data;
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Ошибка сохранения в sessionStorage:', e);
    }
}

function loadFromSession(key) {
    const data = sessionStorage.getItem(key);
    if (!data) return null;
    if (data === 'undefined' || data === 'null') {
        return null;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.warn(`Ошибка парсинга sessionStorage[${key}]:`, e);
        return null;
    }
}

function getRandomFilmColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 20);
    const lightness = 40 + Math.floor(Math.random() * 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}