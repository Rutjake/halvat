

// Halvin aika alkaen tästä tunnista
let period_start = 22;
// Edullisin aika tältä aika väliltä
let period_length = 8;

// Jos tämän arvo on 0 etsintä aloitetaan tämän vuorokauden puolelta. Jos 1, huomisesta.
let period_day = 0;

// Etsii halvinta tämän mittaista jaksoa.
let needed_length = 3;

// Jos verkkoyhteys ei toimi tai hintatietojen haku muuten epäonnistuu, käytetään näitä aikatauluja vakioaikatauluina. 
// Käytetty formaatti ilmenee tästä https://github.com/mongoose-os-libs/cron.
let defaultstart = "0 1 2 * * SUN,MON,TUE,WED,THU,FRI,SAT";
let defaultend = "0 1 7 * * SUN,MON,TUE,WED,THU,FRI,SAT";

// Hinnat tulee esittää sähköpörssin käyttämässä €/mWh -muodossa, joka tarkoittaa sitä että esim. 
// hinta 0,50€/kWh merkitään muotoon 500. Vakiona ja jos tätä asetusta ei haluta käyttää, 
// hintaraja kannattaa asettaa todella korkealle.
let max_avg_price = 999999;

//  Skriptin käynnistysaikataulu. Oletuksena joka päivä kuudelta. 
// Jos muutat tätä, huomioi että uudet pörssihinnat päivittyvät joka päivä n. klo 15. 
// Esimerkiksi seuraavan yön ohjaukset on mahdollista tehdä vasta tämän jälkeen. 
// Käytetty formaatti ilmenee tästä https://github.com/mongoose-os-libs/cron.
let minrand = JSON.stringify(Math.floor(Math.random() * 15));
let secrand = JSON.stringify(Math.floor(Math.random() * 60));
let script_schedule = secrand + " " + minrand + " " + "18 * * SUN,MON,TUE,WED,THU,FRI,SAT";
console.log(script_schedule);


// You can check the schedules here (use your own ip) http://192.168.68.128/rpc/Schedule.List

function maybe_over_midnight(hour) {
    if (hour > 24) {
        return hour - 24;
    } else {
        return hour;
    }
}


function find_cheapest(result) {
    console.log("HTTP response is", result);
    if (result === null) {
        console.log("No Ei")
    } else {
        console.log("Finding cheapest hours");
        
        // let prices = JSON.parse(result.body);
        let prices = result;
        let hourly_prices = prices["hourly_prices"];
        let num = 0;

        let cheapest_period = {};
        cheapest_period["period_price"] = 999999999999;

        for (let i = period_start; i < period_start + period_length; i++) {

            let hour = i;

            if (i >= 24) {
                hour = hour - 24;
                period_day = 1;
            }

            let hr = JSON.stringify(period_day) + "." + JSON.stringify(hour);

            hourly_prices[hr]["period_price"] = 0;

            // Haetaan tältä pituudelta

            for (let a = 0; a < needed_length; a++) {
                let ah = hour + a;
                let ahday = period_day;
                if (ah >= 24) {
                    ah = ah - 24;
                    ahday = 1;
                }
                let ahh = JSON.stringify(ahday) + "." + JSON.stringify(ah);
                hourly_prices[hr]["period_price"] = hourly_prices[hr]["period_price"] + hourly_prices[ahh]["price"];
            }

            if (hourly_prices[hr]["period_price"] < cheapest_period["period_price"]) {
                cheapest_period = hourly_prices[hr];
                cheapest_period["hour"] = hour;
                console.log("cheapest");
            }
            
            // Tulostetaan halvimmat tunnit

            console.log(hour, hourly_prices[hr]["time"], hourly_prices[hr]["price"], hourly_prices[hr]["period_price"]);
            document.getElementById("tunnit").innerHTML = "Halvimmat tunnit: " + hourly_prices[hr]["time"];

        }
        console.log("Cheapest hour", cheapest_period["time"], cheapest_period["period_price"], "average",
            cheapest_period["period_price"] / needed_length)


    }
}

function updateTimer() {
    console.log("Starting, fetching hourly prices");

    Shelly.call("HTTP.GET", {
        url: "https://elspotcontrol.netlify.app/spotprices-v01-FI.json"
    }, find_cheapest);
}


function updatePage() {
    HTMLOutputElement.GET, {
        url: "https://elspotcontrol.netlify.app/spotprices-v01-FI.json"
    }, find_cheapest;
}

async function fetchData() {
    let url = "https://elspotcontrol.netlify.app/spotprices-v01-FI.json";
    const response = await fetch(url);
    const result = await response.json();
    find_cheapest(result);
    
}