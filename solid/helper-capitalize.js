

module.exports = {

	// Capitalize first letter. Can also put first letter as lower case.
	CapitalizeFirst: (pString, pUp) =>
	{
		let first = pString.substr(0, 1);
		let rest = pString.substr(1, pString.length);
		return ((pUp == null || !pUp) ? first.toLowerCase() : first.toUpperCase()) + rest;
	}
}