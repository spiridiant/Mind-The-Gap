import { Component } from '@angular/core';
import { RouterOutlet, Router,  RouterLink, RouterLinkActive} from '@angular/router';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { GameComponent } from './game/game.component';
import { NavComponent } from "./nav/nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeaderboardComponent, GameComponent, RouterLink, RouterLinkActive, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  goToLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }
}
