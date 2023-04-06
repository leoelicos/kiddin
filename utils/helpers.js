module.exports = {
	// Format date as DD/MM/YYYY
	format_date: (date) => {
		return date.toLocaleDateString();
	},
	// Format date as DDDD, DD/MM/YYYY
	format_date_long: (date) => {
		const options = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		return date.toLocaleDateString(undefined, options);
	},
};
