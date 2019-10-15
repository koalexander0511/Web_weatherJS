"strict mode";

let urlFore = `http://api.openweathermap.org/data/2.5/forecast/hourly?q=Davis,CA,US&units=imperial&APPID=440131ac5dd6d5fd017c5d9895afa9f1`;
let urlCurr = `http://api.openweathermap.org/data/2.5/weather?q=Davis,CA,US&units=imperial&APPID=440131ac5dd6d5fd017c5d9895afa9f1`;

let xhrCurr;
let xhrFore;

let images = []
let count = 0;
let radarCount = 0;
getTenImages();
animate();

makeCorsRequest();

function animate()
{
    setInterval(function() {
        radarCount+=1;
        if (radarCount == 10)
            radarCount = 0;
        document.getElementById("dax").src = images[radarCount].src;
        console.log(document.getElementById("doppler-dax").src);
    }, 180);
}

const day = new Set(["5 AM", "6 AM","7 AM","8 AM","9 AM","10 AM", "11 AM"
                          ,"12 PM","1 PM","2 PM","3 PM","4 PM","5 PM", "6 PM"]);

const night = new Set(["7 PM","8 PM","9 PM","10 PM","11 PM","12 AM"
                            ,"1 AM","2 AM","3 AM","4 AM"]);

var chooseImg = {"broken clouds": "../assets/brokencloud.svg",
    "overcast clouds":"../assets/brokencloud.svg",
    "broken clouds: 51-84%": "../assets/brokencloud.svg",
    "overcast clouds: 85-100%":"../assets/brokencloud.svg",
    "clear sky night": "../assets/clear-night.svg",
    "clear sky day": "../assets/clearsky.svg",
    "few clouds day": "../assets/fewclouds-day.svg",
    "few clouds: 11-25%" : "../assets/fewclouds-day.svg",
    "few clouds night": "../assets/fewclouds-night.svg",
    "mist": "../assets/mist.svg",
    "rain day": "../assets/rain-day.svg",
    "rain night": "../assets/rain-night.svg",
    "light rain day": "../assets/rain-day.svg",
    "light rain night": "../assets/rain-night.svg",
    "scattered clouds": "../assets/scatteredclouds.svg",
    "scattered clouds: 25-50%" :  "../assets/scatteredclouds.svg",
    "snow": "../assets/snow.svg",
    "thunderstorm": "../assets/thunderstorms.svg"};

// Create the XHR object.
function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);  // call its open method
    return xhr;
}

// Make the actual CORS request.
function setForecast()  {
        let responseStrFore = xhrFore.responseText;  // get the JSON string
        let responseStrCurr = xhrCurr.responseText;
        
        let obj = JSON.parse(responseStrFore);  // turn it into an object
        console.log(obj);

        let objCurr = JSON.parse(responseStrCurr);  // turn it into an object
        console.log(objCurr);


        let defLat = 38.5382;
        let defLong = -121.7617;
        if(obj["cod"] != "404")
        {
            let lat = obj["city"]["coord"]["lat"];
            let lon = obj["city"]["coord"]["lon"];
            if (distance(defLat, defLong, lat, lon, 'M'))
            {
                for (var i = 0; i < 6; i++)
                {
                    console.log(i);
                    let time = document.getElementById(`time${i}`);
                    console.log(time);

                    if(i == 0)
                        var utcSec = objCurr["dt"];
                    else
                        var utcSec = obj["list"][i-1]["dt"];

                    var date = new Date(0);
                    date.setUTCSeconds(utcSec);

                    if(i == 0)
                        time.textContent = date.toLocaleString('en-US', {hour: 'numeric', hour12: true});
                    else
                        time.textContent = date.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});

                    let img = document.getElementById(`img${i}`);

                    if(i == 0)
                        var imgCode = objCurr["weather"][0]["description"];
                    else
                        var imgCode = obj["list"][i-1]["weather"][0]["description"];

                    let check = date.toLocaleString('en-US', {hour:'numeric', hour12:true});

                    if (imgCode == "few clouds" || imgCode == "clear sky" || imgCode == "rain")
                    {
                        if (day.has(check))
                            imgCode += " day";
                        else if (night.has(check))
                            imgCode += " night";
                    }

                    console.log(img,chooseImg[imgCode]);
                    img.src = chooseImg[imgCode];
                    let temp = document.getElementById(`temp${i}`);
                    if(i == 0)
                        temp.textContent = Math.round(objCurr["main"]["temp"])+"°";
                    else
                        temp.textContent = Math.round(obj["list"][i-1]["main"]["temp"])+"°";
                }
            }
            else
            {
                document.getElementById("location").value = "Invalid location";
                console.log("Invalid location");
            }
        }
        else
        {
            document.getElementById("location").value = "Invalid Location";
        }
}

