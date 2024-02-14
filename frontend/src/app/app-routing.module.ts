import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component'; // Import the missing 'LeaderboardComponent' class
import { OrbpageComponent } from './orbpage/orbpage.component';
import { ReferralsComponent } from './referrals/referrals.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomepageComponent,
    title: 'Home',
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    title: 'Leaderboard',
  },
  {
    path: 'orbs',
    component: OrbpageComponent,
    title: 'Orbs',
  },
  {
    path: 'referrals',
    component: ReferralsComponent,
    title: 'Referrals',
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
