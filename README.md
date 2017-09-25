# HeavenScroll
> Heaven scroll provides an InfinateScroll with amazing performance and experiance improvements

## Pre-requisites
Install the package dependencies by running the following command
```bash
npm install
```

## Development
```
npm run start
```

Then view this project at http://localhost:8080

## Demo
To create a packagable demo, use the following command.
```bash
npm run build
```

This will create a demo project in the dist folder

## Publishing
```
NODE_ENV=production npm run build
npm publish
```

## How to use

## Install plugin

```
npm install jquery-heaven-scroll
```

This plugin requires some information to be passed to it in order to work.

### Option 1 using arguments values (will overwrite option 2 values)

One way to send this information is passing an array as argument to the method, like:

```
/**
 * Returns html to be written inside .pageSingle
 * -
 * div that holds .pageSingle must have a data atrribuite of data-page-number that has value of options.pageNumber
 * - 
 * function deals with receiving a single page, or an array of pages to add 
 * -
 * @param {object} options
 * @param {string} options.pageClassName
 * @param {integer|array} options.pageNumber
 * @param {function} cb
 */
function productTileFetcher(options, cb) {
	// (...)
}

var $pagesContainer = $('.your-selector-classname');

$pagesContainer.heavenScroll({
		fadeInValue: 1500, // page fade in duration
		maxPagesNumber: 3, // maximum number of pages shown
		pageHeight: 1584, // page height
		startPage: 1, // page to start (gets overwritten if url has query parameter)
		endPage: 10,
		pageClassName: 'pageSingle', // page class
		urlQueryParamName: 'startPage', // page to start url query parameter name
		loadPageFunction: productTileFetcher,  // function that returns the html to be shown
		spinnerClassName: 'Spinner', // default class name 'Spinner'
		throttleValue: 100, // default throttle value
		debugMode: true // enable debugMode for loading a page information, it's default value is `false`
    });
```

NOTE: the `loadPageFunction` value must be passed in option 1.

### Option 2 using data attributes values

Another way to send this information is by using data-attributes in the `$pagesContainer` element, like:

```
<div class="pagesContainer"
	 data-max-pages="3"
	 data-page-height="1584"
	 data-start-page="1"
	 data-end-page="10"
	 data-page-class-name="pageSingle"
	 data-url-query-param-name="startPage"
	 data-throttle-value="100">
</div>
```

## NOTE: For an example check the `demo` folder