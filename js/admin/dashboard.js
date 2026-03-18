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
}