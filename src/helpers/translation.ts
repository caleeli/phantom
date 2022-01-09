import es from '../translations/es.json';

const translations = { es };

function translation(language: string) {
	let labels = {};
	const func = function (textOrName, data = {}) {
		const text = labels[textOrName] || textOrName;
		const translation = translations[language]?.[text];
		if (translation === undefined) {
			return text;
		}

		// replace :placeholders
		return translation.replace(/:([a-zA-Z0-9_]+)/g, (match: any, placeholder: string) => {
			return data[placeholder] || match;
		});
	};
	func.setLabels = (labelsO: any = {}) => {
		labels = labelsO;
	}
	return func;
}

export default translation;
