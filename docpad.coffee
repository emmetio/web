exec = require('child_process').exec
hljs = require './plugins/highlight.js'

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

daySuffix = (d) ->
    d += '';
    s = ["th", "st", "nd", "rd", "th"]
    last = d.substr(-Math.min(d.length, 2))
    if last > 3 and last < 21 then "th" else s[Math.min(Number(d) % 10, 4)]

docpadConfig = {
	templateData:
		site:
			author: "Sergey Chikuyonok"
			name: "Emmet Main Web-site"

		blogPosts: () ->
			@getCollection('posts').toJSON().map (item) =>
				item.blogDateText = @blogDate(item.blogDate)
				item.url = item.url.replace /\.html$/, '/'
				item


		blogDate: (date) ->
			m = date.match /^(\d{4})\-(\d{2})-(\d{2})/
			if m
				day = parseInt(m[3], 10) + "<sup>#{daySuffix(m[3])}</sup>"
				month = months[+m[2] - 1]
				year = if (new Date).getFullYear() isnt +m[1] then ", #{m[1]}" else ''

				return "#{month} #{day}#{year}"

			return date


	plugins:
		marked:
			markedOptions:
				sanitize: false
				highlight: (text, lang) ->
					try
						result = if lang then hljs.highlight(lang, text) else hljs.highlightAuto(text)
						"<span class=\"#{result.language}\">#{result.value}</span>"
					catch e
						return text					

	environments:
		debug:
			# Enable debug mode for frontend-assets plugin:
			# generates files with '-debug' suffix with
			# assets sources
			frontendDebug: true

	collections:
		posts: (database) ->
			database.findAllLive({url: {$startsWith: '/blog/', $ne: '/blog/index.html'}}, [blogDate: -1])

	events:
		# Regenerate assets each time resources are changed
		generateBefore: (opts, next) ->
			# do not re-buid assets in debug mode, save resources
			if @docpad.getConfig().frontendDebug
				return next()

			proc = exec 'grunt', {cwd: process.cwd()}, (error, stdout, stderr) ->
				console.log stdout
				process.exit() if error

			proc.on 'exit', next

		# Extend server so it can respond to cache-reset assets
		serverAfter: ({server}) ->
			server.get /^\/\d+\/(c|j)\//, (req, res, next) ->
				req.url = req.url.replace /^\/\d+\//, '/'
				next()

			server.get /^\/blog\/([\w\-]+)\/?$/, (req, res, next) ->
				console.log 'Rewite to ' + req.url.replace(/\/$/, '') + '.html'
				req.url = req.url.replace(/\/$/, '') + '.html'
				next()
}

module.exports = docpadConfig