import { Record, RecordType } from "../base-record";

import {
  GeolocationLike,
  Geolocation as NativeGeolocation,
} from "nativescript-context-apis/internal/geolocation/geolocation";

export class Geolocation extends Record {
  constructor(
    public latitude: number,
    public longitude: number,
    public altitude: number,
    public horizontalAccuracy: number,
    public verticalAccuracy: number,
    public speed: number,
    public direction: number,
    capturedAt: Date
  ) {
    super(RecordType.Geolocation, capturedAt);
  }

  distance(to: Geolocation | GeolocationLike) {
    return new NativeGeolocation(this).distance(to);
  }
}

export { GeolocationLike } from "nativescript-context-apis/internal/geolocation/geolocation";