// Make the actual CORS request.
function makeCorsRequest() {
    console.log(urlFore);

    xhrCurr = createCORSRequest('GET', urlCurr);
    xhrFore = createCORSRequest('GET', urlFore);
    
    // checking if browser does CORS
    if (!xhrCurr || !xhrFore) {
        alert('CORS not supported');
        return;
    }
    
    // Load some functions into response handlers.
    xhrFore.onload = setForecast;
    
    xhrFore.onerror = function() {
        alert('Woops, there was an error making the request.');
    };
    
    // Actually send request to server
    xhrFore.send();
    xhrCurr.send();
}

// Source: https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        if (dist > 150)
            return false;
        return true;
    }
}
                
function submit()
{
    var inputStr = document.getElementById("location").value;
    var loc = new RegExp (/[0-9]{5}(?:-[0-9]{4})?|([\w\s]+,\s*\w{2},\s*\w{2})/ig);
    var state = new RegExp(/([\w\s]+,\s*\w{2})/);
    var city = new RegExp(/\b^(\w*[\w\s]\w*)\b/ig);
    var comp = inputStr.match(city);
    var location = null;
    if (comp != null)
    {
        comp = inputStr.match(city);
        location = comp[0] + ',US';
    }
    else
    {
        comp = inputStr.match(loc);
        if (comp != null)
        {
            location = comp[0];
        }
        else
        {
            comp = inputStr.match(state);
            if (comp != null)
            {
                location = comp[0] + ',';
            }
        }
    }
    if (location != null)
    {
        console.log(location);
        urlFore = `http://api.openweathermap.org/data/2.5/forecast/hourly?q=${location}&units=imperial&APPID=440131ac5dd6d5fd017c5d9895afa9f1`;
        urlCurr = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&APPID=440131ac5dd6d5fd017c5d9895afa9f1`;
        makeCorsRequest();
    }
    else
    {
        document.getElementById("location").value = "Invalid location";
        console.log("Invalid location");
    }
}

function upClick()
{
    var top = document.getElementById("upperPart");
    var bottom = document.getElementById("lowerPart");
    if(top.classList.contains("upperAnimateRev"))
    {
        top.classList.remove("upperAnimateRev");
        bottom.classList.remove("bottomAnimateRev");
    }
    top.classList.add("upperAnimate");
    bottom.classList.add("bottomAnimate");
    top.classList.remove("upper");
    bottom.classList.remove("bottomPart");
}

function downClick()
{
    var top = document.getElementById("upperPart");
    var bottom = document.getElementById("lowerPart");
    top.classList.add("upperAnimateRev");
    bottom.classList.add("bottomAnimateRev");
    top.classList.remove("upperAnimate");
    bottom.classList.remove("bottomAnimate");
}

var eventbottom = document.getElementById("lowerPart");
var desk = window.matchMedia("(min-width: 481px)");
eventbottom.addEventListener("animationend", endAnim, false);
desk.addListener(listen);

function endAnim()
{
    if (this.classList.contains("bottomAnimateRev"))
    {
        this.classList.remove("bottomAnimateRev");
        this.classList.add("bottomPart");
    }
}

function listen()
{
    if (this.matches)
    {
        var top = document.getElementById("upperPart");
        var bottom = document.getElementById("lowerPart");
        if (top.classList.contains("upperAnimateRev"))
        {
            top.classList.remove("upperAnimateRev");
            top.classList.add("upper");
            bottom.classList.remove("bottomAnimateRev");
            bottom.classList.add("bottomPart");
        }
        else if (top.classList.contains("upperAnimate"))
        {
            top.classList.remove("upperAnimate");
            top.classList.add("upper");
            bottom.classList.remove("bottomAnimate");
            bottom.classList.add("bottomPart");
        }
    }
}

/* Professor's code given to us */
function addToArray(newImage) {
    if (count < 10) {
        newImage.id = "doppler_"+count;
        newImage.style.display = "none";
        images.push(newImage);
        count = count+1;
        if (count >= 10) {
            console.log("Got 10 doppler images");
        }
    }
}

function tryToGetImage(dateObj) {
    let dateStr = dateObj.getUTCFullYear();
    dateStr += String(dateObj.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
    dateStr += String(dateObj.getUTCDate()).padStart(2, '0');
    
    let timeStr = String(dateObj.getUTCHours()).padStart(2,'0')
    timeStr += String(dateObj.getUTCMinutes()).padStart(2,'0');
    
    let filename = "DAX_"+dateStr+"_"+timeStr+"_N0R.gif";
    let newImage = new Image();
    newImage.onload = function () {
        // console.log("got image "+filename);
        addToArray(newImage);
    }
    newImage.onerror = function() {
        // console.log("failed to load "+filename);
    }
    newImage.src = "http://radar.weather.gov/ridge/RadarImg/N0R/DAX/"+filename;
}


function getTenImages() {
    let dateObj = new Date();  // defaults to current date and time
    // if we try 150 images, and get one out of every 10, we should get enough
    for (let i = 0; i < 150; i++) {
        newImage = tryToGetImage(dateObj);
        
        dateObj.setMinutes( dateObj.getMinutes()-1 ); // back in time one minute
    }
    
}
