let pendingSeances = {
    added: [],
    deleted: []
};
let timelineData = [];
let tempSeanceData = null;

function initSeancesModule() {
    buildTimeline();
    attachDeleteListener();
    attachSaveCancelListeners();
    initSeanceModal();
}

function initSeanceModal() {
    const hallSelect = document.getElementById('seance-hall-select');
    if (hallSelect) {
        hallSelect.innerHTML = '<option value="">Выберите зал</option>';
        window.appData.halls.forEach(hall => {
            const option = document.createElement('option');
            option.value = hall.id;
            option.textContent = hall.hall_name;
            hallSelect.append(option);
        });
    }
    updateFilmSelect();
    const filmSelect = document.getElementById('seance-film-select');
    if (filmSelect) {
        filmSelect.innerHTML = '<option value="">Выберите фильм</option>';
        window.appData.films.forEach(film => {
            const option = document.createElement('option');
            option.value = film.id;
            option.textContent = film.film_name;
            filmSelect.append(option);
        });
    }
    document.getElementById('addSeanceModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('seance-hall-select').value = '';
        document.getElementById('seance-film-select').value = '';
        document.getElementById('seance-time').value = '00:00';
        tempSeanceData = null;
        const errorDiv = document.getElementById('seance-error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
        const timeInput = document.getElementById('seance-time');
        if (timeInput) {
            timeInput.classList.remove('error');
        }
    });
    document.getElementById('add-seance-submit').addEventListener('click', () => {
        const hallId = document.getElementById('seance-hall-select').value;
        const filmId = document.getElementById('seance-film-select').value;
        const time = document.getElementById('seance-time').value;
        const errorDiv = document.getElementById('seance-error-message');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        clearError(document.getElementById('seance-time'));
        if (!hallId || !filmId || !time) {
            errorDiv.textContent = 'Заполните все поля';
            errorDiv.style.display = 'block';
            return;
        }
        const validation = validateSeanceTime(hallId, time, filmId);
        if (!validation.valid) {
            errorDiv.textContent = validation.message;
            errorDiv.style.display = 'block';
            document.getElementById('seance-time').classList.add('error');
            return;
        }
        if (!isTimeSlotFreeWithPending(hallId, time, filmId)) {
            errorDiv.textContent = 'Это время уже занято (включая несохранённые изменения)';
            errorDiv.style.display = 'block';
            document.getElementById('seance-time').classList.add('error');
            return;
        }
        pendingSeances.added.push({
            hallId: hallId,
            filmId: filmId,
            time: time
        });
        bootstrap.Modal.getInstance(document.getElementById('addSeanceModal')).hide();
        document.getElementById('seance-hall-select').value = '';
        document.getElementById('seance-film-select').value = '';
        document.getElementById('seance-time').value = '00:00';
        errorDiv.style.display = 'none';
        buildTimeline();
    });
}

function openAddSeanceModal(hallId = null, filmId = null, time = null) {
    const modal = new bootstrap.Modal(document.getElementById('addSeanceModal'));
    if (hallId) {
        document.getElementById('seance-hall-select').value = hallId;
    }
    if (filmId) {
        document.getElementById('seance-film-select').value = filmId;
    }
    if (time) {
        document.getElementById('seance-time').value = time;
    }
    modal.show();
}

