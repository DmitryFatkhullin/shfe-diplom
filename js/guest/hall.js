document.addEventListener('DOMContentLoaded', async () => {
    function updateLegendPrices(hall) {
        const standartPriceSpan = document.querySelector('.standart-price');
        const vipPriceSpan = document.querySelector('.vip-price');
        if (standartPriceSpan) {
            standartPriceSpan.textContent = `(${hall.hall_price_standart}руб)`;
        }
        if (vipPriceSpan) {
            vipPriceSpan.textContent = `(${hall.hall_price_vip}руб)`;
        }
    }
    const params = new URLSearchParams(window.location.search);
    const seanceId = params.get('seanceId');
    const date = params.get('date');
    if (!seanceId || !date) {
        alert('Ошибка: не указан сеанс или дата');
        return;
    }
    const allData = await api.getAllData();
    if (!allData.success) return;
    const { halls, films, seances } = allData.result;
    const seance = seances.find(s => s.id == seanceId);
    if (!seance) return;
    const film = films.find(f => f.id == seance.seance_filmid);
    const hall = halls.find(h => h.id == seance.seance_hallid);
    updateLegendPrices(hall);
    document.getElementById('film-title').textContent = film.film_name;
    document.getElementById('seance-time').textContent = seance.seance_time;
    document.getElementById('hall-name').textContent = hall.hall_name;
    const hallConfigData = await api.getHallConfig(seanceId, date);
    if (!hallConfigData.success) return;
    const config = hallConfigData.result;
    let selectedPlaces = [];

    function renderScheme() {
        const container = document.getElementById('hall-scheme');
        container.innerHTML = '<div class="hall-scheme__screen">ЭКРАН</div>';
        config.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'hall-scheme__row';
            row.forEach((placeType, placeIndex) => {
                const placeDiv = document.createElement('div');
                placeDiv.className = `hall-scheme__place hall-scheme__place--${placeType}`;
                placeDiv.dataset.row = rowIndex + 1;
                placeDiv.dataset.place = placeIndex + 1;
                placeDiv.dataset.type = placeType;
                if (placeType === 'taken' || placeType === 'disabled') {
                    // Занятые и недоступные места не реагируют на клики
                } else {
                    placeDiv.addEventListener('click', () => {
                        if (placeDiv.classList.contains('hall-scheme__place--selected')) {
                            placeDiv.classList.remove('hall-scheme__place--selected');
                            selectedPlaces = selectedPlaces.filter(p => !(p.row === rowIndex + 1 && p.place === placeIndex + 1));
                        } else {
                            placeDiv.classList.add('hall-scheme__place--selected');
                            const price = placeType === 'vip' ? hall.hall_price_vip : hall.hall_price_standart;
                            selectedPlaces.push({ row: rowIndex + 1, place: placeIndex + 1, price, type: placeType });
                        }
                        updateTotal();
                    });
                }
                rowDiv.appendChild(placeDiv);
            });
            container.appendChild(rowDiv);
        });
    }
    function updateTotal() {
        const total = selectedPlaces.reduce((sum, p) => sum + p.price, 0);
        document.getElementById('book-btn').disabled = selectedPlaces.length === 0;
    }
    renderScheme();
    document.getElementById('book-btn').addEventListener('click', () => {
        const bookingData = {
            seanceId,
            date,
            film: film.film_name,
            hall: hall.hall_name,
            time: seance.seance_time,
            places: selectedPlaces.map(p => ({ row: p.row, place: p.place, price: p.price }))
        };
        saveToSession('booking', bookingData);
        window.location.href = 'payment.html';
    });
});


