// $(function () {
// 	var $window = $(window);
// 	var $document = $(document);
// 	var $pagesSpacer = $('.pagesSpacer');
// 	var $pagesContainer = $('.pagesContainer');
// 	var $pages = $('.pageSingle');
// 	var $header = $('.header');

// 	var html;
// 	var maxPageNumber = $pagesContainer.data('maxPages');
// 	var currentPage;
// 	var pageCount = 0;
// 	var pageHeight;
// 	var screenHeight = $window.height();
// 	var pagePlaceholder = $header.height();
// 	var scrollValue;
// 	var prevScroll = 0;
// 	var firstRun = true;
// 	var pagesViewport;
// 	var pagesObjHeight;
// 	var nextPageTriggerHeight;
// 	var prevPageTriggerHeight;
// 	var pagesCurrentHeight;
// 	var deletedPages = 0;
// 	var startPage = 'startPage';
// 	var urlStartUp = false;

// 	var scrollAmount = {up: 0, down: 0};

// 	function loadPage(position, printPageNumber) {
// 		html = '<div class="pageSingle">' + printPageNumber + '</div>';
// 		if (position === 'ini') {
// 			$pagesContainer.prepend(html);
// 		} else if (position === 'end') {
// 			$pagesContainer.append(html);
// 		}
// 		$pages = $('.pageSingle');
// 	}

// 	function loadNextPage() {
// 		if (pagesViewport > nextPageTriggerHeight) {
// 			pageCount++;
// 			$('.pageCountValue').text(pageCount);
// 			loadPage('end', pageCount);
// 		}
// 	}

// 	function loadPrevPage() {
// 		if ((pagesViewport < prevPageTriggerHeight) && (deletedPages > 0)) {
// 			loadPage('ini', (currentPage - 1));
// 			deletedPages--;
// 			$('.deletedPageValue').text(deletedPages);
// 			$pagesSpacer.height(deletedPages * pageHeight);
// 		}
// 	}

// 	function removePage(position) {
// 		if (position === 'first') {
			
// 			$pages.splice(0,1);
// 			$('.pageSingle:first-child').remove();
// 			deletedPages++;
// 			$('.deletedPageValue').text(deletedPages);
// 			$pagesSpacer.height(deletedPages * pageHeight);
// 		} else if (position === 'last') {
// 			$pages.splice($pages.lengths-1,1);
// 			$('.pageSingle:last-child').remove();
// 			pageCount--;
// 			$('.pageCountValue').text(pageCount);
// 		}
// 	}

// 	function currentPageControl(direction) {
// 		if (direction === 'down') {
// 			if (pagesViewport > pagesCurrentHeight) {
// 				currentPage++;
// 			}
// 		} else if (direction === 'up') {
// 			if (urlStartUp) {
// 				// first load when the url is used
// 				if ((pagesViewport < prevPageTriggerHeight) && (currentPage > 1)) {
// 					currentPage--;
// 					urlStartUp = false;
// 				}
// 			} else {
// 				if ((pagesViewport < (pagesCurrentHeight - pageHeight * 0.5)) && (currentPage > 1)) {
// 					currentPage--;
// 				}
// 			}
// 		}

// 		$('.currentPageValue').text(currentPage);
// 	}

// 	function scrollingOptions() {
// 		if (prevScroll > scrollValue) { // scroll up
// 			scrollAmount.up = scrollValue;

// 			pagesViewport = pagesViewport + scrollValue;

// 			currentPageControl('up');
// 			loadPrevPage();

// 			if ($pages.length > maxPageNumber) {
// 				removePage('last');
// 			}
// 		} else if ((prevScroll < scrollValue) && (prevScroll !== 0)){ // scroll down
// 			scrollAmount.down = scrollValue;

// 			pagesViewport = pagesViewport + scrollValue;

// 			currentPageControl('down');
// 			loadNextPage();

// 			if ($pages.length > maxPageNumber) {
// 				removePage('first');
// 			}
// 		}
// 	}

// 	function updateValues() {
// 		if (!pageHeight) {
// 			pageHeight = $pages.height();
// 		}
// 		pagesViewport = screenHeight - pagePlaceholder;
// 		pagesObjHeight = pageHeight * pageCount;
// 		pagesCurrentHeight = pageHeight * currentPage;

