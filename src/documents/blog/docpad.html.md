---
layout: blogPost
blogDate: 2013-02-01 00:02
blogExcerpt: "Continue to introduce my open-source tools, created during Emmet development. Last time it was CodeMirror Movie and this time I’ll introduce you the process of creating a documentation web-site with DocPad."
title: Create professional websites with DocPad
---
Continue to introduce my open-source tools, created during Emmet development. Last time it was [CodeMirror Movie](/blog/codemirror-movie/) and this time I’ll introduce you the process of creating a [documentation web-site](http://docs.emmet.io) with DocPad.

---

[DocPad](https://docpad.org) is a static website generator written in CoffeeScript. Unlike web-sites created with regular CMS like Django, Drupal and Wordpress, static websites consume very little of server resources as these are a set of simple pre-generated HTML files. That is, you need web server like Apache or nginx only to serve such website.

It was an ideal solution for [Emmet documentation](http://docs.emmet.io) ([source code](https://github.com/emmetio/emmet-docs)) website since it not only provides a simplified development process, but allows me to reduce my hosting costs greatly.

But DocPad, like many other generators, has a several disadvantages, which does not allows to create a truly professional and fast web-sites. So I decided to fix them by writing a few plug-ins:

* [docpad-plugin-menu](https://github.com/sergeche/docpad-plugin-menu) - Automatic web-site menu generation.
* [grunt-frontend](https://github.com/sergeche/grunt-frontend) - “smart” front-end assets builder.
* [docpad-plugin-frontend](https://github.com/sergeche/docpad-plugin-frontend) - outputs CSS and JS files, builded  with `grunt-frontend`, with proper correct caching, and provides assets management across templates.

If you are not familiar with DocPad, I recommend you see and read [Introduction to DocPad](https://docpad.org/docs/intro) to better understand what I’m going to talk about.

## Menu generation

The [docpad-plugin-menu](https://github.com/sergeche/docpad-plugin-menu) can generate a structured menu for all documents of your website (that is, for all the files in `src/documents` folder). This plugin adds a `generateMenu(url)` method to the `templateData` object: the context object of all templates rendering. This method takes the URL of the page for which the menu should be generated and returns a menu object, which can be rendered, for example, using [partials](https://github.com/docpad/docpad-plugin-partials/).

For further information about the plugin and usage examples visit [project’s main page](https://github.com/sergeche/docpad-plugin-menu#readme).

## Building front-end assets

For convenience, during development I split-up my CSS and JS into several files, which are concatenated and minified for production web-site. It’s a common practice for high-performance websites development. For building, I’m using [Grunt.js](http://gruntjs.com) which seem to have all the required plug-ins for concatenation and minification.

But I didn’t found anything suitable there. The problem is that minified file’s *modification date* is very important to me since I’m going to use it file’s URL to effectively reset file cache. Therefore the destination file should be updated only if any of the source files did.

To solve this problem, I wrote the [grunt-frontend](https://github.com/sergeche/grunt-frontend) plugin. Here’s how it works. During concatenation and minification of source files, it writes files list and their md5 hashes into a special `.build-catalog.json` file. On next build plugin compares saved file list state with the original one and if nothing changed, it doesn‘t update the destination file.

This not only reduces the build time, but also allows you to save important data of destination file such as modification date and md5 hash. This data is stored in `.build-catalog.json` (it’s better to keep this file out of version control) and can be read by third-party apps.

The `grunt-frontend` plugin uses Yandex’s [CSSO](https://github.com/css/csso) with automatic `@import`s inlining and [UglifyJS](https://github.com/mishoo/UglifyJS) for minification.

For more info visit plugin’s [project page](https://github.com/sergeche/grunt-frontend).

## Assets management

Very often there is a need to manage collections of CSS and JS files on different pages of your website. For example, you want all pages to use a `set1` files collection; all pages of `/about/` section must additionally use `set2` and `set3` collections, but for the  `/about/contacts/` page you want to use `set4` instead of `set2` (i.e. `set1`, `set4`, `set3`, in exactly that order). Additionally, each resource URL must contain file’s last modification date for effective cache resetting.

I wrote a [docpad-plugin-frontend](https://github.com/sergeche/docpad-plugin-frontend) for assets management. It adds `assets(prefix)` method to `templateData`, which allows you to get a sorted list of assets from the current document and its templates chain. If the project root folder contains `.build-catalog.json`, the plugin reads it and returns a list of resource URLs prefixed with a modification date.

For example, the problem with resource management described above can be solved as follows. In meta-data of `default.html.eco` template specify the primary files collection:

    ---
    js: "/js/fileA.js"
    ---

For `about.html.eco` template, which is inherited from the default template and used by documents of `/about/*` section, define the following:

    ---
    layout: default
    js2: ["/js/fileB.js", "/js/fileC.js"]
    js3: ["/js/fileD.js", "/js/fileE.js"]
    ---

In `/about/contacts/index.html` document, override `js2` collection:

    ---
    layout: about
    js2: "/js/contacts.js"
    ---

Now, during `/about/contacts/index.html` document rendering, the `assets('js')` method call will return the following collection of files:

* `/js/fileA.js`
* `/js/contacts.js`
* `/js/fileD.js`
* `/js/fileE.js`

As you can see, plugin usage is pretty simple: come up with a prefix for resource category and use numeric suffixes to define collections of files. Then, call the `assets()` method with category prefix inside templates to get sorted list of files. Collections with the same name are overridden.

For more info about how to use plugin visit [project’s home page](https://github.com/sergeche/docpad-plugin-frontend#readme).

## Debug Mode

Very often, users of your website may send you error reports: a JavaScript or CSS layout problems in specific web-browser. But all your CSS and JS files are minified and it’s pretty hard to track the problem source.

In the future, you can track issues using [Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/), but currently not every minifier and web-browsers supports them.

The `docpad-plugin-frontend` has a special debugging mode. Since the structure of minified files is stored in the JSON catalog, we can easily extract source files and use them instead on minified ones when necessary.

To do this, you can create a separate DocPad _environment_ with `frontendDebug: true` option. When `frontendDebug` option is set to `true`, the `assets()` method will try to return list of corresponding source files found in `.build-catalog.json`.Here’s example `docpad.coffee` config with debug environment:

    module.exports = {
        ...
        environments:
            debug:
                frontendDebug: true
    }

Now if you run `DocPad` with `debug` environment, you get a HTML-page with the original CSS and JS files so you can spot errors:

    docpad run --env​​=debug

## Automatically deploy from GitHub

I’ve set-up my server so it can automatically re-generate a full website after each commit into `master` branch of [project’s GitHub repo](https://github.com/emmetio/emmet-docs).

On GitHub I’ve set up a custom web hook and Gith on my server.

[Gith](http://weblog.bocoup.com/introducing-gith-github-webhooks-for-node/) is a convenient Node.JS web server which is able to receive and filter payload coming from GitHub web hooks. My Gith server script that deploys website looks like this:

    var childProc = require('child_process');
    var path = require('path');
    
    var gith = require('gith').create(3000);
    
    gith({
        // Listen to the hooks from "master" branch only
        branch: 'master'
    }).on('all', function(payload) {
        console.log('Run deply script on', new Date());
    
        // Run deploy script
        var deploy = childProc.spawn('sh', ['/web/deploy.sh']);
    
        deploy.stdout.on('data', function(data) {
            var message = data.toString('utf8');
    
            if (~message.indexOf('subscribe')) {
                // Docpad may ask for newsletter subscription, say "no"
                deploy.stdin.write('n');
            } else if (~message.toLowerCase().indexOf('privacy')) {
                // Docpad may ask about privacy policy, agree with it
                deploy.stdin.write('y');
            }
        });
    
        deploy.stderr.on('data', function(data) {
            console.log('Error: ', data.toString('utf8'));
        });
    
        deploy.on('exit', function(code) {
            console.log('Deploy complete with exit code ' + code);
        });
    });

The `deploy.sh` script looks like this:

    #! /usr/bin/env bash
    git pull
    git submodule foreach 'git checkout master && git pull origin master'
    npm install
    grunt
    docpad generate
    find ./out -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \)  -exec sh -c "gzip -7 -f < {} > {}.gz" \;

## Configuring nginx

As a web server, I use [nginx](http://nginx.org), which is highly optimized for static files serving. In website config, we need to specify the following:

* Rewrite paths for static files: remove the timestamp prefix from URL and send the correct caching headers.
* Serve static files gzipped to reduce the amount of transferred data.

If you take a closer look at the `deploy.sh` script, you’ll see that in the last step we are creating a gzipped versions of HTML, CSS and JS files. There is a special nginx [HttpGzipStaticModule](http://wiki.nginx.org/HttpGzipStaticModule) which can serve a precompressed `.gz` file (if it exists at the same location) instead of compressing it for each request. This trick allows us to save CPU resources. To use this module, you must add it to nginx at compile time:

    ./configure --with-http_gzip_static_module

My nginx config looks like this:

    server {
        server_name  your-server.com;
        root         /path/to/web-site/out;
    
        index  index.html index.htm;
    
        # trim modification date from resource URL
        location ~* ^/\d+/(css|js)/ {
            rewrite ^/(\d+)/(.*)$ /$2;
        }
    
        # cache front-end assets
        location ~* \.(ico|css|js|gif|jpe?g|png)$ {
            expires max;
            access_log off;
            add_header Pragma public;
            add_header Cache-Control "public";
        }
    
        # enable precompressed .gz files serving
        gzip_static on;
    }

## tl;dr - Tools to make a professional high-performance website with DocPad

* Use [docpad-plugin-menu](https://github.com/sergeche/docpad-plugin-menu) for automatic menu generation for your website.
* Use [grunt-frontend](https://github.com/sergeche/grunt-frontend) and [docpad-plugin-frontend](https://github.com/sergeche/docpad-plugin-frontend) to minify CSS and JS files and cache them properly.
* Create a special debugging environment for `docpad-plugin-frontend` to use source CSS and JS files instead of minified ones.
* Set up a web hooks on GitHub and [Gith](http://weblog.bocoup.com/introducing-gith-github-webhooks-for-node/) on your server to automatically deploy website after each commit.
* Setting up nginx to properly cache static files and save CPU resources.