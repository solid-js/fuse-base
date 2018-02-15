
// IMPORTANT : This needs to be static (no expression to resolve require)
// IMPORTANT : Because quantum will convert them to numbers, so it will not work anymore.
// IMPORTANT : This is why we generate it before compiling
module.exports = {
  paths : [
  		'default/bundles.ts/index',
		'default/index.html/index',
		'default/index.ts/index'
  ],
  requires : () => {
    return [
  		require('./bundles.ts/index'),
		require('./index.html/index'),
		require('./index.ts/index')
    ]
  }
};