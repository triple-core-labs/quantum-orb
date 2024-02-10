import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { HomepageComponent } from './homepage/homepage.component';
import { AppRoutingModule } from './app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { StepCardComponent } from './homepage/step-card/step-card.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { FooterComponent } from './footer/footer.component';
import { CommonModule } from '@angular/common';
import { OrbpageComponent } from './orbpage/orbpage.component';
import { OrbComponent } from './orbpage/orb/orb.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { AppState } from './store/app/app.state';
import { InvitationsAmountPipe } from './pipes/invitations-amount.pipe';
import { ShortAddressPipe } from './pipes/short-address.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    NavbarComponent,
    StepCardComponent,
    LeaderboardComponent,
    FooterComponent,
    OrbpageComponent,
    OrbComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    InvitationsAmountPipe,
    ShortAddressPipe,
    NgxsModule.forRoot([AppState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
