import { Injectable } from '@angular/core';
import { remult } from 'remult';
import { Record } from '../shared/record';

@Injectable({
  providedIn: 'root'
})
export class RecordRepoService {
  recordRepo;
  constructor() { 
    this.recordRepo = remult.repo(Record);
  }
    // Method to add a new record
    addRecord(record: any) {
      return this.recordRepo.insert(record);
    }
  
    // Method to get all records
    getAllRecords() {
      return this.recordRepo.find({
        orderBy: {
          score: "desc"
        }
      });
    }
}
