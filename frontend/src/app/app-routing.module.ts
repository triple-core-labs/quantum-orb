import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component'; // Import the missing 'LeaderboardComponent' class
import { OrbpageComponent } from './orbpage/orbpage.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomepageComponent,
    data: { title: 'Home' },
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    data: { title: 'Leaderboard' },
    title: 'Home',
  },
  {
    path: 'orbs',
    component: OrbpageComponent,
    title: 'Orbs',
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
