import axios, { AxiosInstance } from "axios";

import { Moment } from "moment";
let moment = require("moment");

interface APIListSensorValue {
  Date: string;
  Hum: number;
  Temp: number;
}

export interface ListSensorValue {
  Date: Date;
  Hum: number;
  Temp: number;
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

  constructor() {
    this.axoisInstance = axios.create({
      baseURL: "http://install.egain.se/Home/",
      timeout: 1000
    });
  }

  public async getLatestTemperature(guid: string): Promise<number> {
    try {
      const apiSensorValues = await this.APIListSensorValues(guid, 1);
      const apiCheckInstalled = await this.APICheckInstalled(guid);

      const sensorValues: ListSensorValue[] = apiSensorValues.map(value => {
        return this.mapAPIListSensorValueToListSensorValue(value);
      });

      const latestSensorValue = this.getLatestSensorValues(sensorValues);
      const checkInstalled = this.mapAPICheckInstalledToCheckInstalled(
        apiCheckInstalled
      );

      return latestSensorValue.Date > checkInstalled.SensorInfo.Date
        ? latestSensorValue.Temp
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
      Date: moment(apiValue.Date, "YYYY-MM-DD HH:mm").toDate(),
      Hum: apiValue.Hum,
      Temp: apiValue.Temp
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
        Date: moment(apiValue.SensorInfo.Date, "YYYY-MM-DD HH:mm").toDate(),
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

  private getLatestSensorValues(values: ListSensorValue[]): ListSensorValue {
    return values.reduce((latest, current) => {
      if (!latest) {
        return current;
      }
      if (latest.Date > current.Date) {
        return latest;
      } else {
        return current;
      }
    });
  }
}
