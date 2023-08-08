export interface CityCoordinates {
    lat: number
    lon: number
    local_names: Record<string, string>;
}

export class CityNotFoundError extends Error {
    private constructor() {
        super("City not found!")
        this.name = "CityNotFoundError"
    }
}


export async function getCoordinates(cityName: string): Promise<CityCoordinates> {
    let APIkey = "63473091e3dbe3b4db55f48ee898d316"
    try {

        let resp = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIkey}`).then(response => response.json())
        if (resp) {
            return resp[0]
        }
        throw CityNotFoundError

    } catch (e){

        throw e

    }

}