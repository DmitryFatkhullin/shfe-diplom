class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, method = 'GET', body = null) {
        const options = { method };
        if (body) {
            options.body = body;
        }
        const response = await fetch(this.baseUrl + endpoint, options);
        return response.json();
    }

    getAllData() {
        return this.request('/alldata');
    }

    login(login, password) {
        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        return this.request('/login', 'POST', formData);
    }

    addHall(hallName) {
        const formData = new FormData();
        formData.append('hallName', hallName);
        return this.request('/hall', 'POST', formData);
    }

    deleteHall(hallId) {
        return this.request(`/hall/${hallId}`, 'DELETE');
    }

    updateHallConfig(hallId, rowCount, placeCount, config) {
        const formData = new FormData();
        formData.append('rowCount', rowCount);
        formData.append('placeCount', placeCount);
        formData.append('config', JSON.stringify(config));
        return this.request(`/hall/${hallId}`, 'POST', formData);
    }

    updateHallPrice(hallId, priceStandart, priceVip) {
        const formData = new FormData();
        formData.append('priceStandart', priceStandart);
        formData.append('priceVip', priceVip);
        return this.request(`/price/${hallId}`, 'POST', formData);
    }

    setHallOpen(hallId, hallOpen) {
        const formData = new FormData();
        formData.append('hallOpen', hallOpen);
        return this.request(`/open/${hallId}`, 'POST', formData);
    }

    addFilm(filmData) {
        return this.request('/film', 'POST', filmData);
    }

    deleteFilm(filmId) {
        return this.request(`/film/${filmId}`, 'DELETE');
    }

    addSeance(seanceHallid, seanceFilmid, seanceTime) {
        const formData = new FormData();
        formData.append('seanceHallid', seanceHallid);
        formData.append('seanceFilmid', seanceFilmid);
        formData.append('seanceTime', seanceTime);
        return this.request('/seance', 'POST', formData);
    }

    deleteSeance(seanceId) {
        return this.request(`/seance/${seanceId}`, 'DELETE');
    }

    getHallConfig(seanceId, date) {
        return this.request(`/hallconfig?seanceId=${seanceId}&date=${date}`);
    }

    purchaseTickets(seanceId, ticketDate, tickets) {
        const formData = new FormData();
        formData.append('seanceId', seanceId);
        formData.append('ticketDate', ticketDate);
        formData.append('tickets', JSON.stringify(tickets));
        return this.request('/ticket', 'POST', formData);
    }
}

const api = new ApiService('https://shfe-diplom.neto-server.ru');