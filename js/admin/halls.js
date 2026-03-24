let currentHallId = null;
let currentHallConfig = null;

function updatePriceFields(hall) {
    const priceStandart = document.getElementById('price-standart');
    const priceVip = document.getElementById('price-vip');

    if (priceStandart) priceStandart.value = hall.hall_price_standart;
    if (priceVip) priceVip.value = hall.hall_price_vip;
}

function initHallsModule() {
    renderHallsList();
    fillHallSelects();
    attachHallEvents();
    attachHallInputListeners();

    setTimeout(() => {
        const configContainer = document.getElementById('config-hall-select');
        const firstHallElement = configContainer?.querySelector('.hall-item-select');
        if (firstHallElement) {
            firstHallElement.click();
        }
    }, 100);
    setTimeout(() => {
        const priceContainer = document.getElementById('price-hall-select');
        const firstPriceElement = priceContainer?.querySelector('.hall-item-select');
        if (firstPriceElement) {
            firstPriceElement.click();
        }
    }, 100);
}

function renderHallsList() {
    const container = document.getElementById('halls-list');
    container.innerHTML = '';
    window.appData.halls.forEach(hall => {
        const item = document.createElement('div');
        item.className = 'hall-item';
        item.innerHTML = `
            <span>${hall.hall_name}</span>
            <span class="hall-item__delete" data-id="${hall.id}">✕</span>
        `;
        container.append(item);
    });
}

function fillHallSelects() {
    function extractAllHalls(data) {
        const flatList = [];
        function extract(item) {
            if (!item || typeof item !== 'object') return;
            if (item.id && item.hall_name) {
                flatList.push(item);
            }
            if (item.halls && Array.isArray(item.halls)) {
                item.halls.forEach(h => extract(h));
            }
            if (Array.isArray(item)) {
                item.forEach(i => extract(i));
            }
        }
        extract(data);
        return flatList;
    }

    window.appData.halls = extractAllHalls(window.appData.halls);
    const containerIds = ['config-hall-select', 'price-hall-select', 'open-hall-select'];
    containerIds.forEach(id => {
        const container = document.getElementById(id);
        if (!container) {
            return;
        }
        container.innerHTML = '';
        window.appData.halls.forEach((hall, index) => {
            const hallElement = document.createElement('div');
            hallElement.className = 'hall-item-select';
            hallElement.dataset.id = String(hall.id);
            if (id === 'open-hall-select') {
                const statusSpan = document.createElement('span');
                statusSpan.className = `status-indicator ${hall.hall_open === 1 ? 'status-open' : 'status-closed'}`;
                hallElement.append(statusSpan);
                hallElement.append(document.createTextNode(' ' + hall.hall_name));
            } else {
                hallElement.textContent = hall.hall_name;
            }
            hallElement.addEventListener('click', () => {
                hallElement.dataset.id = String(hall.id);
                document.querySelectorAll(`#${id} .hall-item-select`).forEach(el => {
                    el.classList.remove('active');
                });
                hallElement.classList.add('active');
                if (id === 'config-hall-select') {
                    const rowsInput = document.getElementById('config-rows');
                    const placesInput = document.getElementById('config-places');
                    if (rowsInput && placesInput) {
                        rowsInput.value = hall.hall_rows;
                        placesInput.value = hall.hall_places;
                    }
                    if (typeof loadHallConfigForEdit === 'function') {
                        loadHallConfigForEdit(hall.id);
                    }
                } else if (id === 'price-hall-select') {
                    document.getElementById('price-standart').value = hall.hall_price_standart;
                    document.getElementById('price-vip').value = hall.hall_price_vip;
                } else if (id === 'open-hall-select') {
                    const openSalesBtn = document.getElementById('open-sales');
                    openSalesBtn.textContent = hall.hall_open === 1 ? 'ПРИОСТАНОВИТЬ ПРОДАЖУ БИЛЕТОВ' : 'ОТКРЫТЬ ПРОДАЖУ БИЛЕТОВ';
                    updateSalesStatusText(hall);
                    if (hall.hall_open === 1) {
                        openSalesBtn.classList.remove('btn--primary-open-ticket-sales');
                        openSalesBtn.classList.add('btn--primary-close-ticket-sales');
                    } else {
                        openSalesBtn.classList.remove('btn--primary-close-ticket-sales');
                        openSalesBtn.classList.add('btn--primary-open-ticket-sales');
                    }
                }
            });
            container.append(hallElement);
        });
        if (window.appData.halls.length > 0) {
            const firstElement = container.querySelector('.hall-item-select');
            if (firstElement) {
                firstElement.classList.add('active');

            }
        }
    });
}

