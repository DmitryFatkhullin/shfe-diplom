let filmColors = {};

function initFilmsModule() {
    renderFilmsPool();
    attachFilmEvents();
}

function renderFilmsPool() {
    const pool = document.getElementById('films-pool');
    pool.innerHTML = '';
    window.appData.films.forEach(film => {
        const filmEl = document.createElement('div');
        filmEl.className = 'film-pool-item';
        filmEl.draggable = true;
        filmEl.dataset.filmId = film.id;
        filmEl.dataset.filmDuration = film.film_duration;
        filmEl.style.backgroundColor = film.color;
        filmEl.style.color = '#fff';
        const poster = document.createElement('img');
        poster.className = 'film-pool-poster';
        poster.src = film.film_poster || 'assets/placeholder.png';
        poster.alt = film.film_name;
        const info = document.createElement('div');
        info.className = 'film-pool-info';
        const title = document.createElement('div');
        title.className = 'film-pool-title';
        title.textContent = film.film_name;
        const duration = document.createElement('div');
        duration.className = 'film-pool-duration';
        duration.textContent = `${film.film_duration} минут`;
        info.appendChild(title);
        info.appendChild(duration);
        filmEl.appendChild(poster);
        filmEl.appendChild(info);
        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'film-pool-delete';
        deleteIcon.dataset.filmId = film.id;
        deleteIcon.setAttribute('aria-label', 'Удалить фильм');
        deleteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            deleteFilm(film.id);
        });
        filmEl.appendChild(deleteIcon);
        filmEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('filmId', film.id);
        });
        pool.appendChild(filmEl);
    });
}


async function deleteFilm(filmId) {
    const currentColors = {};
    window.appData.films.forEach(film => {
        if (film.color) {
            currentColors[film.id] = film.color;
        }
    });
    const result = await api.deleteFilm(filmId);
    if (result.success) {
        window.appData.films = result.result.films;
        window.appData.seances = result.result.seances;
        window.appData.films.forEach(film => {
            if (currentColors[film.id]) {
                film.color = currentColors[film.id];
            } else {
                film.color = getRandomFilmColor();
            }
        });
        renderFilmsPool();
        buildTimeline();
    } else {
        alert('Ошибка при удалении фильма');
    }
}

function attachFilmEvents() {
    const uploadBtn = document.getElementById('upload-poster-btn');
    const fileInput = document.getElementById('poster-upload');
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    document.getElementById('add-film-submit').addEventListener('click', async () => {
        const form = document.getElementById('add-film-form');
        const formData = new FormData(form);
        if (fileInput.files.length > 0) {
            formData.append('filePoster', fileInput.files[0]);
        }
        const result = await api.addFilm(formData);
        if (result.success) {
            result.result.films.forEach(film => {
                if (!filmColors[film.id]) {
                    filmColors[film.id] = getRandomFilmColor();
                }
                film.color = filmColors[film.id];
            });
            window.appData.films = result.result.films;
            renderFilmsPool();
            buildTimeline();
            const modalEl = document.getElementById('addFilmModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
            }
            form.reset();
            fileInput.value = '';
        } else {
            alert('Ошибка при добавлении фильма: ' + (result.error || 'Неизвестная ошибка'));
        }
    });
}