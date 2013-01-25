---
layout: page
title: Emmet v1.0 is out
---
I’m happy to announce that after more than six months of development the [Emmet](http://emmet.io) (formerly Zen Coding) v1.0 is officially released. Maybe you’ve already used Emmet for months, but only now, after numerous bug fixes and improvements, I can say that it works as expected.

What has been changed since the Zen Coding?

At first, the project name has been changed. “Emmet” is gonna be brand name for new tools and not all of them will be related to “coding”.

Secondly, the project has received [official web-site](http://emmet.io) and [extensive documentation](http://docs.emmet.io) about all available features.

Thirdly, improved CSS support: you can write property values [directly in the abbreviation](http://docs.emmet.io/css-abbreviations/), [create gradients](http://docs.emmet.io/css-abbreviations/gradients/) and [vendor-prefixed properties](http://docs.emmet.io/css-abbreviations/vendor-prefixes/). Also, user’s reports about lengthy and hard-to-remember CSS abbreviations were considered and now Emmet utilizes [fuzzy search](http://docs.emmet.io/css-abbreviations/fuzzy-search/) for CSS abbreviations.

Here is a list of other significant changes:

* The project’s code base was rewritten from scratch. It has become more modular and extensible.
* The Python version was discarded. I found it quite difficult to maintain two versions of the core. Instead, Emmet uses bridges for [Python](https://github.com/sergeche/emmet-sublime/tree/master/emmet), [Objective-C](https://github.com/emmetio/emmet- objc) and [Java](https://github.com/emmetio/emmet-eclipse), which allow to fix bugs and add new features for all platforms very quickly.
* Improved [implicit tag name resolver](http://docs.emmet.io/abbreviations/implicit-names/). Previously, if you tried to expand abbreviations like `.item`, you could receive either `<div class="item">`, or `<span class="item">`, depending on the parent tag. The resolver is now looking at a parent tag’s name and can produce, for example, `<li>`, `<td>`, `<option>`.
* [Extensions support](http://docs.emmet.io/customization/). Now, to add a new abbreviation or customize the output format, there’s no need to dig into the plugin code, you just have to create simple JSON files in a special folder.
* [“Lorem Ipsum” generator](http://docs.emmet.io/abbreviations/lorem-ipsum/). Previously, to get a “dummy” text for the web-site, you had to use third-party services to generate “dummy” text and then format it. Now you can get it right in your text editor, and you can control the number of generated words by simply appending a number after the abbreviation. Moreover, the generator uses all Emmet abbreviations features, allowing you to add attributes to the generated elements and control the number of created blocks.
* [New `^` operator](http://docs.emmet.io/abbreviations/syntax/#climb-up-). Despite the fact that there is a more powerful [grouping operator](http://docs.emmet.io/abbreviations/syntax/#grouping-), often it takes too much time to update abbreviation with braces to output the next element one level up. Now it is sufficient to write the `^` operator to output next element one level up the tree.

The project source code and plug-ins are available in [special repository](https://github.com/emmetio). If you find any errors or have suggestions for improvement, please [let me know](https://github.com/emmetio/emmet/issues).