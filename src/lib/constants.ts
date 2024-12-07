import { MossPolesData } from "./types";

export const defaultConfig: MossPolesData = {
    "config": {
        "visual": {
            "backgroundColor": "#FFFFFF",
            "textColor": "#333333",
            "algaePercentage": 10,
            "polesPerRow": 4
        },
        "title": {
            "enabled": true,
            "text": "Moss Pole Care Guide"
        },
        "careTips": {
            "enabled": true,
            "tips": [
                "Mist 1-2× daily",
                "Check moisture",
                "Higher humidity in growing season",
                "Monitor moss moisture level"
            ]
        }
    },
    "poles": [
        {
            "name": "Monstera Albo",
            "humidityTop": "70-80",
            "humidityMiddle": "65-75",
            "humidityBottom": "60-70",
            "potColor": "#EA4335",
            "displaySensorPlace": true
        },
        {
            "name": "Philodendron Gloriosum",
            "humidityTop": "70-80",
            "humidityMiddle": "65-75",
            "humidityBottom": "60-70",
            "potColor": "#FBBC05"
        },
        {
            "name": "M. Esqueleto",
            "humidityTop": "70-80",
            "humidityMiddle": "65-75",
            "humidityBottom": "60-70",
            "potColor": "#34A853",
            "displaySensorPlace": true
        },
        {
            "name": "Anthurium Clarinervium",
            "humidityTop": "75-85",
            "humidityMiddle": "70-80",
            "humidityBottom": "65-75",
            "potColor": "#4285F4",
            "displaySensorPlace": false
        },
    ]
}

export const defaultInput: Record<string, string> = {
    json: JSON.stringify(defaultConfig, null, 2),
    yaml: JSON.stringify(defaultConfig, null, 2)
}
