import axios, { AxiosInstance } from "axios";

export interface ListSensorValue {
  Date: string;
  Hum: number;
  Temp: number;
}

export class EgainService {
  private readonly axoisInstance: AxiosInstance;

  constructor() {
    this.axoisInstance = axios.create({
      baseURL: "http://install.egain.se/Home/",
      timeout: 1000
    });
  }

  public async getLatestTemperature(guid: string): Promise<number> {
    try {
      const resp = await this.axoisInstance.post("ListSensorValues", {
        guid,
        daysAgo: 1
      });
      const sensorValues: ListSensorValue[] = resp.data as ListSensorValue[];
      const lastValue = sensorValues.pop();
      return lastValue.Temp;
    } catch (e) {
      console.error(e);
    }
  }
}
