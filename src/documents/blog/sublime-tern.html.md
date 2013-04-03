---
layout: blogPost
blogDate: 2013-04-03 00:00
blogExcerpt: "Intelligent JavaScript editing in Sublime Text"
title: TernJS plugin for Sublime Text
---
As [Credits](/credits/) page says, Emmet is going to be a brand name for tools for web-developers. And today I want you to present a new tool: [*Sublime Tern*](https://github.com/emmetio/sublime-tern).

## What is TernJS?

[TernJS](http://ternjs.net) is a JavaScript inferring engine written by [Marijn Haverbeke](http://marijnhaverbeke.nl). Basically, it can trace context object in JavaScript and give you some info about it: its type, available properties, definition and so on. It can provide you with great advantages while editing JavaScript code: correct code completions, basic refactoring (like variable renaming) and location of object definition. Also, it’s written in JavaScript and it can be extended.

Usually, features like valid code completions and variable renaming are available in big IDEs like Eclipse and WebStorm, but now they are coming into your favourite editor with *Sublime Tern* plugin!

## How to install

Sublime Tern can be installed as any other plugin with [Package Control](http://wbond.net/sublime_packages/package_control):

1. In ST editor, call “Install Package” command from Command Palette.
2. Find “TernJS” in plugins list and hit Enter to install it.

When installed, Sublime Tern will automatically download PyV8 binary required to run this plugin. If you experience issues with PyV8 loader, you can [install it manually](https://github.com/emmetio/pyv8-binaries#readme).

*Warning*: if you have [Emmet](https://github.com/sergeche/emmet-sublime) plugin installed (and you really should :-) and using Sublime Text 2, you have to make sure you have the latest PyV8 binary. It must be automatically updated within 24 hours (you need to restart ST2 editor), but you can forcibly update it:

1. Quit ST2 editor
2. Completely remove `PyV8` package (remove this folder from ST2’s `Packages` folder)
3. Start ST2 editor. Latest PyV8 should be downloaded and installed automatically.

With old PyV8 binary, you’ll experience a lot of crashes.

## How to use it

You should keep in mind a few things before using *Sublime Tern* plugin.

### Projects first

To get most of Sublime Tern plugin, you should edit your files inside [Project](http://www.sublimetext.com/docs/2/projects.html). When you open a JavaScript file in ST editor, plugin automatically detects project for it and loads *all JS files* from it for code completion (read “Configuring Project” section below to alter this behaviour).

Otherwise, if you’re editing file outside project, code completion and other actions will work for this file only.

### Slow start

When you open JS file from project for the first time, you may experience editor slow down, especially for large projects. It’s because Sublime Tern plugin loads and analyses JS files from your project so you have to wait a bit.

Also, you may receive a “slow plugin” warning in Sublime Text 2: you can either skip it or [disable this warning](http://www.sublimetext.com/forum/viewtopic.php?f=3&t=5527).

### Reload TernJS

If you create or update files outside ST editor, or you believe that TernJS doesn’t contains most recent version of your project files, you can force Sublime Tern plugin to update it’s state. Simply call **“TernJS: Reload”** action from Command Palette to re-initialize TernJS servers.

## Available actions

* **Code Completions**. Press `Ctrl+Space` to show completions for current context. They can also appear automatically, depending on your ST preferences.
* **Jump to definition**: goes to file and position where context variable/function in defined.
* **Rename variable**: marks context object occurrences and allows you to rename them. Press `Enter` or `Esc` to commit changes.
* **Reload**: reloads all JS files from project. Use this action if your files were changed outside ST editor.

All actions are available in ST’s Command Palette and have no default keyboard shortcuts. You can [define them by your own](http://docs.sublimetext.info/en/latest/customization/key_bindings.html), valid command names are `ternjs_jump_to_definition`, `ternjs_rename_variable`, `ternjs_reload`.

## Configuring project

By default, Sublime Tern loads all JS from your project folder and provides completions for standard ECMA5 objects like `String`, `Array` etc. If you want to load specific files only or have completions for browser objects or jQuery, you need to *configure project* first.

In Sublime Text, projects are defined by simple JSON file with `.sublime-project` extension. You can add `ternjs` section into `.sublime-project` file to set-up TernJS for your project. 

The example project file with TernJS config may look like this:

```json
{
	…
	
	"ternjs": {
		"exclude": ["wordpress/**", "node_modules/**"],
		"libs": ["browser", "jquery"],
		"plugins": {
			"requirejs": {
				"baseURL": "./js"
			}
		}

	}
}
```

Available options:

* `include` and `exclude` are glob patterns for files that should be analysed by TernJS. By default, plugin loads all JS files from project folder (equals to `"include": ["**/*.js"]`). With these options, you can narrow down file list that should be analysed by TernJS which speeds-up overall plugin performance and gives you less noise for completions.
* `libs`: array of static type descriptions. These are JSON files with types structure that can be cheaply loaded by TernJS for code completions. See [list of predefined descriptions](https://github.com/emmetio/sublime-tern/tree/master/ternjs/defs). You can also specify a path (either relative to current project or absolute) to your custom JSON files.
* `plugins`: set of plugins for TernJS instance. Plugins can extend inferring engine and provide completions for some complex situations, for example, to resolve Require.JS or Node.JS modules. See [list of redefined plugins](https://github.com/emmetio/sublime-tern/tree/master/ternjs/plugin). For custom plugins, add `pluginPath` property into your plugin config with path to plugin folder.

## Known issues

Sometimes, especially on complex libraries like jQuery or Underscore.js, you may experience heavy slowdowns or even crashes. Check ST console for possible errors. If you see something like this:

```
RangeError: Maximum call stack size exceeded ( js/infer.js @ 43 : 21 )
```

…you should:

1. Report to [main TernJS repo](https://github.com/marijnh/tern) ([like so](https://github.com/marijnh/tern/issues/16)).
2. Exclude this file(s) from project config with `include` and `exclude` preferences (see “Configuring Project” section above).


---

Please note that Sublime Tern (as TernJS itself) is in early beta stage and may not work properly or even crash your editor. If you experience issues with code completions or crashes, you should report directly to [main TernJS repo](https://github.com/marijnh/tern/issues) or [Sublime Tern plugin repo](https://github.com/emmetio/sublime-tern/issues).