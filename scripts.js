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
		loadPageFunction: -1,
		pageClassName: -1
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
			$window.on('scroll', this.onScroll.bind(this));

			// delete console.log
			console.log(this.options.maxPagesNumber);
			console.log(this.options.pageHeight);
			console.log(this.options.startPage);
			console.log(this.options.loadPageFunction);
			console.log(this.options.pageClassName);
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

			if (this.options.pageClassName === -1) {
				this.options.pageClassName = this.$el.data('pageClassName');
			}

			this.currentPage = this.options.startPage;
			this.pageCount = 0;
			this.deletedPages = 0;
			this.prevScroll = 0;
			this.firstRun = true;
			this.pagesViewport = 0;
			this.pagesObjHeight = 0;
			this.pagesCurrentHeight = 0;
			this.nextPageTriggerHeight = 0;
			this.prevPageTriggerHeight = 0;
			this.$pages = this.$el.find('.' + this.options.pageClassName);
		}

		initContainerOffset() {
			this.pagePlaceholder = this.$el.position().top;
		}

		updateContainerPadding(paddingValue) {
			this.$el.css('padding-top', paddingValue + 'px');
		}

		loadPage(position, printPageNumber) {
			var html = '<div class="' + this.options.pageClassName + '">' + printPageNumber + '</div>';
			if (position === 'ini') {
				this.$el.prepend(html);
			} else if (position === 'end') {
				this.$el.append(html);
			}
			this.$pages = this.$el.find('.' + this.options.pageClassName);
		}

		loadPrevPage() {
			if ((this.pagesViewport < this.prevPageTriggerHeight) && (this.deletedPages > 0)) {
				this.loadPage('ini', (this.currentPage - 1));
				this.deletedPages--;
				this.updateContainerPadding(this.deletedPages * this.options.pageHeight);
			}
		}

		loadNextPage() {
			if (this.pagesViewport > this.nextPageTriggerHeight) {
				this.pageCount++;
				this.loadPage('end', this.pageCount);
			}
		}

		removePage(position) {
			if (position === 'first') {
				$('.' + this.options.pageClassName + ':first-child').remove();
				this.deletedPages++;
				this.updateContainerPadding(this.deletedPages * this.options.pageHeight);
			} else if (position === 'last') {
				$('.' + this.options.pageClassName + ':last-child').remove();
				this.pageCount--;
			}

			this.$pages = this.$el.find('.' + this.options.pageClassName);
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
					this.updateContainerPadding((this.currentPage - 1) * this.options.pageHeight); // needs to be created

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
			this.pagesViewport = screenHeight - this.pagePlaceholder;
			this.pagesObjHeight = this.options.pageHeight * this.pageCount;
			this.pagesCurrentHeight = this.options.pageHeight * this.currentPage;

			// screen half way through last visible page
			this.nextPageTriggerHeight = this.pagesObjHeight - this.options.pageHeight / 2;

			// screen half way through first visible page
			this.prevPageTriggerHeight = parseInt(this.$el.css('padding-top'), 10) + this.options.pageHeight * 1.5;
		}

		currentPageControl(direction) {
			if (direction === 'down') {
				if (this.pagesViewport > this.pagesCurrentHeight) {
					this.currentPage++;
				}
			} else if (direction === 'up') {
				if (this.urlStartUp) {
					// first load when the url is used
					if ((this.pagesViewport < this.prevPageTriggerHeight) && (this.currentPage > 1)) {
						this.currentPage--;
						this.urlStartUp = false;
					}
				} else {
					if ((this.pagesViewport < (this.pagesCurrentHeight - this.options.pageHeight * 0.5)) && (this.currentPage > 1)) {
						this.currentPage--;
					}
				}
			}
		}

		scrollingOptions() {
			if (this.prevScroll > this.scrollValue) { // scroll up

				this.pagesViewport = this.pagesViewport + this.scrollValue;

				this.currentPageControl('up');
				this.loadPrevPage();

				if (this.$pages.length > this.options.maxPagesNumber) {
					this.removePage('last');
				}
			} else if ((this.prevScroll < this.scrollValue) && (this.prevScroll !== 0)){ // scroll down

				this.pagesViewport = this.pagesViewport + this.scrollValue;

				this.currentPageControl('down');
				this.loadNextPage();

				if (this.$pages.length > this.options.maxPagesNumber) {
					this.removePage('first');
				}
			}
		}

		onScroll() {
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
		loadPageFunction: 'productTileFetcher',
		pageClassName: 'pageSingle'
	});
});