// 		// screen half way through last visible page
// 		nextPageTriggerHeight = pagesObjHeight - pageHeight / 2;

// 		// screen half way through first visible page
// 		prevPageTriggerHeight = $pagesSpacer.height() + pageHeight * 1.5;
// 	}

// 	function onScroll() {
// 		scrollValue = $document.scrollTop();

// 		// check if the screen is at half size
// 		if (firstRun) {
// 			pageCount++;
// 			loadPage('end', pageCount);
// 			firstRun = false;
// 			updateValues();

// 			if (pagesViewport > (pageHeight / 2)) {
// 				pageCount++;
// 				$('.pageCountValue').text(pageCount);
// 				loadPage('end', pageCount);
// 			}
// 		} else {
// 			updateValues();
// 			scrollingOptions();
// 		}

// 		// for visual aid (do not include)
// 		$('.scrollDownValue').text(scrollAmount.down);
// 		$('.scrollUpValue').text(scrollAmount.up);

// 		prevScroll = scrollValue;
// 	}

// 	function init() {
// 		var arr = $(location)
// 					.attr('href')
// 					.split('?');

// 		if (arr.length === 1) {
// 			currentPage = $pagesContainer.data('startPage');
// 		} else {
// 			urlStartUp = true;

// 			arr[1]
// 				.split('&')
// 				.forEach(function (arg) {
// 					if (arg.indexOf(startPage) !== -1) {
// 						currentPage = parseInt(arg.split('=')[1], 10);
// 					}
// 				});

// 			// don't load the first page normally
// 			firstRun = false;
			
// 			if (currentPage > 1) {
// 				loadPage('end', (currentPage - 1));
// 			}
// 			loadPage('end', currentPage);
// 			pageHeight = $pages.height();

// 			if (currentPage > 1) {
// 				$pagesSpacer.height((currentPage - 1) * pageHeight);
// 			}
			
// 			$('html, body').animate({
// 				scrollTop: ($pagesContainer.offset().top + pageHeight)
// 			}, 0);

// 			pageCount = currentPage;
// 			if (currentPage > 2) {
// 				deletedPages = currentPage - 2;
// 			}

// 			// auxiliarty info
// 			$('.deletedPageValue').text(deletedPages);
// 			$('.pageCountValue').text(pageCount);
// 			$('.currentPageValue').text(currentPage);
// 		}
// 	}

// 	init();
// 	onScroll();
// 	// $(window).on('scroll', _.debounce(onScroll, 50));
// 	$(window).on('scroll', onScroll);
// });

/**
 * jQuery plugin template by https://github.com/publicJorn
 * Features:
 * - dynamic plugin name (only supply once) so it's easy to change later
 * - plugin factory to make it work in the browser, or with AMD / COMMONJS modules
 * - Plugin instance is saved on the selector element
 * - Default options are saved to the instance in case you need to figure out a difference between passed options
 */
