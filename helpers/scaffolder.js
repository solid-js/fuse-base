


class Scaffolder
{
	constructor ()
	{

	}
}


module.exports = {
	Scaffolder
};


/*
module.exports = function (grunt)
{
	grunt.registerMultiTask('scaff', 'Scaffolding files quickly with templates.', function ()
	{
		// Get dependencies
		var inquirer = require('inquirer'),
			wrench = require('wrench'),
			path = require('path'),
			fs = require('fs'),
			_ = grunt.util._;

		// Get options
		var options = this.options({
			// Delimiters (use regex notation)
			delimiters: ['\%\%', '\%\%']
		});

		// Create our regex
		var templateRegex = new RegExp(options.delimiters[0] + '(.*?)' + options.delimiters[1], 'g');

		// Quick and dirty template method
		function quickTemplate (pTemplate, pValues)
		{
			return pTemplate.replace(templateRegex, function(i, pMatch) {
				return pValues[pMatch];
			});
		}

		var _process = function (result)
		{
			var template = options.template || {};

			if (options.filter && _.isFunction(options.filter))
			{
				result = options.filter(result);
			}

			Object.keys(template).forEach(function(key)
			{
				var dist = quickTemplate(template[key], result),
					distDir = path.dirname(dist);

				if (fs.statSync(key).isFile())
				{
					wrench.mkdirSyncRecursive(distDir);

					fs.writeFileSync(
						dist,
						quickTemplate(
							fs.readFileSync(key, 'utf-8'),
							result
						)
					);
				}
				else
				{
					wrench.mkdirSyncRecursive(distDir);
					wrench.copyDirSyncRecursive(key, dist);
					wrench.readdirSyncRecursive(dist).forEach(function(file)
					{
						file = path.join(dist, file);

						fs.writeFileSync(
							quickTemplate(file, result),
							quickTemplate(
								fs.readFileSync(file, 'utf-8'),
								result
							),
							'utf-8'
						);
					});
				}
			});
		};

		var questions = options.questions;

		if (options.before && _.isFunction(options.before))
		{
			options.before();
		}

		if (questions)
		{
			var done = this.async();
			inquirer.prompt(questions).then(function(result)
			{
				_process(result);
				if (options.after && _.isFunction(options.after))
				{
					options.after(result);
				}
				done();
			});
		}
		else _process({});
	});
};

 */