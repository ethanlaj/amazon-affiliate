import process from "process";
import rdl from "readline";

export class ProgressBar {
	constructor() {
		this.size = 80;
		this.cursor = 0;
		this.timer = null;
	}
	start() {
		process.stdout.write("\x1B[?25l");
		for (let i = 0; i < this.size; i++) {
			process.stdout.write("\u2591");
		}
		rdl.cursorTo(process.stdout, this.cursor);
		this.timer = setInterval(() => {
			process.stdout.write("\u2588");
			this.cursor++;
			if (this.cursor >= this.size) {
				clearTimeout(this.timer);
			}
		}, 15000);
	}
}