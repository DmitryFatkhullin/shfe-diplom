function clearError(input) {
    input.classList.remove('error');
    const errorDiv = input.parentNode.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
}

function showError(input, message) {
    clearError(input);
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.append(errorDiv);
}

function validatePositiveInteger(input, fieldName, minValue = 1) {
    const value = parseInt(input.value);
    let isValid = true;
    let errorMessage = '';
    clearError(input);
    if (input.value.trim() === '') {
        isValid = false;
        errorMessage = `Введите значение`;
    } else if (isNaN(value)) {
        isValid = false;
        errorMessage = `Введите число`;
    } else if (!Number.isInteger(value)) {
        isValid = false;
        errorMessage = `Введите число`;
    } else if (value < minValue) {
        isValid = false;
        errorMessage = `Минимум ${minValue}`;
    }
    if (!isValid) {
        showError(input, errorMessage);
    }
    return isValid;
}

function validateNonNegative(input, fieldName) {
    const value = parseFloat(input.value);
    let isValid = true;
    let errorMessage = '';
    clearError(input);
    if (input.value.trim() === '') {
        isValid = false;
        errorMessage = `Введите число`;
    } else if (isNaN(value)) {
        isValid = false;
        errorMessage = `Введите число`;
    } else if (value < 1) {
        isValid = false;
        errorMessage = `Минимум 1`;
    }
    if (!isValid) {
        showError(input, errorMessage);
    }
    return isValid;
}

function validateNotEmpty(input, fieldName) {
    clearError(input);

    if (!input.value.trim()) {
        showError(input, `Введите значение`);
        return false;
    }
    return true;
}

function validateSeanceTime(hallId, startTime, filmId, existingSeances = null) {
    const films = window.appData.films;
    const seances = existingSeances || window.appData.seances;
    const film = films.find(f => f.id == filmId);
    if (!film) return { valid: false, message: 'Фильм не найден' };
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const start = startHours * 60 + startMinutes;
    const end = start + film.film_duration;
    const hallSeances = seances.filter(s => s.seance_hallid == hallId);
    for (let s of hallSeances) {
        const sFilm = films.find(f => f.id == s.seance_filmid);
        if (!sFilm) continue;
        const [sHours, sMinutes] = s.seance_time.split(':').map(Number);
        const sStart = sHours * 60 + sMinutes - 1;
        const sEnd = sStart + sFilm.film_duration + 1;
        if (start < sEnd && end > sStart) {
            const conflictFilm = films.find(f => f.id == s.seance_filmid);
            return {
                valid: false,
                message: `Время пересекается с сеансом "${conflictFilm?.film_name || 'неизвестный фильм'}" в ${s.seance_time}`
            };
        }
    }
    return { valid: true };
}