var express = require('express')
var compression = require('compression')
var sass = require('node-sass-middleware')
var fileupload = require('express-fileupload')
var PythonShell = require('python-shell')
var pythonScriptPath = './analyze.py'

var app = module.exports = express()

app.set('views', './views')
app.set('view engine', 'pug')

app.use(compression())
app.use(fileupload())
app.use(sass({
	src: __dirname + '/scss',
	dest: __dirname + '/public/css',
	outputStyle: 'compressed',
	prefix: '/css'
}))
app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index', {result: app.locals.result})
	app.locals.result = ''
})

app.post('/upload', (req, res) => {
	// the name of the input field is used to retrieve the uploaded file
	var upload = req.files.imageFile
 
	// use the mv() method to place the file somewhere on your server 
	upload.mv('./uploads/' + upload.name, (err) => {
		if (err) {
			//res.status(500).send(err)
			console.log('something went wrong')
		}
		else {
			var pyshell = new PythonShell(pythonScriptPath)

			pyshell.on('message', function (message) {
				// received result sent from the Python script
				app.locals.result = message
				res.redirect('/')
			})

			// end the input stream and allow the process to exit
			pyshell.end(function (err) {
				if (err){
					throw err
				}
			})
		}
	})
})

app.listen(process.env.PORT || 3000)