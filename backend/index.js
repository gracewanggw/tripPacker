const apiKey = "fFrg4ngDhW8CjxuektLK152hc9gyIQjf";

//passing params from user selection
const params = new URLSearchParams(window.location.search);

//storing user selected parameters into variables
const year = 2019;
const destination = params.get("destination");
const startMonth = params.get("startMonth");
const endMonth = params.get("endMonth");
const startDay = params.get("startDay");
const endDay = params.get("endDay");
const startDate = `-${startMonth}-${startDay}`;
const endDate = `-${endMonth}-${endDay}`;


const stationID = []; //Array of stationIDs
let path; // path for the search query

//helper method to add id to the stationID array
function addStationID(item) {
  const { id } = item;
  stationID.push(id);
}

//returns the list of stationIDs for the destination selected by the user
async function getStationID(destination) {
  path = `stations/search?query=${destination}`;
  const response = await fetch(`https://api.meteostat.net/v2/${path}`, {
    headers: {
      "x-api-key": apiKey,
    },
    responseType: "json",
  });
  const str = await response.json();
  const obj = JSON.parse(JSON.stringify(str));
  obj.data.forEach(addStationID);
  return await stationID;
}

// Defining weather variables that will be used
const dates = [];
const temp = [];
const precip = [];
const snow = [];
const sun = [];
const allArrays = [dates, temp, precip, snow, sun];
let arrAvg = [];
let avgTemp;
let avgPrecip;
let avgSnow;
let avgSun;
let sum = 0;
let i = 0; // for iterators

// Helper method to add weather data into array
function addWeatherData(item) {
  const { date } = item;
  const avgt = item.tavg;
  const pre = item.prcp;
  const sno = item.snow;
  const sunshine = item.tsun;
  if (pre !== null) {
    precip.push(pre);
  }
  if (sno !== null) {
    snow.push(sno);
  }
  if (sunshine !== null) {
    sun.push(sunshine);
  }
  dates.push(date);
  temp.push(avgt);
}

// returns the average weather data for the destination, year, and date selected by user
async function getWeatherData(destination, year, startDate, endDate) {
  const ID = await getStationID(destination);
  const myID = ID[1]; // uses the first stationID in stationID array
  // iterates through years between the year inputted by user and 2015
  // adds the weather data for each year to its corresponding array
  for (year; year >= 2015; year--) {
    path = `station=${myID}&start=${year}${startDate}&end=${year}${endDate}`;
    const response = await fetch(
      `https://api.meteostat.net/v2/stations/daily?${path}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
        responseType: "json",
      }
    );
    const str2 = await response.json();
    const obj2 = JSON.parse(JSON.stringify(str2));
    obj2.data.forEach(addWeatherData); 
  }

  // Get Average Temp
  let j;
  for (j = 0; i < temp.length; i++) {
    sum = temp[j] + sum;
  }
  avgTemp = sum / temp.length;
  avgTemp = Math.round(avgTemp * 10) / 10;

  // Reset i and sum
  i = 0;
  sum = 0;

  // Get average Precipitation
  let k;
  for (k = 0; i < precip.length; i++) {
    sum = precip[k] + sum;
  }
  avgPrecip = sum / precip.length;
  avgPrecip = Math.round(avgPrecip * 10) / 10;

  // Reset i and sum
  i = 0;
  sum = 0;

  // Get average Snow
  let h;
  for (h = 0; i < snow.length; i++) {
    sum = snow[h] + sum;
  }
  avgSnow = sum / snow.length;
  avgSnow = Math.round(avgSnow * 10) / 10;

  // Reset i and sum
  i = 0;
  sum = 0;

  // Get average sun
  let m;
  for (m = 0; i < sun.length; i++) {
    sum = sun[m] + sum;
  }
  avgSun = sum / sun.length;
  avgSun = Math.round(avgSun * 10) / 10;

  // add averaged weatherData into an array
  arrAvg = [avgTemp, avgPrecip, avgSnow, avgSun];

  return await arrAvg;
}

// Getting an array with items to pack
const stuff = [];
let weatherData = [];
async function getPackingList(destination, year, startDate, endDate) {
  weatherData = await getWeatherData(destination, year, startDate, endDate);

  // What to pack based on temperature
  const temperature = weatherData[0];
  if (temperature <= 0) {
    stuff.push("down jacket");
    stuff.push("sweater");
    stuff.push("beanie");
    stuff.push("gloves");
    stuff.push("long pants");
    stuff.push("thermal leggings");
    stuff.push("thermal socks");
    stuff.push("boots");
    stuff.push("scarf");
  } else if (temperature <= 5) {
    stuff.push("fleece jacket");
    stuff.push("sweater");
    stuff.push("scarf");
    stuff.push("long pants");
    stuff.push("beanie");
    stuff.push("thermal socks");
  } else if (temperature <= 10) {
    stuff.push("sweater");
    stuff.push("long pants");
    stuff.push("warm jacket or vest");
    stuff.push("sneakers");
  } else if (temperature <= 15) {
    stuff.push("long sleeve shirt");
    stuff.push("long pants");
    stuff.push("light jacket");
    stuff.push("sneakers");
  } else if (temperature <= 25) {
    stuff.push("shirt");
    stuff.push("pants or capris");
    stuff.push("light jacket");
    stuff.push("sneakers");
  } else if (temperature > 25) {
    stuff.push("short sleeve shirt");
    stuff.push("shorts or pants");
    stuff.push("light jacket");
    stuff.push("sneakers or sandals");
  }

  // What to pack based on Precipitation
  const precipitation = weatherData[1];
  if (precipitation >= 10) {
    stuff.push("rain jacket");
    stuff.push("umbrella");
  } else if (precipitation >= 40) {
    stuff.push("rain jacket");
    stuff.push("umbrella");
    stuff.push("rain boots");
  }

  // What to pack based on Snow
  const amtSnow = weatherData[2];
  if (amtSnow >= 15) {
    stuff.push("weatherproof jacket");
    stuff.push("weatherproof shoes");
  } else if (amtSnow >= 40) {
    stuff.push("weatherproof jacket");
    stuff.push("snow boots");
  }

  // Waht to pack based on Sun
  const amtSun = weatherData[3];
  if (amtSun >= 0) {
    stuff.push("sunscreen");
    stuff.push("sunglasses");
    stuff.push("hat");
  }

  return stuff;
}