(function(global, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function($) {
			return factory($, global, global.document);
		});
	} else if (typeof exports === "object" && exports) {
		module.exports = factory(require('jquery'), global, global.document);
	} else {
		factory(jQuery, global, global.document);
	}
})(typeof window !== 'undefined' ? window : this, function($, window, document, undefined) {
	'use strict';

	// -- Name is used to keep jQUery plugin template portable
	var pluginName = 'HeavenScroll';

	// -- Globals (shared across all plugin instances)
	var defaultOptions = {
		pageHeight: -1,
		maxPagesNumber: -1,
		startPage: -1,
		loadPageFunction: -1
	};

	var $window = $(window);
	var $document = $(document);
	var $htmlBody = $('html, body');
	var screenHeight = $window.height();

	class HeavenScroll {
		constructor(el, options) {
			this.el = el;
			this.$el = $(el);
			this.options = $.extend({}, defaultOptions, options) ;
			
			this.init();
			this.initContainerOffset();
			this.urlHasStartPageInfo();

			this.onScroll();
			$window.on('scroll', this.onScroll);

			// delete console.log
			console.log(this.options.maxPagesNumber);
			console.log(this.options.pageHeight);
			console.log(this.options.startPage);
			console.log(this.options.loadPageFunction);
			console.log(this.pagePlaceholder);
			console.log(this.currentPage);
		}

		init() {
			if (this.options.maxPagesNumber === -1) {
				this.options.maxPagesNumber = this.$el.data('maxPages');
			}

			if (this.options.pageHeight === -1) {
				this.options.pageHeight = this.$el.data('pageHeight');
			}

			if (this.options.startPage === -1) {
				this.options.startPage = this.$el.data('startPage');
			}

			if (this.options.loadPageFunction === -1) {
				this.options.loadPageFunction = this.$el.data('infoOnPages');
			}

			this.currentPage = this.options.startPage;
			this.pageCount = 0;
			this.deletedPages = 0;
			this.prevScroll = 0;
			this.firstRun = true;
		}

		initContainerOffset() {
			this.pagePlaceholder = this.$el.position().top;
		}

		loadPage(position, printPageNumber) {
			var html = '<div class="pageSingle">' + printPageNumber + '</div>';
			if (position === 'ini') {
				this.$el.prepend(html);
			} else if (position === 'end') {
				this.$el.append(html);
			}
		}

		updateContainerPadding() {
			this.$el.css('padding-top', ((this.currentPage - 1) * this.options.pageHeight) + 'px');
		}

		urlHasStartPageInfo() {
			var scrollAmount;
			var urlStartPage = 'startPage';
			var currentPage;
			var arr = $(location)
				.attr('href')
				.split('?');

			if (arr.length > 1) {
				this.urlStartUp = true;

				arr[1]
					.split('&')
					.forEach(function (arg) {
						if (arg.indexOf(urlStartPage) !== -1) {
							currentPage = parseInt(arg.split('=')[1], 10);
							return;
						}
					});

				this.currentPage = currentPage;
				this.firstRun = false;

				if (this.currentPage > 1) {
					this.loadPage('end', (this.currentPage - 1));
				}
				this.loadPage('end', this.currentPage);

				if (currentPage > 1) {
					this.updateContainerPadding(); // needs to be created

					scrollAmount = this.$el.offset().top + this.options.pageHeight * this.currentPage;
					setTimeout(function () {
						$htmlBody.animate({ scrollTop: scrollAmount }, 0);
					}, 0);
				}
				
				this.pageCount = this.currentPage;
				if (this.currentPage > 2) {
					this.deletedPages = this.currentPage - 2;
				}
			}
		}

		updateValues() {
			this.pagesViewport = this.screenHeight - this.pagePlaceholder;
			this.pagesObjHeight = this.options.pageHeight * this.pageCount;
			this.pagesCurrentHeight = this.options.pageHeight * this.currentPage;

			// screen half way through last visible page
			this.nextPageTriggerHeight = this.pagesObjHeight - this.options.pageHeight / 2;

			// screen half way through first visible page
			this.prevPageTriggerHeight = parseInt(this.$el.css('padding-top'), 10) + this.options.pageHeight * 1.5;
		}

		scrollingOptions() {

		}

		onScroll() {
			console.log('scrolling');

			this.scrollValue = $document.scrollTop();

			// check if the screen is at half size
			if (this.firstRun) {
				this.pageCount++;
				this.loadPage('end', this.pageCount);
				this.firstRun = false;
				this.updateValues();

				if (this.pagesViewport > (this.options.pageHeight / 2)) {
					this.pageCount++;
					this.loadPage('end', this.pageCount);
				}
			} else {
				this.updateValues();
				this.scrollingOptions();
			}

			this.prevScroll = this.scrollValue;
		}
	}

	// -- Prevent multiple instantiations
	$.fn[pluginName] = function(options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_'+ pluginName)) {
				$.data(this, 'plugin_'+ pluginName, new HeavenScroll(this, options));
			}
		});
	};
});
$(document).ready(function () {
	$('.pagesContainer').HeavenScroll({
		maxPagesNumber: 3,
		pageHeight: 1584,
		startPage: 1,
		loadPageFunction: 'productTileFetcher'
	});
});
