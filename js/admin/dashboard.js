document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('adminAuth')) {
        window.location.href = 'login.html';
        return;
    }
    loadAllData();
});

async function loadAllData() {
    const data = await api.getAllData();
    if (!data.success) return;
    window.appData = data.result;
    window.appData.films.forEach(film => {
        if (!film.color) {
            film.color = getRandomFilmColor();
        }
    });

    if (typeof renderFilmsPool === 'function') renderFilmsPool();
    if (typeof buildTimeline === 'function') buildTimeline();
    if (typeof initHallsModule === 'function') initHallsModule();
    if (typeof initFilmsModule === 'function') initFilmsModule();
    if (typeof initSeancesModule === 'function') initSeancesModule();
    initAccordion();
}

function initAccordion() {
    document.querySelectorAll('.admin-dashboard-section__title').forEach(title => {
        title.addEventListener('click', () => {
            const section = title.closest('.admin-section');
            const content = section.querySelector('.accordion-content');

            if (content) {
                content.classList.toggle('collapsed');
                title.classList.toggle('collapsed');
                section.classList.toggle('collapsed');
            }
        });
    });
}