function buildTimeline() {
    const halls = window.appData.halls;
    const seances = window.appData.seances;
    const films = window.appData.films;
    const TOTAL_MINUTES = 24 * 60;
    const timelineDiv = document.getElementById('timeline');
    timelineDiv.innerHTML = '';
    halls.forEach(hall => {
        const hallTimeline = document.createElement('div');
        hallTimeline.className = 'hall-timeline';
        const hallHeader = document.createElement('div');
        hallHeader.className = 'timeline-hall-header';
        hallHeader.textContent = hall.hall_name;
        hallTimeline.append(hallHeader);
        const timelineRow = document.createElement('div');
        timelineRow.className = 'timeline-row-with-delete';
        const deleteZone = document.createElement('div');
        deleteZone.className = 'delete-zone hidden';
        deleteZone.dataset.hallId = hall.id;
        const deleteIcon = document.createElement('div');
        deleteIcon.className = 'delete-zone__icon';
        deleteZone.append(deleteIcon);
        const deleteText = document.createElement('span');
        deleteText.className = 'delete-zone__text';
        deleteZone.append(deleteText);
        timelineRow.append(deleteZone);
        const timelineContent = document.createElement('div');
        timelineContent.className = 'timeline-content';
        const seancesRow = document.createElement('div');
        seancesRow.className = 'timeline-seances-row';
        const seancesContainer = document.createElement('div');
        seancesContainer.className = 'timeline-seances-container';
        seancesContainer.dataset.hallId = hall.id;
        seancesContainer.dataset.hallName = hall.hall_name;
        const hallSeances = seances.filter(s =>
            s.seance_hallid === hall.id && !pendingSeances.deleted.includes(s.id.toString())
        );
        hallSeances.forEach(seance => {
            const film = films.find(f => f.id === seance.seance_filmid);
            if (!film) return;
            const [startHours, startMinutes] = seance.seance_time.split(':').map(Number);
            const start = startHours * 60 + startMinutes;
            const duration = film.film_duration;
            const leftPercent = (start / TOTAL_MINUTES) * 100;
            const widthPercent = (duration / TOTAL_MINUTES) * 100;
            const seanceEl = document.createElement('div');
            seanceEl.className = 'timeline-seance';
            seanceEl.style.left = leftPercent + '%';
            seanceEl.style.width = widthPercent + '%';
            const textSpan = document.createElement('span');
            textSpan.textContent = film.film_name;
            seanceEl.append(textSpan);
            seanceEl.style.backgroundColor = film.color;
            seanceEl.style.color = '#fff';
            seanceEl.draggable = true;
            seanceEl.dataset.seanceId = seance.id;
            seanceEl.dataset.filmId = film.id;
            seanceEl.dataset.hallId = hall.id;
            seanceEl.dataset.time = seance.seance_time;
            seanceEl.dataset.isPending = 'false';
            seanceEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('seanceId', seance.id);
                e.dataTransfer.setData('hallId', hall.id.toString());
                e.dataTransfer.setData('isPending', 'false');
                e.dataTransfer.setData('filmId', film.id.toString());
                e.dataTransfer.setData('time', seance.seance_time);
                e.dataTransfer.setData('text/plain', seance.id);
                const hallTimeline = seanceEl.closest('.hall-timeline');
                const deleteZone = hallTimeline.querySelector('.delete-zone');
                if (deleteZone) {
                    deleteZone.classList.remove('hidden');
                }
            });
            seanceEl.addEventListener('dragend', (e) => {
                document.querySelectorAll('.delete-zone').forEach(zone => {
                    zone.classList.add('hidden');
                    zone.classList.remove('drag-over');
                });
            });
            seancesContainer.append(seanceEl);
        });
        pendingSeances.added.forEach((item, index) => {
            if (item.hallId == hall.id) {
                const film = films.find(f => f.id == item.filmId);
                if (!film) return;
                const [startHours, startMinutes] = item.time.split(':').map(Number);
                const start = startHours * 60 + startMinutes;
                const duration = film.film_duration;
                const leftPercent = (start / TOTAL_MINUTES) * 100;
                const widthPercent = (duration / TOTAL_MINUTES) * 100;
                const tempSeance = document.createElement('div');
                tempSeance.className = 'timeline-seance timeline-seance--pending';
                tempSeance.style.left = leftPercent + '%';
                tempSeance.style.width = widthPercent + '%';
                const textSpan = document.createElement('span');
                textSpan.textContent = film.film_name + ' (новый)';
                tempSeance.append(textSpan);
                tempSeance.style.backgroundColor = film.color;
                tempSeance.style.color = '#fff';
                tempSeance.draggable = true;
                tempSeance.dataset.isPending = 'true';
                tempSeance.dataset.filmId = film.id.toString();
                tempSeance.dataset.time = item.time;
                tempSeance.dataset.hallId = hall.id.toString();
                tempSeance.dataset.seanceId = 'temp_' + Date.now() + '_' + index;
                tempSeance.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', tempSeance.dataset.seanceId);
                    e.dataTransfer.setData('seanceId', tempSeance.dataset.seanceId);
                    e.dataTransfer.setData('isPending', 'true');
                    e.dataTransfer.setData('filmId', film.id.toString());
                    e.dataTransfer.setData('time', item.time);
                    e.dataTransfer.setData('hallId', hall.id.toString());
                    const hallTimeline = tempSeance.closest('.hall-timeline');
                    const deleteZone = hallTimeline.querySelector('.delete-zone');
                    if (deleteZone) {
                        deleteZone.classList.remove('hidden');
                    }
                });
                tempSeance.addEventListener('dragend', (e) => {
                    document.querySelectorAll('.delete-zone').forEach(zone => {
                        zone.classList.add('hidden');
                        zone.classList.remove('drag-over');
                    });
                });
                seancesContainer.append(tempSeance);
            }
        });
        seancesRow.append(seancesContainer);
        timelineContent.append(seancesRow);
        const timeRow = document.createElement('div');
        timeRow.className = 'timeline-time-row';
        const timeLabelsContainer = document.createElement('div');
        timeLabelsContainer.className = 'timeline-labels-container';
        const hallTimes = [...new Set(hallSeances.map(s => s.seance_time))].sort((a, b) => {
            const [h1, m1] = a.split(':').map(Number);
            const [h2, m2] = b.split(':').map(Number);
            return h1 * 60 + m1 - (h2 * 60 + m2);
        });
        hallTimes.forEach(time => {
            const label = document.createElement('div');
            label.className = 'timeline-time-label';
            label.textContent = time;
            const [hours, minutes] = time.split(':').map(Number);
            const minutesFromStart = hours * 60 + minutes;
            const leftPercent = (minutesFromStart / TOTAL_MINUTES) * 100;
            label.style.left = leftPercent + '%';
            timeLabelsContainer.append(label);
        });
        timeRow.append(timeLabelsContainer);
        timelineContent.append(timeRow);
        timelineRow.append(timelineContent);
        hallTimeline.append(timelineRow);
        timelineDiv.append(hallTimeline);
    });
    document.querySelectorAll('.timeline-seances-container').forEach(container => {
        if (container._dragHandlerInstalled) {
            container.removeEventListener('dragover', container._dragoverHandler);
            container.removeEventListener('drop', container._dropHandler);
        }
        container._dragoverHandler = (e) => e.preventDefault();
        container._dropHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const filmId = e.dataTransfer.getData('filmId');
            if (!filmId) return;
            const hallId = container.dataset.hallId;
            const rect = container.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const percent = (offsetX / rect.width) * 100;
            const minutesFromStart = (percent / 100) * TOTAL_MINUTES;
            const hours = Math.floor(minutesFromStart / 60);
            const minutes = Math.floor(minutesFromStart % 60);
            const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            tempSeanceData = {
                hallId: hallId,
                filmId: filmId,
                time: time
            };
            openAddSeanceModal(hallId, filmId, time);
        };
        container.addEventListener('dragover', container._dragoverHandler);
        container.addEventListener('drop', container._dropHandler);
        container._dragHandlerInstalled = true;
    });
    document.querySelectorAll('.delete-zone').forEach(zone => {
        if (zone._dragHandlerInstalled) {
            zone.removeEventListener('dragover', zone._dragoverHandler);
            zone.removeEventListener('dragleave', zone._dragleaveHandler);
            zone.removeEventListener('drop', zone._dropHandler);
        }
        zone._dragoverHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('drag-over');
        };
        zone._dragleaveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
        };
        zone._dropHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
            zone.classList.add('hidden');

            const seanceId = e.dataTransfer.getData('seanceId');
            const isPending = e.dataTransfer.getData('isPending');
            const hallId = e.dataTransfer.getData('hallId');
            const filmId = e.dataTransfer.getData('filmId');
            const time = e.dataTransfer.getData('time');
            const zoneHallId = zone.dataset.hallId;

            if (!seanceId || hallId !== zoneHallId) return;
            window.pendingDeleteSeance = {
                seanceId,
                isPending,
                hallId,
                filmId,
                time
            };
            let filmName = 'этот фильм';
            if (isPending === 'true') {
                const film = window.appData.films.find(f => f.id == filmId);
                if (film) filmName = film.film_name;
            } else {
                const seance = window.appData.seances.find(s => s.id == seanceId);
                if (seance) {
                    const film = window.appData.films.find(f => f.id == seance.seance_filmid);
                    if (film) filmName = film.film_name;
                }
            }
            const filmNameSpan = document.getElementById('delete-film-name');
            if (filmNameSpan) {
                filmNameSpan.textContent = filmName;
            }
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteSeanceModal'));
            deleteModal.show();
        };
        zone.addEventListener('dragover', zone._dragoverHandler);
        zone.addEventListener('dragleave', zone._dragleaveHandler);
        zone.addEventListener('drop', zone._dropHandler);
        zone._dragHandlerInstalled = true;
    });
}

