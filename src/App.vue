<script setup lang="ts">
    import { ref, computed, Ref } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useLocale } from 'vuetify/lib/framework.mjs'
    import { getCoordinates, CityNotFoundError} from './getCoordinates'
    import { getWeatherCurrent, weatherDataCurrent } from './getWeatherCurrent'
    import { getFirstGoogleImageLink } from './getFirstGoogleImageLink'

    const locales = {
    en: {
          "name": "English",
          "code": "en"
        },
    ru: {
            "name": "Русский",
            "code": "ru"
        }
}

    const {t} = useI18n()

    let weatherData = ref<undefined | weatherDataCurrent>(undefined)
    let loading = ref(false)
    let city = ref<undefined | string>(undefined)
    let lastCityLocales = ref<undefined | object>(undefined)
    const cityRules = [
        (value: string) => {if (value) {return true}; return t("cityRequired")}
    ]
    let alert = ref<undefined | string>(undefined)
    let currentLocale = ref(useLocale())
    let cityImg = ref<undefined | string>(undefined)

    const isDisabled = computed(() => {
        return !city.value
    })

    const cloudiness = computed(() => {
        let clouds = weatherData.value?.clouds
        if (!clouds) return
        if (clouds < 20) {
            return t("sunny")
        } else if (clouds < 40) {
            return t("bitCloud")
        } else if (clouds < 60) {
            return t("medCloud")
        } else if (clouds < 80) {
            return t("heavyCloud")
        } else {
            return t("heaviestCloud")
        }
    })

    const windDirection = computed(() => {
        let deg = weatherData.value?.wind_deg
        if (!deg) return
        if (deg < 45 || deg > 315) {
            return t("windNorth")
        } else if (deg >= 45 && deg < 135) {
            return t("windEast")
        } else if (deg >= 135 && deg < 225) {
            return t("windSouth")
        } else {
            return t("windWest")
        }
    })

    const storedSearches = computed(() => {
        let toRet = localStorage.storedSearches === undefined ? [] : [...JSON.parse(localStorage.storedSearches)];
        toRet = toRet.slice(0, 6)
        localStorage.storedSearches = JSON.stringify(toRet)
        return toRet
    })

    const savedLocale = computed(():string => {
        return localStorage.locale === undefined ? "en" : localStorage.locale
    })
    currentLocale.value.current = savedLocale.value

    async function getWeather(city: string) {
        loading.value = true
        let lat, lon, local_names
        let coords

        try {
            coords = await getCoordinates(city);
            ({lat, lon, local_names} = coords)

        } catch (e) {

            if (e instanceof CityNotFoundError) {
                loading.value = false
                alert.value = t("noCityError")
                return
            }

            loading.value = false
            alert.value = t("genericError")
            return
        }

        lastCityLocales.value = local_names

        if (!storedSearches.value.includes(city)) { //если город был найден добавляем в историю поиска
            console.log(city)
            storedSearches.value.unshift(city)
            console.log(storedSearches.value)
            localStorage.storedSearches = JSON.stringify(storedSearches.value)
        }

        try {
            weatherData.value = await getWeatherCurrent(lat, lon)
        } catch {
            loading.value = false
            alert.value= t("genericError")
            return
        }

        try {
            cityImg.value = await getFirstGoogleImageLink(`Royalty free photo of ${local_names["en"]} city skyline`)
            loading.value = false
        } catch {
            loading.value = false
            return
        }
    }

    function setLocale(locale: string) {
        currentLocale.value.current = locale
        localStorage.locale = locale
    }

</script>


<template>
    <body>
    <v-app>
        <v-app-bar elevation="1" style="max-width: 600px; left: 50%; transform: translate(-50%);">
            <template v-slot:append>
                <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn
                    v-bind="props"
                    >
                    {{ locales[currentLocale.current].name }}
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                    v-for="(item, index) in locales"
                    :key="index"
                    :value="item.name"
                    @click="setLocale(item.code)"
                    >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    </v-list-item>
                </v-list>
                </v-menu>
            </template>
        </v-app-bar>
        <v-container class="fill-height justify-center">            
            <v-col align-self="center" class="text-center" style="max-width: 600px;">                        
                <v-slide-y-reverse-transition v-show="alert">
                    <v-alert @click="alert = ''" type="error" closable transition="slide-y-transition" class="m-15">{{ alert }}</v-alert>
                </v-slide-y-reverse-transition>
                <v-combobox 
                        v-model="city" 
                        :items=storedSearches 
                        :rules="cityRules"
                        elevation="6"
                        clearable 
                        :placeholder= '$t("cityFieldPlaceholder")'
                        required
                        theme="light"
                        variant="solo-filled"/>
                <v-btn
                    variant="outlined"
                    :loading="loading"
                    @click='getWeather(city)'
                    :disabled="isDisabled">
                    {{ $t("getWeatherBtn") }}
                </v-btn>
                <v-slide-y-reverse-transition v-show="weatherData">
                    <v-card v-if="weatherData" class="text-left my-5">
                        <v-img max-height="200" :src=cityImg aspect-ratio="0.5" cover/>
                        <v-card-title>{{ $t("weatherIn") }} {{ lastCityLocales[currentLocale.current] }}</v-card-title>    
                        <v-card-text>
                            {{ $t("temperature", [+(weatherData.temp - 273.15).toFixed(0), +(weatherData.feels_like - 273.15).toFixed(0)]) }} <br>
                            <!-- Температура {{ +(weatherJson.current.temp - 273.15).toFixed(0) }} C, ощущается как {{ +(weatherJson.current.feels_like - 273.15).toFixed(0) }} C<br> -->
                            {{ cloudiness }}<br>
                            {{ $t("wind", [weatherData?.wind_speed]) }}, {{ windDirection }}<br>
                            <!-- Ветер {{ weatherJson?.current.wind_speed}} м/с, {{ windDirection }}<br> -->
                            {{ $t("pressure", [+(weatherData?.pressure * 0.750062).toFixed(2)]) }}<br>
                            <!-- Давление {{ +(weatherJson?.current.pressure * 0.750062).toFixed(2)}} мм<br> -->
                            {{ $t("humidity", [weatherData?.humidity]) }}<br>
                            <!-- Относительная влажность {{ weatherJson?.current.humidity }}%<br> -->
                        </v-card-text>
                    </v-card>
                </v-slide-y-reverse-transition>
            </v-col>
        </v-container>
    </v-app>
    </body>
</template>
./locale/locales.js./locales.js