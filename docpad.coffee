path = require 'path'
safeps = require 'safeps'
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
	gulpArgs: ['html']
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
			if typeof date is 'string'
				date = parseBlogDate(date)
			d = date.getDate()
			day = "#{d}<sup>#{daySuffix(d)}</sup>"
			month = months[date.getMonth()]
			year = if (new Date).getFullYear() isnt date.getFullYear() then ", #{date.getFullYear()}" else ''
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
		production:
			gulpArgs: ['full', '--production']

	collections:
		posts: (database) ->
			database.findAllLive({url: {$startsWith: '/blog/', $ne: '/blog/index.html'}}, [blogDate: -1])

	events:
		# Extend server so it can respond to cache-reset assets
		# and blog posts
		serverAfter: ({server}) ->
			reCache = /^\/-\/.+?\//
			server.get reCache, (req, res, next) ->
				req.url = req.url.replace reCache, '/'
				next()

			server.get /^\/blog\/([\w\-]+)\/?$/, (req, res, next) ->
				req.url = req.url.replace(/\/$/, '') + '.html'
				next()

		writeAfter: (opts, next) ->
			config = @docpad.getConfig()
			rootPath = config.rootPath
			gulpPath = path.join(rootPath, 'node_modules', '.bin', 'gulp')
			command = [gulpPath].concat(config.gulpArgs or [])

			safeps.spawn(command, {cwd: rootPath, output: true}, next)
			@
}

module.exports = docpadConfig