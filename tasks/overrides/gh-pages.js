module.exports = {
	options: {
		base: '.',
		message: 'Auto-generated commit'
    },
    src: [
    	'<%= docsPath %>/**/*',
    	'dist/*.js',
    	'examples/**/*'
    ]
};