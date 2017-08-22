$(function () {
	var $window = $(window);
	var $document = $(document);
	var $pagesSpacer = $('.pagesSpacer');
	var $pagesContainer = $('.pagesContainer');
	var $pages = $('.pageSingle');
	var $header = $('.header');

	var html;
	var maxPageNumber = $pagesContainer.data('maxPages');
	var currentPage;
	var pageCount = 0;
	var pageHeight;
	var screenHeight = $window.height();
	var pagePlaceholder = $header.height();
	var scrollValue;
	var prevScroll = 0;
	var firstRun = true;
	var pagesViewport;
	var pagesObjHeight;
	var nextPageTriggerHeight;
	var prevPageTriggerHeight;
	var pagesCurrentHeight;
	var deletedPages = 0;
	var startPage = 'startPage';

	var scrollAmount = {up: 0, down: 0};

	function loadPage(position, printPageNumber) {
		html = '<div class="pageSingle">' + printPageNumber + '</div>';
		if (position === 'ini') {
			$pagesContainer.prepend(html);
		} else if (position === 'end') {
			$pagesContainer.append(html);
		}
		$pages = $('.pageSingle');
	}

	function loadNextPage() {
		if (pagesViewport > nextPageTriggerHeight) {
			pageCount++;
			$('.pageCountValue').text(pageCount);
			loadPage('end', pageCount);
		}
	}

	function loadPrevPage() {
		if ((pagesViewport < prevPageTriggerHeight) && (deletedPages > 0)) {
			loadPage('ini', (currentPage - 1));
			deletedPages--;
			$('.deletedPageValue').text(deletedPages);
			$pagesSpacer.height(deletedPages * pageHeight);
		}
	}

	function removePage(position) {
		if (position === 'first') {
			
			$pages.splice(0,1);
			$('.pageSingle:first-child').remove();
			deletedPages++;
			$('.deletedPageValue').text(deletedPages);
			$pagesSpacer.height(deletedPages * pageHeight);
		} else if (position === 'last') {
			// $pages.pop();
			$pages.splice($pages.length-1,1);
			$('.pageSingle:last-child').remove();
			pageCount--;
			$('.pageCountValue').text(pageCount);
		}
	}

	function currentPageControl(direction) {
		if (direction === 'down') {
			if (pagesViewport > pagesCurrentHeight) {
				currentPage++;
			}
		} else if (direction === 'up') {
			if ((pagesViewport < (pagesCurrentHeight - pageHeight * 0.5)) && (currentPage > 1)) {
				currentPage--;
			}
		}

		$('.currentPageValue').text(currentPage);
	}

	function scrollingOptions() {
		if (prevScroll > scrollValue) { // scroll up
			scrollAmount.up = scrollValue;

			pagesViewport = pagesViewport + scrollValue;

			currentPageControl('up');
			loadPrevPage();

			if ($pages.length > maxPageNumber) {
				removePage('last');
			}
		} else if ((prevScroll < scrollValue) && (prevScroll !== 0)){ // scroll down
			scrollAmount.down = scrollValue;

			pagesViewport = pagesViewport + scrollValue;

			currentPageControl('down');
			loadNextPage();

			if ($pages.length > maxPageNumber) {
				removePage('first');
			}
		}
	}

	function updateValues() {
		if (!pageHeight) {
			pageHeight = $pages.height();
		}
		pagesViewport = screenHeight - pagePlaceholder;
		pagesObjHeight = pageHeight * pageCount;
		pagesCurrentHeight = pageHeight * currentPage;

		// screen half way through last visible page
		nextPageTriggerHeight = pagesObjHeight - pageHeight / 2;

		// screen half way through first visible page
		prevPageTriggerHeight = $pagesSpacer.height() + pageHeight * 1.5;
	}

	function onScroll() {
		scrollValue = $document.scrollTop();

		// check if the screen is at half size
		if (firstRun) {
			pageCount++;
			loadPage('end', pageCount);
			firstRun = false;
			updateValues();

			if (pagesViewport > (pageHeight / 2)) {
				pageCount++;
				$('.pageCountValue').text(pageCount);
				loadPage('end', pageCount);
			}
		} else {
			updateValues();
			scrollingOptions();
		}

		// for visual aid (do not include)
		$('.scrollDownValue').text(scrollAmount.down);
		$('.scrollUpValue').text(scrollAmount.up);

		prevScroll = scrollValue;
	}

	function init() {
		var arr = $(location)
					.attr('href')
					.split('?');

		if (arr.length === 1) {
			currentPage = $pagesContainer.data('startPage');
		} else {
			arr[1]
				.split('&')
				.forEach(function (arg) {
					if (arg.indexOf(startPage) !== -1) {
						currentPage = parseInt(arg.split('=')[1], 10);
					}
				});

			// load previous page and populate pagesSpacer height and scroll to page

			// don't load the first page normally
			firstRun = false;

			loadPage('end', (currentPage - 1));
			loadPage('end', currentPage);
			
			pageHeight = $pages.height();
			
			$pagesSpacer.height(currentPage * pageHeight);
			
			$('html, body').animate({
				scrollTop: ($pagesContainer.offset().top + pageHeight)
			}, 0);

			pageCount = currentPage;
		}
	}

	init();
	onScroll();
	// $(window).on('scroll', _.debounce(onScroll, 50));
	$(window).on('scroll', onScroll);
});
