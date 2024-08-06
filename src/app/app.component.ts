import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeaderboardComponent } from './record/leaderboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeaderboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mindTheGap';
}
