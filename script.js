document.addEventListener("DOMContentLoaded", () => {

    const apiKey = "abae8dd0e4ce6d748cae53fa7d5adac6";

    document.getElementById("weatherBtn").addEventListener("click", () => {
        const city = document.getElementById("cityInput").value.trim();

        if (!city) {
            alert("Podaj nazwę miejscowości!");
            return;
        }

        getCurrentWeather(city);
        getForecast(city);
    });

    // ============================
    // BIEŻĄCA POGODA – XMLHttpRequest
    // ============================
    function getCurrentWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pl`;

        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                document.getElementById("currentWeather").innerHTML = `
                    <h2>Pogoda bieżąca</h2>
                    <p><strong>${data.name}</strong></p>
                    <p>Temperatura: ${data.main.temp} °C</p>
                    <p>Opis: ${data.weather[0].description}</p>
                `;
            } else {
                document.getElementById("currentWeather").innerHTML =
                    "<p>Błąd pobierania pogody bieżącej</p>";
            }
        };

        xhr.onerror = function () {
            document.getElementById("currentWeather").innerHTML =
                "<p>Błąd połączenia z API</p>";
        };

        xhr.send();
    }

    // ============================
    // PROGNOZA 5 DNI – Fetch API
    // ============================
    function getForecast(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pl`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Błąd HTTP: " + response.status);
                }
                return response.json();
            })
            .then(data => {
                let html = "<h2>Prognoza 5-dniowa</h2>";
                html += '<div class="forecast-grid">';

                for (let i = 0; i < data.list.length; i += 8) {
                    const day = data.list[i];
                    const date = new Date(day.dt_txt).toLocaleDateString("pl-PL");

                    html += `
                        <div class="forecast-card">
                            <strong>${date}</strong><br>
                            ${day.main.temp} °C<br>
                            ${day.weather[0].description}
                        </div>
                    `;
                }

                html += "</div>";
                document.getElementById("forecast").innerHTML = html;
            })
            .catch(error => {
                document.getElementById("forecast").innerHTML =
                    "<p>Błąd pobierania prognozy</p>";
                console.error(error);
            });
    }

});
