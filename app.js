const SIZE = 4;
const PUZZLE = 80;           // rozmiar pojedynczego puzzla
const MAP_SIZE = SIZE * PUZZLE; // 320px - zgodne z ramką paneli

let map, marker;
let correct = 0;

// ===== NOTYFIKACJE =====
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// ===== MAPA =====
map = L.map('map').setView([54.352, 18.646], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    crossOrigin: true
}).addTo(map);

// dopasowanie po wyrenderowaniu i przy zmianie rozmiaru okna
requestAnimationFrame(() => map.invalidateSize());
window.addEventListener('resize', () => map.invalidateSize());

// ===== GEOLOKALIZACJA =====
document.getElementById('locBtn').onclick = () => {
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            if (marker) map.removeLayer(marker);
            marker = L.marker([latitude, longitude]).addTo(map);
            map.setView([latitude, longitude], 15);
            alert(`Lat: ${latitude}\nLon: ${longitude}`);
        },
        () => alert("Brak zgody na lokalizację"),
        { enableHighAccuracy: true }
    );
};

// ===== POBIERANIE MAPY (CANVAS) =====
document.getElementById('exportBtn').onclick = () => {
    leafletImage(map, (err, canvas) => {
        const img = canvas.toDataURL();

        const image = document.createElement('img');
        image.src = img;
        // rozmiar obrazu dopasowujemy przez CSS (#raster img { width/height: 100% })
        // gwarantuje to idealne dopasowanie do ramki 320x320

        const raster = document.getElementById('raster');
        raster.innerHTML = '';
        raster.appendChild(image);

        createPuzzle(img);
    });
};

// ===== PUZZLE =====
function createPuzzle(img) {
    const storage = document.getElementById('storage');
    const board = document.getElementById('board');

    storage.innerHTML = '';
    board.innerHTML = '';
    correct = 0;

    let order = [...Array(16).keys()].sort(() => Math.random() - 0.5);

    order.forEach(i => {
        const p = document.createElement('div');
        p.className = 'piece';
        p.draggable = true;
        p.dataset.id = i;

        const x = (i % SIZE) * -PUZZLE;
        const y = Math.floor(i / SIZE) * -PUZZLE;

        p.style.backgroundImage = `url(${img})`;
        p.style.backgroundPosition = `${x}px ${y}px`;
        p.style.backgroundRepeat = 'no-repeat';

        p.ondragstart = e => e.dataTransfer.setData('id', i);
        storage.appendChild(p);
    });

    for (let i = 0; i < 16; i++) {
        const s = document.createElement('div');
        s.className = 'slot';
        s.dataset.id = i;

        s.ondragover = e => e.preventDefault();
        s.ondrop = e => {
            const id = e.dataTransfer.getData('id');
            const piece = document.querySelector(`[data-id="${id}"]`);

            if (id == s.dataset.id && !s.firstChild) {
                s.appendChild(piece);
                correct++;
                if (correct === 16) finish();
            }
        };
        board.appendChild(s);
    }
}

// ===== WYGRANA =====
function finish() {
    // notyfikacja systemowa
    new Notification("LAB C", {
        body: "Puzzle ułożone poprawnie!"
    });
    // dodatkowy alert tak jak przy współrzędnych
    alert("Puzzle ułożone poprawnie!");
}