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
	private pipes: { x: number, width: number }[] = [];
	private pipeWidth = 40;
	private frame = 0;
	private height = 300;
	private gap = 0;
	
	// Camera system
	private cameraX = 0;
	private targetCameraX = 0;
	private cameraSpeed = 5;
	private isMovingCamera = false;
	
	// Guy position (world coordinates)
	private guyWorldX = 0;
	private guyWorldY = 0;
	
	// Guy screen position
	guyX = 0;
	guyY = 0;
	ladderLength = 0;
	ladderAngle = 0;
	isLadderGrowing = false;
	isLadderRotating = false;
	isGuyWalking = false;
	isGuyFalling = false;
	gameState = 'playing'; // 'playing', 'walking', 'falling', 'gameOver', 'transitioning'
	score = 0;
	walkProgress = 0;
	fallSpeed = 0;
	gravity = 0.5;
	
	// Animation variables
	rotationSpeed = 0.05;
	walkSpeed = 2;
	
	// Current pipe index (which pipe the guy is standing on)
	currentPipeIndex = 0;

	constructor(private router: Router, private scoreService: ScoreDataService) {}

	private initializePipes() {
		this.pipes = [];
		// Create initial pipes with world coordinates
		let x = this.pipeWidth;
		for (let i = 0; i < 5; i++) {
			this.pipes.push({ x: x, width: this.pipeWidth });
			if (i < 4) {
				const gap = Math.random() * (this.canvas.width / 3) + 80;
				x += this.pipeWidth + gap;
			}
		}
		
		// Guy starts on first pipe
		this.guyWorldX = this.pipes[0].x;
		this.guyWorldY = this.height - 50;
		this.currentPipeIndex = 0;
	}

	private drawPipes() {
		this.pipes.forEach(pipe => {
			const screenX = pipe.x - this.cameraX;
			// Only draw pipes that are visible on screen
			if (screenX > -pipe.width && screenX < this.canvas.width + pipe.width) {
				const pipeHeight = this.canvas.height - this.height;
				
				// Draw main pipe body with base color
				this.ctx.fillStyle = '#0AE';
				this.ctx.fillRect(screenX, this.height + 8, pipe.width, pipeHeight);
				
				// Add 3D shading effects
				// Left highlight (light source from top-left)
				this.ctx.fillStyle = '#4DCCFF';
				this.ctx.fillRect(screenX, this.height + 8, 4, pipeHeight);
				
				// Top highlight
				this.ctx.fillStyle = '#66D9FF';
				this.ctx.fillRect(screenX, this.height + 8, pipe.width, 4);
				
				// Right shadow (darker)
				this.ctx.fillStyle = '#0088CC';
				this.ctx.fillRect(screenX + pipe.width - 4, this.height + 8, 4, pipeHeight);
				
				// Bottom shadow (darkest)
				this.ctx.fillStyle = '#006699';
				this.ctx.fillRect(screenX, this.canvas.height + 12, pipe.width, 4);
				
				// Add some inner depth with gradient effect
				const gradient = this.ctx.createLinearGradient(screenX, 0, screenX + pipe.width, 0);
				gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
				gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
				gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
				gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
				
				this.ctx.fillStyle = gradient;
				this.ctx.fillRect(screenX + 2, this.height + 2, pipe.width - 4, pipeHeight - 4);
				
				// Optional: Add a subtle top cap for extra 3D effect
				this.ctx.fillStyle = '#80E5FF';
				this.ctx.fillRect(screenX - 2, this.height, pipe.width + 4, 8);
				
				// Top cap shading
				this.ctx.fillStyle = '#99EAFF';
				this.ctx.fillRect(screenX - 2, this.height, pipe.width + 4, 2);
				this.ctx.fillStyle = '#4DCCFF';
				this.ctx.fillRect(screenX - 2, this.height + 6, pipe.width + 4, 2);
			}
		});
	}

	private updatePipes() {
		// Add new pipes ahead when needed
		while (this.pipes.length < this.currentPipeIndex + 6) {
			const lastPipe = this.pipes[this.pipes.length - 1];
			const newGap = Math.random() * (this.canvas.width / 3) + 80;
			const newX = lastPipe.x + lastPipe.width + newGap;
			this.pipes.push({ x: newX, width: this.pipeWidth });
		}
		
		// Remove pipes that are far behind (optimization)
		this.pipes = this.pipes.filter((pipe, index) => index >= this.currentPipeIndex - 2);
		
		// Adjust current pipe index after filtering
		if (this.pipes.length > 0) {
			const removedCount = Math.max(0, this.currentPipeIndex - 2);
			this.currentPipeIndex = Math.max(0, this.currentPipeIndex - removedCount);
		}
	}

	private updateCamera() {
		if (this.isMovingCamera) {
			const diff = this.targetCameraX - this.cameraX;
			if (Math.abs(diff) > 1) {
				this.cameraX += diff * (this.cameraSpeed / 100); // Use cameraSpeed variable
			} else {
				this.cameraX = this.targetCameraX;
				this.isMovingCamera = false;
				// Camera movement finished, guy can play again
				if (this.gameState === 'transitioning') {
					this.gameState = 'playing';
				}
			}
		}
		
		// Update guy's screen position based on camera
		this.guyX = this.guyWorldX - this.cameraX;
		this.guyY = this.guyWorldY;
	}

	private moveToNextPipe() {
		this.currentPipeIndex++;
		this.score++;
		
		// Set camera target to center the new current pipe
		const currentPipe = this.pipes[this.currentPipeIndex];
		this.targetCameraX = currentPipe.x - this.pipeWidth;
		this.isMovingCamera = true;
		this.gameState = 'transitioning';
		
		// Update guy's world position to new pipe
		this.guyWorldX = currentPipe.x;
		this.guyWorldY = this.height - 50;
		
		this.resetLadder();
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
		this.updateCamera();
		this.updateGuy();
		this.updateLadder();
	}

	private updateGuy() {
		if (this.gameState === 'playing') {
			// Guy stays on current pipe
			this.guyWorldX = this.pipes[this.currentPipeIndex]?.x || 0;
			this.guyWorldY = this.height - 50;
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
			this.guyWorldX = this.pipes[this.currentPipeIndex].x + this.walkProgress;
		} else {
			// Guy reached end of ladder - check WHERE he ended up
			const currentPipe = this.pipes[this.currentPipeIndex];
			const nextPipe = this.pipes[this.currentPipeIndex + 1];
			
			if (!nextPipe) {
				this.guyFalls();
				return;
			}
			
			const landing = currentPipe.x + this.pipeWidth + this.ladderLength;
			const nextPipeStart = nextPipe.x;
			const nextPipeEnd = nextPipe.x + nextPipe.width;
			
			if (landing >= nextPipeStart && landing <= nextPipeEnd) {
				// Success! Move to next pipe with camera transition
				this.walkProgress = 0;
				this.moveToNextPipe();
			} else {
				// Failure! Guy doesn't fit on pipe - he falls
				this.guyFalls();
			}
		}
	}

	private updateFalling() {
		this.fallSpeed += this.gravity;
		this.guyWorldY += this.fallSpeed;
		
		// Check if guy hit the bottom
		if (this.guyWorldY > this.canvas.height) {
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
		
		this.initializePipes();
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
		if (this.ladderLength > 0 && this.pipes[this.currentPipeIndex]) {
			this.ctx.save();
			
			// Ladder position relative to current pipe and camera
			const currentPipe = this.pipes[this.currentPipeIndex];
			const ladderBaseX = currentPipe.x + 40 - this.cameraX;
			const ladderBaseY = this.height;
			
			this.ctx.translate(ladderBaseX, ladderBaseY);
			this.ctx.rotate(this.ladderAngle);
			
			// Draw ladder
			this.ctx.fillStyle = '#ce5600ff';
			this.ctx.fillRect(0, 0, 5, -this.ladderLength);
			
			// Draw ladder rungs
			this.ctx.fillStyle = '#864415ff';
			for (let i = 10; i < this.ladderLength; i += 15) {
				this.ctx.fillRect(-2, -i, 3, 3);
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
		
		// Debug info (remove in production)
		// this.ctx.fillStyle = 'red';
		// this.ctx.font = '12px Arial';
		// this.ctx.fillText(`Camera: ${Math.round(this.cameraX)}`, 10, 50);
		// this.ctx.fillText(`Pipe Index: ${this.currentPipeIndex}`, 10, 65);
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