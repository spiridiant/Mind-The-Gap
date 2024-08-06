import { Component } from '@angular/core';
import { Record } from '../../shared/record';
import { remult } from 'remult';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [],
  templateUrl: './record.component.html',
  styleUrl: './record.component.css'
})
export class RecordComponent {
  records: Record[] = [];
  recordRepo = remult.repo(Record);
  ngOnInit(){
    this.recordRepo.find().then((records) => (this.records = records));
  }
}
