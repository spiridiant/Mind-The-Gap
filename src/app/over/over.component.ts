import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreDataService } from '../score-data.service';
import { FormsModule } from '@angular/forms';
import { RecordRepoService } from '../record-repo.service';
import { Record } from '../../shared/record';

@Component({
  selector: 'app-over',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './over.component.html',
  styleUrl: './over.component.css'
})
export class OverComponent {
  score: number = 0;  // Score passed from the game component
  newUsername: string = '';

  constructor(private router: Router, private scoreService: ScoreDataService, private recordRepoService: RecordRepoService) {

  }
  
  ngOnInit(): void {
    this.score = this.scoreService.getScore();
  }

  async submitRecord(): Promise<void> {
    if (this.newUsername.trim()) {
      
      try {
        await this.recordRepoService.addRecord({username: this.newUsername, score: this.score});
        this.newUsername = ""
      } catch (error: any) {
        alert(error.message)
      }
      alert('Username submitted:' + this.newUsername);
      
    } else {
      this.newUsername = '';
      alert('Please enter a valid username.');
    }
  }

  replayGame(): void {
    this.router.navigate(['/game']);
  }
}
