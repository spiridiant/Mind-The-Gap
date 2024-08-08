import { Component, HostListener } from '@angular/core';

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
	private myGif: HTMLImageElement = new Image();;
	private lift = -15;
	private pipes: { x: number, y: number }[] = [];
	private pipeWidth = 50;
	private pipeGap = 100;
	private frame = 0;

	ngAfterViewInit() {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.canvas.width = 600;
		this.canvas.height = 480;
		this.myGif.src = 'guy_walk.gif'
		this.loop();
	}

	@HostListener('window:keydown', ['$event'])
	handleKeyDown(event: KeyboardEvent) {
		if (event.key === ' ') {
			
		}
	}

	private drawGuy(): void {
		// this.ctx.fillStyle = '#FF0';
		// this.ctx.fillRect(50, this.birdY, 20, 20);
		this.ctx.drawImage(this.myGif, 0, 0, this.myGif.width, this.myGif.height, 300, 240, 70, 70);
	}



	private drawPipes() {
		this.ctx.fillStyle = '#0AE';
		this.pipes.forEach(pipe => {
			this.ctx.fillRect(pipe.x, pipe.y + this.pipeGap, this.pipeWidth, this.canvas.height - pipe.y - this.pipeGap);
		});
	}

	private updatePipes() {
		if (this.frame % 75 === 0) {
			let pipeY = Math.random() * (this.canvas.height - this.pipeGap - 20) + 10;
			this.pipes.push({ x: this.canvas.width, y: pipeY });
		}

		this.pipes.forEach(pipe => {
			pipe.x -= 2;
		});

		this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
	}

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawGuy();
		this.drawPipes();
	}

	private update() {
		this.updatePipes();
	}

	private loop() {
		this.update();
		this.draw();
		this.frame++;
		requestAnimationFrame(() => this.loop());
	}
}