function isTimeSlotFreeWithPending(hallId, startTime, filmId) {
    if (!isTimeSlotFree(hallId, startTime, filmId)) {
        return false;
    }
    const film = window.appData.films.find(f => f.id == filmId);
    if (!film) return false;
    const start = timeToMinutes(startTime);
    const end = start + film.film_duration;
    for (let item of pendingSeances.added) {
        if (item.hallId != hallId) continue;
        const itemFilm = window.appData.films.find(f => f.id == item.filmId);
        if (!itemFilm) continue;
        const itemStart = timeToMinutes(item.time);
        const itemEnd = itemStart + itemFilm.film_duration;
        if (start < itemEnd && end > itemStart) {
            return false;
        }
    }
    return true;
}

function attachSaveCancelListeners() {
    document.getElementById('seance-save').addEventListener('click', async () => {
        for (const seanceId of pendingSeances.deleted) {
            const result = await api.deleteSeance(seanceId);
            if (!result.success) {
                console.error('Ошибка при удалении сеанса:', result);
            }
        }
        for (const item of pendingSeances.added) {
            const result = await api.addSeance(item.hallId, item.filmId, item.time);
            if (!result.success) {
                console.error('Ошибка при добавлении сеанса:', result);
            }
        }
        const data = await api.getAllData();
        if (data.success) {
            window.appData.seances = data.result.seances;
            pendingSeances = {
                added: [],
                deleted: []
            };
            buildTimeline();
        }
    });
    document.getElementById('seance-cancel').addEventListener('click', () => {
        if (pendingSeances.added.length > 0 || pendingSeances.deleted.length > 0) {
            pendingSeances = {
                added: [],
                deleted: []
            };
            buildTimeline();
        }
    });
}