function attachHallInputListeners() {
    const rowsInput = document.getElementById('config-rows');
    const placesInput = document.getElementById('config-places');
    if (rowsInput) {
        rowsInput.addEventListener('input', () => {
            if (!currentHallId || !currentHallConfig) return;
            updateHallConfigSize();
        });
    }
    if (placesInput) {
        placesInput.addEventListener('input', () => {
            if (!currentHallId || !currentHallConfig) return;
            updateHallConfigSize();
        });
    }
}

function updateHallConfigSize() {
    const newRows = parseInt(document.getElementById('config-rows').value);
    const newPlaces = parseInt(document.getElementById('config-places').value);
    if (isNaN(newRows) || isNaN(newPlaces) || newRows < 0 || newPlaces < 0) return;
    if (!currentHallConfig) return;
    const oldRows = currentHallConfig.length;
    const oldPlaces = oldRows > 0 ? currentHallConfig[0].length : 0;
    let newConfig = [];
    for (let r = 0; r < newRows; r++) {
        if (r < oldRows) {
            let newRow = [];
            for (let p = 0; p < newPlaces; p++) {
                if (p < oldPlaces) {
                    newRow.push(currentHallConfig[r][p]);
                } else {
                    newRow.push('standart');
                }
            }
            newConfig.push(newRow);
        } else {
            newConfig.push(Array(newPlaces).fill('standart'));
        }
    }
    currentHallConfig = newConfig;
    renderHallEditor(currentHallConfig);
}

function attachHallEvents() {
    document.querySelectorAll('.hall-item__delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const result = await api.deleteHall(id);
            if (result.success) {
                window.appData.halls = result.result.halls;
                window.appData.seances = result.result.seances;
                initHallsModule();
            }
        });
    });
    document.getElementById('add-hall-submit').addEventListener('click', async () => {
        const name = document.getElementById('new-hall-name').value.trim();
        if (!name) return;
        const result = await api.addHall(name);
        if (result.success) {
            window.appData.halls = result.result.halls;
            initHallsModule();
            bootstrap.Modal.getInstance(document.getElementById('addHallModal')).hide();
        }
    });
    document.getElementById('config-cancel').addEventListener('click', () => {
        if (currentHallId) {
            loadHallConfigForEdit(currentHallId);
        }
    });
    document.getElementById('config-save').addEventListener('click', async () => {
        if (!currentHallId) return;
        const rowsInput = document.getElementById('config-rows');
        const placesInput = document.getElementById('config-places');
        const rowsValid = validatePositiveInteger(rowsInput, 'Количество рядов', 1);
        const placesValid = validatePositiveInteger(placesInput, 'Количество мест', 1);
        if (!rowsValid || !placesValid) return;
        const rows = parseInt(rowsInput.value);
        const places = parseInt(placesInput.value);
        const config = getCurrentHallConfig();
        const result = await api.updateHallConfig(currentHallId, rows, places, config);
        if (result.success) {
            const idx = window.appData.halls.findIndex(h => h.id == currentHallId);
            if (idx !== -1) window.appData.halls[idx] = result.result;
            currentHallConfig = result.result.hall_config;
            clearError(rowsInput);
            clearError(placesInput);
        }
    });
    document.getElementById('price-save').addEventListener('click', async () => {
        const container = document.getElementById('price-hall-select');
        const activeHall = container.querySelector('.hall-item-select.active');
        if (!activeHall) return;
        const priceStdInput = document.getElementById('price-standart');
        const priceVipInput = document.getElementById('price-vip');
        const stdValid = validateNonNegative(priceStdInput, 'Цена обычных мест');
        const vipValid = validateNonNegative(priceVipInput, 'Цена VIP мест');
        if (!stdValid || !vipValid) return;
        const hallId = activeHall.dataset.id;
        const priceStd = parseInt(priceStdInput.value);
        const priceVip = parseInt(priceVipInput.value);
        const result = await api.updateHallPrice(hallId, priceStd, priceVip);
        if (result.success) {
            const idx = window.appData.halls.findIndex(h => h.id == hallId);
            if (idx !== -1) window.appData.halls[idx] = result.result;
            clearError(priceStdInput);
            clearError(priceVipInput);
        }
    });
    document.getElementById('price-cancel').addEventListener('click', () => {
        const container = document.getElementById('price-hall-select');
        const activeHall = container.querySelector('.hall-item-select.active');
        if (!activeHall) {
            return;
        }
        const hallId = activeHall.dataset.id;
        const hall = window.appData.halls.find(h => h.id == hallId);
        if (hall) {
            document.getElementById('price-standart').value = hall.hall_price_standart;
            document.getElementById('price-vip').value = hall.hall_price_vip;
        }
    });
    document.getElementById('open-sales').addEventListener('click', async () => {
        const container = document.getElementById('open-hall-select');
        const activeHall = container.querySelector('.hall-item-select.active');
        if (!activeHall) {
            return;
        }
        let hallId = activeHall.dataset.id;
        if (!hallId || hallId === 'undefined') {
            const hallName = activeHall.textContent.trim();
            const foundHall = window.appData.halls.find(h => h.hall_name === hallName);
            if (foundHall) {
                hallId = foundHall.id;
                activeHall.dataset.id = hallId;
            }
        }
        if (!hallId || hallId === 'undefined') {
            return;
        }
        const hallIdNum = parseInt(hallId);
        function findHallRecursive(data, id) {
            if (Array.isArray(data)) {
                for (let item of data) {
                    if (item && typeof item === 'object') {
                        if (item.id === id && item.hall_name) {
                            return item;
                        }
                        if (item.halls && Array.isArray(item.halls)) {
                            const found = findHallRecursive(item.halls, id);
                            if (found) return found;
                        }
                        if (Array.isArray(item)) {
                            const found = findHallRecursive(item, id);
                            if (found) return found;
                        }
                    }
                }
            }
            return null;
        }
        const hall = findHallRecursive(window.appData.halls, hallIdNum);
        if (!hall) {
            return;
        }
        const newStatus = hall.hall_open === 1 ? 0 : 1;
        const result = await api.setHallOpen(hallIdNum, newStatus);
        if (result.success) {
            function extractAllHalls(data) {
                const flatList = [];
                function extract(item) {
                    if (!item || typeof item !== 'object') return;
                    if (item.id && item.hall_name) {
                        flatList.push(item);
                    }
                    if (item.halls && Array.isArray(item.halls)) {
                        item.halls.forEach(h => extract(h));
                    }
                    if (Array.isArray(item)) {
                        item.forEach(i => extract(i));
                    }
                }
                extract(data);
                return flatList;
            }
            const allHalls = extractAllHalls(window.appData.halls);
            const updatedHalls = allHalls.map(h =>
                h.id === hallIdNum ? result.result : h
            );
            window.appData.halls = updatedHalls;
            const statusText = document.getElementById('sales-status-text');
            if (statusText) {
                statusText.textContent = newStatus ? 'Зал открыт для продаж' : 'Всё готово к открытию';
            }
            const openSalesBtn = document.getElementById('open-sales');
            openSalesBtn.textContent = newStatus ? 'ПРИОСТАНОВИТЬ ПРОДАЖУ БИЛЕТОВ' : 'ОТКРЫТЬ ПРОДАЖУ БИЛЕТОВ';
            if (newStatus) {
                openSalesBtn.classList.remove('btn--primary-open-ticket-sales');
                openSalesBtn.classList.add('btn--primary-close-ticket-sales');
            } else {
                openSalesBtn.classList.remove('btn--primary-close-ticket-sales');
                openSalesBtn.classList.add('btn--primary-open-ticket-sales');
            }
        }
    });
}

