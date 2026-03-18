document.addEventListener('DOMContentLoaded', () => {
    const booking = loadFromSession('booking');
    if (!booking) {
        window.location.href = 'index.html';
        return;
    }
    const infoDiv = document.getElementById('booking-info');
    const total = booking.places.reduce((sum, p) => sum + p.price, 0);
    infoDiv.innerHTML = `
        <p class="text-booking-info">На фильм:<strong> ${booking.film}</strong></p>
        <p class="text-booking-info">Места:<strong> ${booking.places.map(p => p.place).join(', ')}</strong></p>
        <p class="text-booking-info">В зале:<strong> ${booking.hall}</strong></p>
        <p class="text-booking-info">Начало сеанса:<strong> ${booking.time}</strong></p>
        <p class="text-booking-info">Стоимость:<strong> ${total}</strong> рублей</p>
    `;

    document.getElementById('confirm-btn').addEventListener('click', async () => {
        const ticketsData = booking.places.map(p => ({
            row: p.row,
            place: p.place,
            coast: p.price
        }));
        const response = await api.purchaseTickets(booking.seanceId, booking.date, ticketsData);
        if (response.success && response.result) {
            let purchasedTickets = null;
            if (Array.isArray(response.result)) {
                purchasedTickets = response.result;
            } else if (response.result.tickets && Array.isArray(response.result.tickets)) {
                purchasedTickets = response.result.tickets;
            }
            if (purchasedTickets && purchasedTickets.length > 0) {
                saveToSession('purchasedTickets', purchasedTickets);
                window.location.href = 'ticket.html';
            } else {
                alert('Ошибка при бронировании: не удалось получить билеты');
            }
        } else {
            alert('Ошибка при бронировании: ' + (response.error || 'Неизвестная ошибка'));
        }
    });
});