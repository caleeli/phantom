import { get, set } from "lodash";

class Sheet {
	private config = { headers: [], cells: {} };
	public cell = [];
	private data: any[];
	public ref: any[];
	public format: any[];
	// Constructor
	constructor(config = { headers: [], cells: {} }, data: Array<any>) {
		const self = this;
		this.config = config;
		this.data = data;
		const cell = [];
		data.forEach((data, row) => {
			cell.push([]);
			config.headers.forEach((header, col) => {
				const def = {
					value: null,
					align: 'left',
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
					return () => ([]);
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

		this.format = new Proxy(data, {
			get(target, prop: string) {
				if (prop === 'map') {
					return () => ([]);
				}
				const p = prop.split(',');
				const row = Number(p[0]);
				const col = Number(p[1]);
				const value = get(target[row], cell[row][col].value);
				const format = cell[row][col].format || '${value}';
				return (new Function('value', 'currency', 'icon', 'return `' + format + '`'))(value, currency, icon);
			}
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

function currency(number) {
	return new Intl.NumberFormat('es-BO', {
		minimumFractionDigits: 2
	}).format(number);
}

function icon(icon) {
	return `<i class="fas fa-${icon}"></i>`;
}

// Ex. 0=A, 27=AA, 702=AAA
export const indexToCol = function (index) {
	let col = '';
	do {
		col = String.fromCharCode(96 + (index % 26)) + col;
		index = Math.floor(index / 26) - 1;
	} while (index >= 0);
	return col.toUpperCase();
}

export default Sheet;
