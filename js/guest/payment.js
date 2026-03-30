document.addEventListener('DOMContentLoaded', () => {
    const booking = loadFromSession('booking');
    if (!booking) {
        window.location.href = 'index.html';
        return;
    }
    const infoDiv = document.getElementById('booking-info');
    const total = booking.places.reduce((sum, p) => sum + p.price, 0);
    infoDiv.innerHTML = `
        <div class="text-booking-info">На фильм:<span class="text-booking-info-bold"> ${booking.film}</span></div>
        <div class="text-booking-info">Места:<span class="text-booking-info-bold"> ${booking.places.map(p => p.place).join(', ')}</strong></div>
        <div class="text-booking-info">В зале:<span class="text-booking-info-bold"> ${booking.hall}</span></div>
        <div class="text-booking-info">Начало сеанса:<span class="text-booking-info-bold"> ${booking.time}</span></div>
        <div class="text-booking-info">Стоимость:<span class="text-booking-info-bold"> ${total}</span> рублей</div>
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
            }
        }
    });
});