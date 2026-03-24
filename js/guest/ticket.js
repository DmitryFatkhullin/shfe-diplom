document.addEventListener('DOMContentLoaded', () => {
    const tickets = loadFromSession('purchasedTickets');
    if (!tickets || tickets.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    const container = document.getElementById('ticket-container');
    const allTickets = tickets;
    const firstTicket = allTickets[0];
    const filmName = firstTicket.ticket_filmname || firstTicket.film_name || 'Неизвестно';
    const hallName = firstTicket.ticket_hallname || firstTicket.hall_name || 'Неизвестно';
    const time = firstTicket.ticket_time || firstTicket.time || '?';
    const date = firstTicket.ticket_date || firstTicket.date || '?';
    let placesList = '';
    let totalPrice = 0;
    allTickets.forEach((ticket, index) => {
        const row = ticket.ticket_row || ticket.row || '?';
        const place = ticket.ticket_place || ticket.place || '?';
        const price = ticket.ticket_price || ticket.price || 0;
        totalPrice += parseInt(price);
        placesList += `<span class="ticket-place-item">ряд ${row} место ${place}</span>`;
        if (index < allTickets.length - 1) {
            placesList += ', ';
        }
    });
    container.innerHTML = `
        <h2 class="ticket__title">ЭЛЕКТРОННЫЙ БИЛЕТ</h2>
        <div class="ticket__info">
            <p class="text-ticket-info">На фильм: <strong>${filmName}</strong></p>
            <p class="text-ticket-info">Места: <strong>${placesList}</strong></p>
            <p class="text-ticket-info">В зале: <strong>${hallName}</strong></p>
            <p class="text-ticket-info">Начало сеанса: <strong>${time}</strong></p>
        </div>
        <div class="ticket__qrcode" id="qrcode"></div>
        <p class="mt-4 text-muted text-booking-info-bottom-first-str">Покажите QR-код нашему контроллеру для подтверждения бронирования.<p class="mt-4 text-muted text-booking-info-bottom-second-str">Приятного просмотра!</p></p>
    `;
    try {
        if (typeof QRCode === 'undefined') {
            throw new Error('Библиотека QRCode не загружена');
        }
        let seatsList = '';
        allTickets.forEach((ticket, index) => {
            const row = ticket.ticket_row || ticket.row || '?';
            const place = ticket.ticket_place || ticket.place || '?';
            const price = ticket.ticket_price || ticket.price || 0;
            seatsList += `Ряд ${row}, Место ${place} (${price} руб)`;
            if (index < allTickets.length - 1) {
                seatsList += '; ';
            }
        });

        const totalPriceQR = allTickets.reduce((sum, t) =>
            sum + (parseInt(t.ticket_price || t.price || 0)), 0
        );
        const qrText = `Дата: ${date}
Время: ${time}
Фильм: ${filmName}
Зал: ${hallName}
Места: ${seatsList}
Всего: ${totalPriceQR} руб.
Билет действителен строго на свой сеанс`;
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.id = 'qr-canvas';
        canvas.width = 200;
        canvas.height = 200;
        qrContainer.appendChild(canvas);
        QRCode.toCanvas(canvas, qrText, { width: 200 }, function (error) {
            if (error) {
                console.error('Ошибка создания QR-кода:', error);
                qrContainer.innerHTML = '<p style="color:red;">Не удалось создать QR-код</p>';
            }
        });

    } catch (e) {
        console.error('Ошибка генерации QR-кода:', e);
        document.getElementById('qrcode').innerHTML = '<p style="color:red;">Не удалось создать QR-код</p>';
    }
});