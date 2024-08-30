import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreDataService } from '../score-data.service';

@Component({
	selector: 'app-game',
	standalone: true,
	imports: [],
	templateUrl: './game.component.html',
	styleUrl: './game.component.css'
})
export class GameComponent {
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	private guy: HTMLImageElement = new Image();;
	private pipes: number[] = [];
	private pipeWidth = 40;
	private frame = 0;
	private height = 300;
	private gap = 0;
	guyX = 0; // Initial position of the guy
	ladderLength = 0;
	ladderAngle = 0;
	isLadderGrowing = false;

	constructor(private router: Router, private scoreService: ScoreDataService) {}

	private drawPipes() {
		this.ctx.fillStyle = '#0AE';
		this.pipes.forEach(pipe => {
			this.ctx.fillRect(pipe, this.height, this.pipeWidth, this.canvas.height - this.height);
		});
	}

	private updatePipes() {
		if(this.pipes.length === 0) {
			this.pipes.push(this.pipeWidth);
			this.gap = Math.random() * this.canvas.width / 4 * 3 + this.pipeWidth;
			this.pipes.push(this.pipes[0] + this.gap);
		}
		this.pipes = this.pipes.filter(pipe => pipe + this.pipeWidth > 0);
	}

	private loop() {
		this.update();
		this.drawScene();
		this.frame++;
		requestAnimationFrame(() => this.loop());
	}
	private update() {
		this.updatePipes();
		this.updateGuy();
	}
	private updateGuy() {
		this.guyX = this.pipes[0];
	}
	

	ngAfterViewInit() {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.canvas.width = 400;
		this.canvas.height = 600;
		this.guy.src = 'guy_walk.gif'
		this.loop();
	}

	drawScene() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawPipes();
		this.drawGuy();
		this.drawLadder();
	}

	private drawLadder() {
		if (this.ladderLength > 0) {
			this.ctx.fillStyle = 'brown';
			this.ctx.fillRect(this.guyX + 40, this.height - 10, 5, -this.ladderLength);
		}
	}

	private drawGuy() {
		this.ctx.drawImage(this.guy, 0, 0, this.guy.width, this.guy.height, this.guyX, this.height - 50, 50, 50);
	}

	@HostListener('document:keydown.space', ['$event'])
	@HostListener('document:mousedown', ['$event'])
	startLadder() {
		this.isLadderGrowing = true;
		this.growLadder();
	}

	@HostListener('document:keyup.space', ['$event'])
	@HostListener('document:mouseup', ['$event'])
	stopLadder() {
		this.isLadderGrowing = false;
		this.rotateLadder();
	}

	growLadder() {
		if (this.isLadderGrowing) {
			this.ladderLength += 5; // Increase ladder height
			
			requestAnimationFrame(() => this.growLadder());
		}
	}

	rotateLadder() {
		if (this.ladderLength >= this.gap && this.ladderLength <= this.gap + this.pipeWidth) {
			this.guyWalk();
		}
		else {
			this.guyFalls();
		}
	}

	resetLadder() {
		this.ladderLength = 0;
		this.ladderAngle = 0;
	}

	private guyWalk(){
		this.guyX += this.gap;
	}

	private guyFalls(){
		this.scoreService.setScore(Math.floor(Math.random() * 20) );
		this.router.navigate(['/over']);
	}

}