function attachDeleteListener() {
    document.removeEventListener('dragover', window._globalDragover);
    document.removeEventListener('drop', window._globalDrop);
    window._globalDragover = (e) => e.preventDefault();
    window._globalDrop = async (e) => {
        const seanceId = e.dataTransfer.getData('seanceId');
        if (!seanceId) return;
        if (!e.target.closest('.timeline') && !e.target.closest('.delete-zone')) {
            e.preventDefault();
            if (confirm('Удалить сеанс?')) {
                const result = await api.deleteSeance(seanceId);
                if (result.success) {
                    window.appData.seances = result.result.seances;
                    buildTimeline();
                }
            }
        }
    };
    document.addEventListener('dragover', window._globalDragover);
    document.addEventListener('drop', window._globalDrop);
}

function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function isTimeSlotFree(hallId, startTime, filmId) {
    const film = window.appData.films.find(f => f.id == filmId);
    if (!film) return false;
    const start = timeToMinutes(startTime);
    const end = start + film.film_duration;
    const hallSeances = window.appData.seances.filter(s => s.seance_hallid == hallId);
    for (let s of hallSeances) {
        const sFilm = window.appData.films.find(f => f.id == s.seance_filmid);
        if (!sFilm) continue;
        const sStart = timeToMinutes(s.seance_time);
        const sEnd = sStart + sFilm.film_duration;
        if (start < sEnd && end > sStart) return false;
    }
    return true;
}

function updateFilmSelect() {
    const filmSelect = document.getElementById('seance-film-select');
    if (!filmSelect) return;
    const currentValue = filmSelect.value;
    filmSelect.innerHTML = '<option value="">Выберите фильм</option>';
    window.appData.films.forEach(film => {
        const option = document.createElement('option');
        option.value = film.id;
        option.textContent = film.film_name;
        filmSelect.append(option);
    });
    if (currentValue && window.appData.films.some(f => f.id == currentValue)) {
        filmSelect.value = currentValue;
    }
}


document.getElementById('confirm-delete-seance').addEventListener('click', async () => {
    const deleteData = window.pendingDeleteSeance;
    if (!deleteData) return;

    const { seanceId, isPending, hallId, filmId, time } = deleteData;

    if (isPending === 'true') {
        pendingSeances.added = pendingSeances.added.filter(item =>
            !(item.hallId == hallId && item.filmId == filmId && item.time == time)
        );
    } else {
        if (!pendingSeances.deleted.includes(seanceId)) {
            pendingSeances.deleted.push(seanceId);
        }
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteSeanceModal'));
    modal.hide();
    window.pendingDeleteSeance = null;
    buildTimeline();
});
document.getElementById('deleteSeanceModal').addEventListener('hidden.bs.modal', () => {
    window.pendingDeleteSeance = null;
});
