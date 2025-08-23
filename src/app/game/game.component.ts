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
	private guy: HTMLImageElement = new Image();
	private pipes: number[] = [];
	private pipeWidth = 40;
	private frame = 0;
	private height = 300;
	private gap = 0;
	guyX = 0;
	guyY = 0; // Add Y position for falling animation
	ladderLength = 0;
	ladderAngle = 0;
	isLadderGrowing = false;
	isLadderRotating = false;
	isGuyWalking = false;
	isGuyFalling = false;
	gameState = 'playing'; // 'playing', 'walking', 'falling', 'gameOver'
	score = 0;
	walkProgress = 0;
	fallSpeed = 0;
	gravity = 0.5;
	
	// Animation variables
	rotationSpeed = 0.05;
	walkSpeed = 2;

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
			this.gap = Math.random() * (this.canvas.width / 3) + 80; // More reasonable gap size
			this.pipes.push(this.pipes[0] + this.gap);
		}
		
		// Remove pipes that are off-screen
		this.pipes = this.pipes.filter(pipe => pipe + this.pipeWidth > -100);
		
		// Add new pipes when guy successfully crosses
		if (this.gameState === 'playing' && this.pipes.length < 4) {
			const lastPipe = this.pipes[this.pipes.length - 1];
			const newGap = Math.random() * (this.canvas.width / 3) + 80;
			this.pipes.push(lastPipe + newGap);
		}
	}

	private loop() {
		this.update();
		this.drawScene();
		this.frame++;
		
		if (this.gameState !== 'gameOver') {
			requestAnimationFrame(() => this.loop());
		}
	}

	private update() {
		this.updatePipes();
		this.updateGuy();
		this.updateLadder();
	}

	private updateGuy() {
		if (this.gameState === 'playing') {
			this.guyX = this.pipes[0];
			this.guyY = this.height - 50;
		} else if (this.gameState === 'walking') {
			this.updateWalking();
		} else if (this.gameState === 'falling') {
			this.updateFalling();
		}
	}

	private updateWalking() {
		// Guy walks to the end of the ladder
		if (this.walkProgress < this.ladderLength + this.pipeWidth / 2) {
			this.walkProgress += this.walkSpeed;
			this.guyX = this.pipes[0] + this.walkProgress;
		} else {
			// Guy reached end of ladder - check WHERE he ended up
			const landing = this.pipes[0] + this.pipeWidth + this.ladderLength;
			const nextPipeStart = this.pipes[1];
			const nextPipeEnd = this.pipes[1] + this.pipeWidth;
			
			if (landing >= nextPipeStart && landing <= nextPipeEnd) {
				// Success! Guy (including his width) fits on the next pipe
				this.gameState = 'playing';
				this.walkProgress = 0;
				this.score++;
				this.resetLadder();
				
				// Move to next pipe
				this.pipes.shift();
				this.guyX = this.pipes[0];
			} else {
				// Failure! Guy doesn't fit on pipe - he falls
				this.guyFalls();
			}
		}
	}

	private updateFalling() {
		this.fallSpeed += this.gravity;
		this.guyY += this.fallSpeed;
		
		// Check if guy hit the bottom
		if (this.guyY > this.canvas.height) {
			this.gameState = 'gameOver';
			this.scoreService.setScore(this.score);
			setTimeout(() => {
				this.router.navigate(['/over']);
			}, 500);
		}
	}

	private updateLadder() {
		if (this.isLadderRotating) {
			this.ladderAngle += this.rotationSpeed;
			
			if (this.ladderAngle >= Math.PI / 2) {
				this.ladderAngle = Math.PI / 2;
				this.isLadderRotating = false;
				this.checkLadderSuccess();
			}
		}
	}

	ngAfterViewInit() {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.canvas.width = 400;
		this.canvas.height = 600;
		this.guy.src = 'guy_walk.gif';
		this.guyY = this.height - 50;
		this.loop();
	}

	drawScene() {
		// Clear canvas with sky blue background
		this.ctx.fillStyle = '#87CEEB';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.drawPipes();
		this.drawLadder();
		this.drawGuy();
		this.drawUI();
	}

	private drawLadder() {
		if (this.ladderLength > 0) {
			this.ctx.save();
			
			// Ladder stays at original position, not attached to moving guy
			const ladderBaseX = this.pipes[0] + 40;
			const ladderBaseY = this.height - 10;
			
			this.ctx.translate(ladderBaseX, ladderBaseY);
			this.ctx.rotate(this.ladderAngle);
			
			// Draw ladder
			this.ctx.fillStyle = 'brown';
			this.ctx.fillRect(0, 0, 8, -this.ladderLength);
			
			// Draw ladder rungs
			this.ctx.fillStyle = '#8B4513';
			for (let i = 10; i < this.ladderLength; i += 15) {
				this.ctx.fillRect(-2, -i, 12, 3);
			}
			
			this.ctx.restore();
		}
	}

	private drawGuy() {
		this.ctx.save();
		
		// Draw guy with slight bobbing animation when walking
		let bobOffset = 0;
		if (this.gameState === 'walking') {
			bobOffset = Math.sin(this.frame * 0.3) * 2;
		}
		
		this.ctx.drawImage(this.guy, 0, 0, this.guy.width, this.guy.height, 
			this.guyX, this.guyY + bobOffset, 50, 50);
		
		this.ctx.restore();
	}

	private drawUI() {
		// Draw score
		this.ctx.fillStyle = 'black';
		this.ctx.font = '20px Arial';
		this.ctx.fillText(`Score: ${this.score}`, 10, 30);
	}

	@HostListener('document:keydown.space', ['$event'])
	@HostListener('document:mousedown', ['$event'])
	startLadder(event: Event) {
		event.preventDefault();
		if (this.gameState === 'playing' && !this.isLadderGrowing && !this.isLadderRotating) {
			this.isLadderGrowing = true;
			this.growLadder();
		}
	}

	@HostListener('document:keyup.space', ['$event'])
	@HostListener('document:mouseup', ['$event'])
	stopLadder(event: Event) {
		event.preventDefault();
		if (this.isLadderGrowing) {
			this.isLadderGrowing = false;
			this.rotateLadder();
		}
	}

	growLadder() {
		if (this.isLadderGrowing && this.gameState === 'playing') {
			this.ladderLength += 3;
			
			// Limit maximum ladder length
			if (this.ladderLength < this.canvas.width) {
				requestAnimationFrame(() => this.growLadder());
			} else {
				this.isLadderGrowing = false;
				this.rotateLadder();
			}
		}
	}

	rotateLadder() {
		if (this.gameState === 'playing') {
			this.isLadderRotating = true;
		}
	}

	private checkLadderSuccess() {
		// Always start walking animation
		this.gameState = 'walking';
		this.walkProgress = 0;
	}

	resetLadder() {
		this.ladderLength = 0;
		this.ladderAngle = 0;
		this.isLadderGrowing = false;
		this.isLadderRotating = false;
	}

	private guyWalk() {
		this.gameState = 'walking';
		this.walkProgress = 0;
	}

	private guyFalls() {
		this.gameState = 'falling';
		this.fallSpeed = 0;
	}
}