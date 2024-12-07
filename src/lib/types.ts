export interface ColorConfig {
    backgroundColor?: string;
    textColor?: string;
}

export interface CareTipsConfig {
    enabled: boolean;
    tips?: string[];
}

export interface TitleConfig {
    enabled: boolean;
    text?: string;
}

export interface VisualConfig {
    backgroundColor?: string;
    textColor?: string;
    algaePercentage?: number;
}

export interface MossPole {
    name: string;
    humidityTop: string;
    humidityMiddle: string;
    humidityBottom: string;
    potColor?: string;
    displaySensorPlace?: boolean;
}

export interface Config {
    visual: VisualConfig;
    title: TitleConfig;
    careTips: CareTipsConfig;
}

export interface MossPolesData {
    config: Config;
    poles: MossPole[];
}

export enum InputType {
    json = "json",
    yaml = "yaml"
}