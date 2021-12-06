import { get, set } from "lodash";

class Sheet {
	private config = { headers: [], cells: {} };
	public cell = [];
	private data: any[];
	public ref: any[];
	// Constructor
	constructor(config = { headers: [], cells: {} }, data: Array<any>) {
		this.config = config;
		this.data = data;
		const cell = [];
		data.forEach((data, row) => {
			cell.push([]);
			config.headers.forEach((header, col) => {
				const def = {
					value: null,
					align: '',
					control: 'text',
				};
				this.applyConfig(row, col, def);
				cell[row].push(def);
			});
		});
		this.cell = cell;
		this.ref = new Proxy(data, {
			get(target, prop: string) {
				if (prop === 'map') {
					return ()=>([]);
				}
				const p = prop.split(',');
				const row = Number(p[0]);
				const col = Number(p[1]);
				return get(target[row], cell[row][col].value);
			},
			set(target, prop: string, value) {
				const p = prop.split(',');
				const row = Number(p[0]);
				const col = Number(p[1]);
				set(target[row], cell[row][col].value, value);
				data = data;
				return true;
			},
		});
	}
	// Apply config
	private applyConfig(row, col, def) {
		Object.keys(this.config.cells).forEach(selector => {
			// Row selector
			if (selector.match(/^\d+$/)) {
				if (row === Number(selector)) {
					Object.assign(def, this.config.cells[selector]);
				}
			}
			// Col selector
			if (selector.match(/^[a-zA-Z]+$/)) {
				if (col === this.getColIndex(selector)) {
					Object.assign(def, this.config.cells[selector]);
				}
			}
			// Range selector
			const ma = selector.match(/^([a-zA-Z]+)(\d+):([a-zA-Z]+)(\d+)$/);
			if (ma) {
				const col1 = this.getColIndex(ma[1]);
				const row1 = Number(ma[2]);
				const col2 = this.getColIndex(ma[3]);
				const row2 = Number(ma[4]);
				if (col >= col1 && col <= col2 && row >= row1 && row <= row2) {
					Object.assign(def, this.config.cells[selector]);
				}
			}
			// Cell selector
			const mb = selector.match(/^([a-zA-Z]+)(\d+)$/);
			if (mb) {
				const col1 = this.getColIndex(mb[1]);
				const row1 = Number(mb[2]);
				if (col === col1 && row === row1) {
					Object.assign(def, this.config.cells[selector]);
				}
			}
		});
	}
	// Get col index
	private getColIndex(col: any): number {
		return col.toLowerCase().split('').reduce((acc, curr, index) => {
			return acc + (curr.charCodeAt(0) - 96);
		}, 0) - 1;
	}
	// Get value of cell
	public getValue(col: number, row: number): any {
		return get(this.data[row], this.cell[row][col].value);
	}
}

export default Sheet;
