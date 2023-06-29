

// Halvin aika alkaen tästä tunnista
let period_start = 22;

// Edullisin aika tältä aika väliltä
let period_length = 8;

// Jos tämän arvo on 0 etsintä aloitetaan tämän vuorokauden puolelta. Jos 1, huomisesta.
let period_day = 1;

// Etsii halvinta tämän mittaista jaksoa.
let needed_length = 3;

// Hinnat tulee esittää sähköpörssin käyttämässä €/mWh -muodossa, joka tarkoittaa sitä että esim. 
// hinta 0,50€/kWh merkitään muotoon 500. Vakiona ja jos tätä asetusta ei haluta käyttää, 
// hintaraja kannattaa asettaa todella korkealle.
let max_avg_price = 999999;

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

        c = 0;
        const all_hours = [];

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

            // Kaikki tunnit listassa
            
            all_hours[c] = hourly_prices[hr]["time"] + " " + hourly_prices[hr]["price"];
            c++;
        

            // Tulostetaan tunnit
            console.log(hour, hourly_prices[hr]["time"], hourly_prices[hr]["price"], hourly_prices[hr]["period_price"]);
            document.getElementById("tunnit").innerHTML = "Halvimmat tunnit ensi yönä:";
            //console.log(all_hours);
            document.getElementById("alv").innerHTML = "Alv 24%";

        }
       web_printing(all_hours);

        console.log("Cheapest hour", cheapest_period["time"], cheapest_period["period_price"], "average",
            cheapest_period["period_price"] / needed_length);
    }
}

function web_printing(all_hours) {
   
    // Clock
    const today = new Date();
    let h = today.getHours();

    // User Fetch Before Klo.15.00 
    if (h < 15) {
        document.getElementById("tunnit").innerHTML = "<strong>HUOM! </strong> Sähköpörssin tiedot päivittyy vasta noin klo. 15.00.";
        document.getElementById("tunnit").style.color = "red";
        document.getElementById("info").innerHTML = "Aikainen lintu madon nappaa... Tarkista listasta päivämäärä. Jos listassa on väärä päivämäärä, palaa klo.15.00 jälkeen.";
    }   

    // Clean Table
    document.getElementById("otsikko").innerHTML = "";
    document.getElementById("halvimmat").innerHTML = "";

    // Get Input Value ! Tässä joku Bugi !
    //period_start = document.getElementById("alku").value;
    //period_length = document.getElementById("pituus").value;
    needed_length = document.getElementById("tuntia").value;

    // Lista jossa vain halvimmat tunnit valitulta ajanjaksolta
    let slicer = all_hours.length - needed_length;
    const new_hours = all_hours.slice(slicer);
    const output = new Array(new_hours.length);

    let title_condition = 0;
   
    // Titles And Prices To Table
  
    for (let i = 0; i < new_hours.length; i++){
        
        // Titles
        if (title_condition === 0){
        let tr0 = document.createElement('tr');
        halvimmat.appendChild(tr0);

        let th1 = document.createElement('th');
        th1.textContent = "Päivä:";
        tr0.appendChild(th1);

        let th2 = document.createElement('th');
        th2.textContent = "Aika:";
        tr0.appendChild(th2);
        
        let th3 = document.createElement('th');
        th3.textContent = "Hinta:";
        tr0.appendChild(th3);
        
        title_condition = 1;
        }

        // Prices
        let tr1 = document.createElement('tr');
        halvimmat.appendChild(tr1);

        output[i] = new_hours[i].slice(0, -20);
        let td1 = document.createElement('td');
        td1.textContent = output[i];
        tr1.appendChild(td1);

        output[i] = new_hours[i].slice(10, -15);
        let td2 = document.createElement('td');
        td2.textContent = output[i];
        tr1.appendChild(td2);

        output[i] = new_hours[i].slice(25);
        let td3 = document.createElement('td');
        price = output[i];
        hundreds = parseFloat(price);
        snt = (hundreds / 10) * 1.24;
        //console.log(snt.toFixed(2));
        td3.textContent = snt.toFixed(2) + "c /kWh";
        tr1.appendChild(td3);
        
    }

}
async function fetchData() {

        let url = "https://elspotcontrol.netlify.app/spotprices-v01-FI.json";
        const response = await fetch(url);
        const result = await response.json();
        find_cheapest(result);  
    
}