---
layout: page
blogDate: 2013-02-01 00:01
title: CodeMirror Movie
---
During Emmet project development, I’ve created a few open-source tools and I’d like to introduce them to you.

The first thing I would like to introduce to you is a [CodeMirror Movie](https://github.com/sergeche/codemirror-movie). You can see it in many pages of [documentation web-site](http://docs.emmet.io): it is the plugin that shows interactive code demos.

When I started working on the documentation, I wanted to demonstrate all Emmet features in a more descriptive manner. Reading long texts describing how actions work is always boring and tedious, it is much nicer to see “live” how they works.

Usually, developers are recording videos with demos, but it’s not my case for many reasons:

* Recording a *high-quality* video takes too much time. For example, it took me about four hours to create a [six-minute video about Zen Coding v0.5](https://vimeo.com/7405114).
* The video is hard to update. For example, if someone finds errors  or users will not understand how action works, it’s likely required to create a new movie.
* Because Emmet is written in pure JavaScript (and hence works in web browsers), I wanted users to not only *see* how things work, but *try* them in action right in documentation pages.

To solve these and other problems, and I’ve created [CodeMirror Movie](https://github.com/sergeche/codemirror-movie) plugin. It’s pretty easy to use it: you create a small *script*, which defines what should be done by plugin. For example, ”write the text, wait a moment, and then show the tooltip on current caret position”.

As you can guess from the plugin name, it is based on amazing [CodeMirror](http://codemirror.net) editor, which means that you can create demos for any programming language supported by this editor.

## Creating a movie

Usually, to create CodeMirror editor instance you create a `<textarea>` element with the initial contents of the editor and call the following JS code:

```javascript
var myCodeMirror = CodeMirror.fromTextArea(myTextArea);
```

To create a movie, you need create a `<textarea>` too with initial contents and *movie scenario*, separated by `@@@` line:

```html
<textarea id="code">
&lt;div class="content"&gt;
    |
&lt;/div&gt;
@@@
type: Hello world
wait: 1000
tooltip: Sample tooltip
</textarea>
```

To initialize the movie, you should call `CodeMirror.movie()` method and pass `<textarea>` ID (or element reference) as the first argument:

```javascript
var movie = CodeMirror.movie('code');

// start playback
movie.play();
```

## Movie scenario

As noted above, to create a movie you need to write its *scenario*.

A scenario is a *list* of commands to be executed. Each command is written on a separate line in the `name: value` form. The value cam be written as JS object with command options, but each command has a pretty good default values so you can pass just a string value of the most important option. For example, the following scenario tells CodeMirror Movie to type “Hello world”, then wait for a second and show “CodeMirror rocks!” tooltip:

type: Hello world
wait: 1000
tooltip: CodeMirror rocks!


For more info about all available scenario commands and examples visit [plugin page](https://github.com/sergeche/codemirror-movie). You can use this plugin whatever you like (MIT license). It looks especially great in JS-based presentation engines like [impress.js](http://bartaz.github.com/impress.js/) or [reveal.js](http://lab.hakim.se/reveal-js/). I hope you enjoy it!