import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreDataService {
  private score:number = 0
  constructor() { }
  setScore(score:number) {
    this.score = score;
  }
  getScore():number {
    return this.score;
  }
}
