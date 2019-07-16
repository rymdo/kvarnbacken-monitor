import axios, { AxiosInstance } from "axios";

import { Moment } from "moment-timezone";
//let moment = require("moment");
let moment = require("moment-timezone");

interface APIListSensorValue {
  Date: string;
  Hum: number;
  Temp: number;
}

export interface ListSensorValue {
  date: Date;
  humidity: number;
  temperature: number;
}

interface APICheckInstalled {
  CId: number;
  CName: string;
  Cs: string;
  Installed: boolean;
  IsExternal: boolean;
  PartnerId: number;
  SensorInfo: {
    Date: string;
    Humidity: number;
    Rssi: string;
    Temp: number;
  };
  ShareValues: boolean;
  TSI: {
    ID: number;
    Lower: number;
    Text: string;
    Upper: number;
  };
}

export interface CheckInstalled {
  CId: number;
  CName: string;
  Cs: string;
  Installed: boolean;
  IsExternal: boolean;
  PartnerId: number;
  SensorInfo: {
    Date: Date;
    Humidity: number;
    Rssi: number;
    Temp: number;
  };
  ShareValues: boolean;
  TSI: {
    ID: number;
    Lower: number;
    Text: string;
    Upper: number;
  };
}

export class EgainService {
  private readonly axoisInstance: AxiosInstance;
  private readonly timezone: string = "Europe/Stockholm";
  private readonly timeformat: string = "YYYY-MM-DD HH:mm";

  constructor() {
    this.axoisInstance = axios.create({
      baseURL: "http://install.egain.se/Home/",
      timeout: 5000
    });
  }

  public async getLatestReading(guid: string): Promise<ListSensorValue> {
    try {
      const apiSensorValues = await this.APIListSensorValues(guid, 1);
      const apiCheckInstalled = await this.APICheckInstalled(guid);

      const sensorValues: ListSensorValue[] = apiSensorValues.map(value => {
        return this.mapAPIListSensorValueToListSensorValue(value);
      });

      const latestSensorValue = this.getLatestSensorValue(sensorValues);
      const checkInstalled = this.mapAPICheckInstalledToCheckInstalled(
        apiCheckInstalled
      );

      return latestSensorValue.date > checkInstalled.SensorInfo.Date
        ? latestSensorValue
        : {
            date: checkInstalled.SensorInfo.Date,
            humidity: checkInstalled.SensorInfo.Humidity,
            temperature: checkInstalled.SensorInfo.Temp
          };
    } catch (e) {
      console.error(e);
    }
  }

  public async getLatestTemperature(guid: string): Promise<number> {
    try {
      const apiSensorValues = await this.APIListSensorValues(guid, 1);
      const apiCheckInstalled = await this.APICheckInstalled(guid);

      const sensorValues: ListSensorValue[] = apiSensorValues.map(value => {
        return this.mapAPIListSensorValueToListSensorValue(value);
      });

      const latestSensorValue = this.getLatestSensorValue(sensorValues);
      const checkInstalled = this.mapAPICheckInstalledToCheckInstalled(
        apiCheckInstalled
      );

      return latestSensorValue.date > checkInstalled.SensorInfo.Date
        ? latestSensorValue.temperature
        : checkInstalled.SensorInfo.Temp;
    } catch (e) {
      console.error(e);
    }
  }

  private APIListSensorValues = async (
    guid: string,
    daysAgo: number
  ): Promise<APIListSensorValue[]> => {
    try {
      const resp = await this.axoisInstance.post<APIListSensorValue[]>(
        "ListSensorValues",
        {
          guid,
          daysAgo
        }
      );
      return resp.data;
    } catch (e) {
      console.error(e);
    }
  };

  private APICheckInstalled = async (
    guid: string
  ): Promise<APICheckInstalled> => {
    try {
      const resp = await this.axoisInstance.post<APICheckInstalled>(
        "CheckInstalled",
        {
          guid
        }
      );
      return resp.data;
    } catch (e) {
      console.error(e);
    }
  };

  private mapAPIListSensorValueToListSensorValue(
    apiValue: APIListSensorValue
  ): ListSensorValue {
    return {
      date: this.convertAPIDateToDate(apiValue.Date),
      humidity: apiValue.Hum,
      temperature: apiValue.Temp
    };
  }

  //SensorInfo
  private mapAPICheckInstalledToCheckInstalled(
    apiValue: APICheckInstalled
  ): CheckInstalled {
    return {
      CId: apiValue.CId,
      CName: apiValue.CName,
      Cs: apiValue.Cs,
      Installed: apiValue.Installed,
      IsExternal: apiValue.IsExternal,
      PartnerId: apiValue.PartnerId,
      SensorInfo: {
        Date: this.convertAPIDateToDate(apiValue.SensorInfo.Date),
        Humidity: apiValue.SensorInfo.Humidity,
        Rssi: Number(apiValue.SensorInfo.Rssi),
        Temp: apiValue.SensorInfo.Temp
      },
      ShareValues: apiValue.ShareValues,
      TSI: {
        ID: apiValue.TSI.ID,
        Lower: apiValue.TSI.Lower,
        Text: apiValue.TSI.Text,
        Upper: apiValue.TSI.Upper
      }
    };
  }

  private convertAPIDateToDate(apiDate: string): Date {
    const momentDate: Moment = moment.tz(
      apiDate,
      this.timeformat,
      this.timezone
    );
    // ToDo: Temp DST fix.
    momentDate.add(-1, "hours");
    return momentDate.toDate();
  }

  private getLatestSensorValue(values: ListSensorValue[]): ListSensorValue {
    return values.reduce((latest, current) => {
      if (!latest) {
        return current;
      }
      if (latest.date > current.date) {
        return latest;
      } else {
        return current;
      }
    });
  }
}
