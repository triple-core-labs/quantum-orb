import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { NgxsModule } from "@ngxs/store";
import { routes } from "./app.routes";
import { AppState } from "./store/app/app.state";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
    ),
    provideHttpClient(),
    provideAnimationsAsync(),
    importProvidersFrom(NgxsModule.forRoot([AppState])),
  ],
};
