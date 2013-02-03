exec = require('child_process').exec
hljs = require './plugins/highlight.js'

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

daySuffix = (d) ->
    d += '';
    s = ["th", "st", "nd", "rd", "th"]
    last = d.substr(-Math.min(d.length, 2))
    if last > 3 and last < 21 then "th" else s[Math.min(Number(d) % 10, 4)]

parseBlogDate = (date) ->
	m = (date or '').match /^(\d{4})\-(\d{2})-(\d{2})/
	if m
		return new Date(+m[1], +m[2] - 1, m[3])

docpadConfig = {
	templateData:
		site:
			author: "Sergey Chikuyonok"
			email: "info@emmet.io"
			title: "Emmet"
			description: "Emmet — the essential toolkit for web-developers"
			url: "http://emmet.io"

		blogPosts: () ->
			@getCollection('posts').toJSON().map (item) =>
				item.blogDate = parseBlogDate(item.blogDate)
				if item.blogDate
					item.blogDateText = @formatBlogDate(item.blogDate)
				item.blogUrl = item.url.replace /\.html$/, '/'
				item


		formatBlogDate: (date) ->
			d = date.getDate()
			day = "#{d}<sup>#{daySuffix(d)}</sup>"
			month = months[date.getMonth()]
			year = if (new Date).getFullYear() isnt date.getFullYear() then ", #{m[1]}" else ''
			"#{month} #{day}#{year}"

		nextBlogPost: (url) ->
			posts = @blogPosts()
			ix = -1
			for i, post of posts
				if post.url is url
					ix = +i
					break

			if ix > 0
				return posts[ix - 1]

		prevBlogPost: (url) ->
			posts = @blogPosts()
			ix = -1
			for i, post of posts
				if post.url is url
					ix = +i
					break

			if ix isnt -1 and ix < posts.length - 1
				return posts[ix + 1]


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
				req.url = req.url.replace(/\/$/, '') + '.html'
				next()
}

module.exports = docpadConfig