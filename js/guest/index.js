document.addEventListener('DOMContentLoaded', async () => {
    const datesContainer = document.getElementById('dates-container');
    const filmsContainer = document.getElementById('films-container');
    const nextBtn = document.querySelector('.dates-scroll--next');
    const prevBtn = document.getElementById('dates-scroll-prev');
    let allDays = getInitialDays(6);
    let startIndex = 0;
    let currentDate = allDays[0].date;
    let showPrevButton = false;
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const lastVisibleIndex = startIndex + 6 - 1;
            if (lastVisibleIndex >= allDays.length - 1) {
                const lastDateStr = allDays[allDays.length - 1].date;
                const lastDate = new Date(lastDateStr + 'T00:00:00');
                const nextDate = getNextDayFrom(lastDate);
                const nextDayObj = createDayObject(nextDate, false);
                allDays.push(nextDayObj);
            }
            if (startIndex + 6 <= allDays.length - 1) {
                startIndex++;
                currentDate = allDays[startIndex].date;
                showPrevButton = true;
                renderDates();
                loadFilms();
            }
        });
    }

    function scrollPrev() {
        if (startIndex > 0) {
            startIndex--;
            currentDate = allDays[startIndex].date;
            if (startIndex === 0) {
                showPrevButton = false;
            }
            renderDates();
            loadFilms();
        }
    }

    function renderDates() {
        datesContainer.innerHTML = '';
        const visibleDays = allDays.slice(startIndex, startIndex + 6);

        visibleDays.forEach((day, index) => {
            if (index === 0 && showPrevButton) {
                const backButton = document.createElement('div');
                backButton.className = 'dates__item dates__item--prev-button';
                backButton.innerHTML = '&lt;';
                backButton.addEventListener('click', scrollPrev);
                datesContainer.append(backButton);
                return;
            }
            const dateEl = document.createElement('div');
            const isWeekend = day.dayOfWeek === 'Сб' || day.dayOfWeek === 'Вс';
            let itemClass = 'dates__item';
            if (isWeekend) {
                itemClass += ' dates__item--weekend';
            }
            if (day.date === currentDate) {
                itemClass += ' dates__item--active';
            }
            dateEl.className = itemClass;
            dateEl.dataset.date = day.date;
            dateEl.innerHTML = `${day.topLine}<br>${day.bottomLine}`;
            dateEl.addEventListener('click', () => {
                currentDate = day.date;
                renderDates();
                loadFilms();
            });
            datesContainer.append(dateEl);
        });
        const remainingSlots = 6 - datesContainer.children.length;
        for (let i = 0; i < remainingSlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'dates__item';
            emptySlot.style.visibility = 'hidden';
            emptySlot.style.pointerEvents = 'none';
            datesContainer.append(emptySlot);
        }
    }

    async function loadFilms() {
        const data = await api.getAllData();
        if (!data.success) {
            filmsContainer.innerHTML = '<p>Ошибка загрузки данных</p>';
            return;
        }
        const { halls, films, seances } = data.result;
        const openHalls = halls.filter(h => h.hall_open === 1);
        const openHallIds = openHalls.map(h => h.id);
        if (openHallIds.length === 0) {
            filmsContainer.innerHTML = '<p>Нет открытых залов</p>';
            return;
        }
        const validSeances = seances.filter(s => openHallIds.includes(s.seance_hallid));
        if (validSeances.length === 0) {
            filmsContainer.innerHTML = '<p>Нет сеансов в открытых залах</p>';
            return;
        }
        const today = new Date();
        const selectedDate = new Date(currentDate);
        const isToday = selectedDate.toDateString() === today.toDateString();
        const filmsMap = new Map();
        films.forEach(f => filmsMap.set(f.id, f));
        const filmsWithSeances = [];
        validSeances.forEach(seance => {
            const film = filmsMap.get(seance.seance_filmid);
            if (!film) return;
            let filmEntry = filmsWithSeances.find(f => f.id === film.id);
            if (!filmEntry) {
                filmEntry = { ...film, halls: {} };
                filmsWithSeances.push(filmEntry);
            }
            const hall = openHalls.find(h => h.id === seance.seance_hallid);
            if (!hall) return;
            if (!filmEntry.halls[hall.id]) {
                filmEntry.halls[hall.id] = { name: hall.hall_name, times: [] };
            }
            filmEntry.halls[hall.id].times.push(seance.seance_time);
        });
        filmsWithSeances.forEach(f => {
            Object.values(f.halls).forEach(hall => {
                hall.times.sort((a, b) => a.localeCompare(b));
            });
        });
        filmsContainer.innerHTML = '';
        filmsWithSeances.forEach(film => {
            const filmCard = document.createElement('div');
            filmCard.className = 'film-card';
            const row = document.createElement('div');
            row.className = 'row';
            const posterCol = document.createElement('div');
            posterCol.className = 'col-md-3 col-12 mb-3 mb-md-0 film-card__poster-col';
            const posterImg = document.createElement('img');
            posterImg.className = 'film-card__poster img-fluid rounded';
            posterImg.src = film.film_poster || 'assets/placeholder.png';
            posterImg.alt = film.film_name;
            posterCol.append(posterImg);
            const infoCol = document.createElement('div');
            infoCol.className = 'col-md-9 col-12 film-card__poster-text';
            const title = document.createElement('h2');
            title.className = 'film-card__title';
            title.textContent = film.film_name;
            infoCol.append(title);
            if (film.film_description) {
                const desc = document.createElement('div');
                desc.className = 'film-card__description';
                desc.textContent = film.film_description;
                infoCol.append(desc);
            }
            const info = document.createElement('div');
            info.className = 'film-card__info';
            info.textContent = `${film.film_duration} минут, ${film.film_origin}`;
            infoCol.append(info);
            row.append(posterCol);
            row.append(infoCol);
            filmCard.append(row);
            const seancesDiv = document.createElement('div');
            seancesDiv.className = 'film-card__seances';
            Object.entries(film.halls).forEach(([hallId, hall]) => {
                const hallDiv = document.createElement('div');
                hallDiv.className = 'film-card__hall';
                hallDiv.innerHTML = `<div class="film-card__hall-name">${hall.name}</div>`;
                const timesDiv = document.createElement('div');
                timesDiv.className = 'film-card__times';
                hall.times.forEach(time => {
                    const timeLink = document.createElement('a');
                    timeLink.className = 'film-card__time';
                    const seance = seances.find(s =>
                        s.seance_filmid === film.id &&
                        Number(s.seance_hallid) === Number(hallId) &&
                        s.seance_time === time
                    );
                    const seanceId = seance ? seance.id : '';
                    if (!seanceId) {
                        console.warn('Сеанс не найден:', { filmId: film.id, hallId, time, currentDate });
                    }
                    timeLink.href = `hall.html?seanceId=${seanceId}&date=${currentDate}`;
                    timeLink.textContent = time;
                    if (isToday) {
                        const [hour, minute] = time.split(':').map(Number);
                        const seanceTime = new Date(selectedDate);
                        seanceTime.setHours(hour, minute, 0);
                        if (seanceTime < today) {
                            timeLink.classList.add('film-card__time--disabled');
                            timeLink.removeAttribute('href');
                        }
                    }
                    timesDiv.append(timeLink);
                });
                hallDiv.append(timesDiv);
                seancesDiv.append(hallDiv);
            });
            filmCard.append(seancesDiv);
            filmsContainer.append(filmCard);
        });
    }

    function findSeanceId(seances, filmId, hallName, time) {
        const seance = seances.find(s => s.seance_filmid === filmId && s.seance_time === time);
        return seance ? seance.id : '';
    }
    renderDates();
    loadFilms();
});