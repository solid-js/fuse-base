
// IMPORTANT : This needs to be static (no expression to resolve require)
// IMPORTANT : Because quantum will convert them to numbers, so it will not work anymore.
// IMPORTANT : This is why we generate it before compiling
module.exports = () => {
	return [
		require('../main/index'),
		require('../test-app/index')
  ]
};