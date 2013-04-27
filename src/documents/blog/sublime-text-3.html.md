---
layout: blogPost
blogDate: 2013-02-25 00:03
blogExcerpt: "Emmet now supports Sublime Text 3 beta! "
title: Sublime Text 3 support
---
Emmet now supports [Sublime Text 3](http://www.sublimetext.com/3) beta! 

How to install:

The preferred way to install Emmet is to use [Package Control](http://wbond.net/sublime_packages/package_control): 

1. Open Command Palette in Sublime Text
2. Pick “Install Package” command
3. Find and install “Emmet” plugin

Or install it manually:

1. Quit ST3.
2. Clone [plugin repo](https://github.com/sergeche/emmet-sublime/) or [download](https://github.com/sergeche/emmet-sublime/archive/master.zip) and unpack plugin into `Packages` folder of ST3.
3. Start editor.

The plugin will automatically download and install PyV8 binary for OS. The PyV8 is required to run Emmet (written in JavaScript) as Sublime Text plugin (should be written in Python). If it doesn’t happen or you experience issues, try to [install it manually](https://github.com/emmetio/pyv8-binaries).