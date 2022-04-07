import {
    AcquireOptions,
    GeolocationProvider as NativeProvider,
    StreamOptions,
    Geolocation,
} from "nativescript-context-apis/geolocation";
import { Observable, of } from "rxjs";

export function createNativeGeolocationProviderMock(): NativeProvider {
    return {
        isReady(): Promise<boolean> {
            return Promise.resolve(false);
        },
        prepare(
            watchAlways?: boolean,
            openSettingsIfDenied?: boolean
        ): Promise<void> {
            return Promise.resolve();
        },
        acquireLocation(options?: AcquireOptions): Promise<Geolocation> {
            return Promise.resolve(null);
        },
        locationStream(options?: StreamOptions): Observable<Geolocation> {
            return of(null);
        },
    } as NativeProvider;
}
