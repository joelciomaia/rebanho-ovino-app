import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  temperatura: number;
  umidade: number;
  vento: number;
  chuva: number;
  descricao: string;
  icone: string;
  cidade: string;
  previsao: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'b3d802fec9a70099aa03a955585f1386';
  private apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) { }

  // Buscar clima atual por cidade
  getCurrentWeather(cidade: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/weather?q=${cidade}&appid=${this.apiKey}&units=metric&lang=pt_br`
    );
  }

  // Converter dados da API para nosso formato
  parseWeatherData(apiData: any): WeatherData {
    return {
      temperatura: Math.round(apiData.main.temp),
      umidade: apiData.main.humidity,
      vento: Math.round(apiData.wind.speed * 3.6), // m/s para km/h
      chuva: apiData.rain ? apiData.rain['1h'] || 0 : 0,
      descricao: apiData.weather[0].description,
      icone: this.getWeatherIcon(apiData.weather[0].icon),
      cidade: apiData.name,
      previsao: this.generateForecast(apiData.weather[0].main)
    };
  }

  // Mapear ícones do OpenWeather para nossos ícones
  private getWeatherIcon(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': 'sunny', '01n': 'moon',
      '02d': 'partly-sunny', '02n': 'cloudy-night',
      '03d': 'cloud', '03n': 'cloud',
      '04d': 'cloudy', '04n': 'cloudy',
      '09d': 'rainy', '09n': 'rainy',
      '10d': 'rainy', '10n': 'rainy',
      '11d': 'thunderstorm', '11n': 'thunderstorm',
      '13d': 'snow', '13n': 'snow',
      '50d': 'water', '50n': 'water'
    };
    return iconMap[iconCode] || 'partly-sunny';
  }

  // Gerar previsão baseada nas condições
  private generateForecast(condition: string): string {
    const forecasts: { [key: string]: string } = {
      'Clear': 'Condições ideais para pastoreio. Dia ensolarado.',
      'Clouds': 'Parcialmente nublado. Boas condições para os animais.',
      'Rain': 'Chuva prevista. Mantenha os animais abrigados.',
      'Thunderstorm': 'Tempestade. Animais devem ficar abrigados.',
      'Snow': 'Neve. Condições adversas para pastoreio.',
      'Mist': 'Neblina. Cuidado com a visibilidade.'
    };
    return forecasts[condition] || 'Condições climáticas normais para a região.';
  }
}