async function loadHallConfigForEdit(hallId) {
    const hall = window.appData.halls.find(h => h.id == hallId);
    if (!hall) return;
    currentHallId = hallId;
    currentHallConfig = hall.hall_config.map(row => [...row]);
    document.getElementById('config-rows').value = hall.hall_rows;
    document.getElementById('config-places').value = hall.hall_places;
    renderHallEditor(currentHallConfig);
}

function renderHallEditor(config) {
    const container = document.getElementById('hall-editor');
    container.innerHTML = '';
    config.forEach((row, rIdx) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'hall-editor__row';
        row.forEach((type, pIdx) => {
            const cell = document.createElement('div');
            cell.className = `hall-editor__cell ${type}`;
            cell.dataset.row = rIdx;
            cell.dataset.place = pIdx;
            cell.dataset.type = type;
            cell.addEventListener('click', () => {
                const types = ['standart', 'vip', 'disabled'];
                let newType = types[(types.indexOf(cell.dataset.type) + 1) % types.length];
                cell.className = `hall-editor__cell ${newType}`;
                cell.dataset.type = newType;
                const rowIdx = parseInt(cell.dataset.row);
                const placeIdx = parseInt(cell.dataset.place);
                if (currentHallConfig && currentHallConfig[rowIdx] && currentHallConfig[rowIdx][placeIdx]) {
                    currentHallConfig[rowIdx][placeIdx] = newType;
                }
            });
            rowDiv.append(cell);
        });
        container.append(rowDiv);
    });
}

function getCurrentHallConfig() {
    return currentHallConfig;
}

function updateSalesStatusText(hall) {
    const statusText = document.getElementById('sales-status-text');
    if (!statusText) return;
    statusText.textContent = hall.hall_open === 1 ? 'Зал открыт для продаж' : 'Всё готово к открытию';
}