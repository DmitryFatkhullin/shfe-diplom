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
        <p class="mt-4 text-muted text-booking-info">Покажите QR-код нашему контроллеру для подтверждения бронирования.<br>Приятного просмотра!</p>
    `;

    try {
        if (typeof qrcode === 'undefined') {
            throw new Error('Библиотека qrcode-generator не загружена');
        }
        function generateBookingCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                if (i < 2) code += '-';
            }
            return code;
        }
        const bookingCode = generateBookingCode();
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

        function toBase64(str) {
            return btoa(unescape(encodeURIComponent(str)));
        }

        function fromBase64(str) {
            return decodeURIComponent(escape(atob(str)));
        }
        const originalText = `Дата: ${date}
Время: ${time}
Фильм: ${filmName}
Зал: ${hallName}
Места: ${seatsList}
Всего: ${totalPriceQR} руб.
Билет действителен строго на свой сеанс`;
        const encodedText = toBase64(originalText);
        const qr = qrcode(0, 'M');
        qr.addData(encodedText);
        qr.make();
        document.getElementById('qrcode').innerHTML = qr.createImgTag(5);
    } catch (e) {
        console.error('Ошибка генерации QR-кода:', e);
        document.getElementById('qrcode').innerHTML = '<p style="color:red;">Не удалось создать QR-код</p>';
    }
});