document.getElementById('login-form').addEventListener('submit', async (e) => {
	e.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const result = await api.login(email, password);
	if (result.success) {
		localStorage.setItem('adminAuth', 'true');
		window.location.href = 'dashboard.html';
	} else {
		alert('Ошибка авторизации');
	}
});