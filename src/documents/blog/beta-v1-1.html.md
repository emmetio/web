---
layout: blogPost
blogDate: 2013-12-23 20:00
blogExcerpt: "Beta version of Emmet v1.1 is available for Sublime Text users"
title: Beta version of Emmet v1.1
---
I’m happy to announce that first big update of Emmet is on its way! And it’s available for Sublime Text users as open beta.

## How to install:
1. Remove current Emmet package from Package Control.
2. Quit Sublime Text editor.
2. Clone [plugin repo](https://github.com/sergeche/emmet-sublime/) and switch to `v1.1` branch: `git checkout v1.1`. Or simply [download](https://github.com/sergeche/emmet-sublime/archive/v1.1.zip) and unpack plugin into `Packages` folder of Sublime Text.
3. Start editor.

## New features of v1.1
* **Support of [Can I Use](http://caniuse.com) database.** All CSS abbreviations are resolved against “Can I Use” database to provide vendor-prefixed properties. By default, Emmet uses *previous 2 versions* of *all* browsers, but you can tweak this behavior with `caniuse.era` and `caniuse.vendors` preferences. See [module header](https://github.com/emmetio/emmet/blob/umd/lib/assets/caniuse.js#L19) for description.
* **Full LESS and SCSS support.** Actions like [Toggle Comment](http://docs.emmet.io/actions/toggle-comment/), [Update Image Size](http://docs.emmet.io/actions/update-image-size/), [Select Item](http://docs.emmet.io/actions/select-item/) and so on are now working with LESS and SCSS (not SASS) syntaxes.
* **Slim and Jade output syntaxes support.** You can use the very same Emmet abbreviations to generate Slim and Jade content.
* **Updated CSS Gradient generator** supports W3C syntax specs, Can I Use database and multiple definitions (e.g. you can now expand `lg(red, black), lg(yellow, blue)`).
* **Boolean attributes.** You can now write boolean attributes (attributes with the same name and value) a bit shorter by placing dot after attribute name, like so: `inp[checked.]` → `<input type="text" checked="checked" />` or `<input type="text" checked />`, depending on your output profile. Some attributes are globally defined as boolean (for example, `contenteditable`) so you don’t have to place dot after them. See [module header](https://github.com/emmetio/emmet/blob/umd/lib/assets/profile.js#L17) for more info.
* **Implied attributes.** Some HTML tags are useless without their required attributes, for example, `<img>` tag without `src` attribute. Instead of writing `img[src=image.png]`, you can use shorter syntax: `img[image.png]`. *Every invalid attribute name will be treated as a value for empty attribute*. You can also wrap default attribute value in quotes, like so: `img['my image.png']`.
* **Default attributes.** Pretty much the same as *implied attributes* feature, but allows you to output specific attributes only if default value is provided. For example, `script` will produce `<script></script>`, but `script[jquery.js]` results to `<script src="jquery.js"></script>`. Default attributes are used in abbreviation definitions in [snippets.json](https://github.com/emmetio/emmet/blob/umd/lib/snippets.json#L666).
* **New “Update Tag” action** allows you to easily update any existing HTML tag with Emmet abbreviation. For example, if you have `<div class="c1">` element, place caret on it, run “Update Tag” action (Ctrl+Shift+U) and enter `.+c2[title=Hello]` to update tag to `<div class="c1 c2" title="Hello">`. This action uses additional syntax to *overwrite*, *modify* or *remove* attribute. By default, all attributes in abbreviation will overwrite existing ones. Precede attribute or class name with `+` to *append* value, add `-` before attribute or class name to *remove* it. More docs and examples will be available later.
* **“Match Tag Pair” was renamed to “Balance”** and now works with CSS. You can quickly select property value, full property or selector content.
* **Option to write CSS abbreviations on single line**: in `syntaxProfiles.json`, set CSS’ output profile to `css_line`. [Read docs](http://docs.emmet.io/customization/syntax-profiles/) about output profiles.
* **New syntax to write RGBA colors.** You can add `.N` after color value in CSS abbreviation to produce RGBA color: `c#dca.7` will produce `color: rgba(221, 204, 170, 0.7)`.

### Under the hood
* Emmet is now fully Node.JS-compliant. You can use Emmet in your own packages (npm package will be available later).
* Huge performance boost on many actions, especially in interactive actions (Wrap With Abbreviation, Expand as you type) on large documents.
* Many other bugfixes and improvements.

If you experience any issues with beta, please [fill an issue](https://github.com/emmetio/emmet/issues), but read [CONTRIBUTING](https://github.com/sergeche/emmet-sublime/blob/v1.1/CONTRIBUTING.md) file first, especially about keyboard shortcuts.

