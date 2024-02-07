import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { OrbpageComponent } from './orbpage/orbpage.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomepageComponent,
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
