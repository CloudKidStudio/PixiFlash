var BISON = require('../src/data/BISON.js');
var fs = require('fs');
var path = require('path');

var input = process.argv[2];

if (!input)
{
	console.error("ERROR: No input or output");
	process.exit(1);
}

input = path.resolve(input);
output = input.replace('.json', '.bson');

try
{
    if (fs.lstatSync(input).isFile())
    {
		var data = JSON.parse(fs.readFileSync(input));
		fs.writeFileSync(output, BISON.encode(data));
		console.log("Encoded file.");
		process.exit();
    }
}
catch (e) 
{
    console.error("ERROR: Input doesn't exist");
	process.exit(1);
}