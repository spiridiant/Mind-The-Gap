import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { GameComponent } from './game/game.component';
import { NavComponent } from './nav/nav.component';
import { AboutComponent } from './about/about.component';
import { OverComponent } from './over/over.component';

export const routes: Routes = [
    {path: '', component: GameComponent},
    {path: 'nav', component: NavComponent},
    {path: 'game', component: GameComponent},
    {path: 'over', component: OverComponent},
    {path: 'leaderboard', component: LeaderboardComponent},
    {path: 'about', component: AboutComponent}
];
