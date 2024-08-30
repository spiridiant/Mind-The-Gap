import { Component } from '@angular/core';
import { Record } from '../../shared/record';
import { remult } from 'remult';
import { MatTableModule } from '@angular/material/table';
import { RecordRepoService } from '../record-repo.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [MatTableModule ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {
  records: Record[] = [];
  recordRepo = remult.repo(Record);
  constructor(private recordRepoService: RecordRepoService) {}

  ngOnInit(){
    
    this.recordRepoService.getAllRecords().then((records) => this.records = records);
  }
}
