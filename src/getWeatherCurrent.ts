export interface weatherDataCurrent {
      dt: number,
      sunrise: number,
      sunset: number,
      temp: number,
      feels_like: number,
      pressure: number,
      humidity: number,
      dew_point: number,
      uvi: number,
      clouds: number,
      visibility: number,
      wind_speed: number,
      wind_deg: number,
      wind_gust: number,
      weather:[
         {
            id: number,
            main: string,
            description: string,
            icon: string
         }
      ]
   }


export async function getWeatherCurrent(lat:number, lon:number): Promise<weatherDataCurrent> {
    let data
    let APIkey = "63473091e3dbe3b4db55f48ee898d316"
    try {
        data = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${APIkey}`).then(response => response.json())
        return data.current
    } catch (e) {
        throw e
    }
}