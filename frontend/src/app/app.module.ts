import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { HomepageComponent } from './homepage/homepage.component';
import { AppRoutingModule } from './app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { StepCardComponent } from './homepage/step-card/step-card.component';
import { FooterComponent } from './footer/footer.component';
import { OrbpageComponent } from './orbpage/orbpage.component';
import { OrbComponent } from './orbpage/orb/orb.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    NavbarComponent,
    StepCardComponent,
    FooterComponent,
    OrbpageComponent,
    OrbComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
