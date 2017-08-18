var $window = $(window);
var $document = $(document);
var $pagesSpacer = $('.pagesSpacer');
var $pagesContainer = $('.pagesContainer');
var $pages = $('.pageSingle');
var $header = $('.header');

var html;
var maxPageNumber = 3;
var currentPage = 1;
var pageCount = 1;
var pageHeight = $pages.height();
var screenHeight = $window.height();
var pagePlaceholder = $header.height();
var scrollValue;
var prevScroll;
var firstRun = true;
var pagesViewport;
var pagesObjHeight;
var nextPageTriggerHeight;
var prevPageTriggerHeight;
var pagesCurrentHeight;
var deletedPages = 0;

var scrollAmount = {up: 0, down: 0};

function loadPage(position) {
	html = '<div class="pageSingle">' + pageCount + '</div>';
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
		loadPage('end');
	}
}

function loadPrevPage() {
	if (pagesViewport > prevPageTriggerHeight) {
		console.info('load prev page');
	}
}

function removePage(position) {
	if (position === 'first') {
		// .shift()
		$pages.splice(0,1);
		// $pagesContainer.find('.pageSingle').splice(0,1);
		$('.pageSingle:first-child').remove();
		deletedPages++;
		$pagesSpacer.height(deletedPages * pageHeight);
	} else if (position === 'last') {
		// $pages.pop();
		$pages.splice($pages.length-1,1);
	}
}

function currentPageControl(direction) {
	if (direction === 'down') {
		if (pagesViewport > pagesCurrentHeight) {
			currentPage++;
		}
	}
}

function onScroll() {
	scrollValue = $document.scrollTop();

	pagesViewport = screenHeight - pagePlaceholder;
	pagesObjHeight = pageHeight * pageCount;
	pagesCurrentHeight = pageHeight * currentPage;

	// screen half way through last visible page
	nextPageTriggerHeight = pagesObjHeight - pageHeight / 2;

	// screen half way through first visible page
	prevPageTriggerHeight = (pageCount - maxPageNumber) * pageHeight - pagesObjHeight / 2;

	// check if the screen is at half size
	if ((pagesViewport > (pageHeight / 2)) && (firstRun)) {
		pageCount++;
		loadPage('end');
		firstRun = false;
	}

	if (prevScroll > scrollValue) { // scroll up
		scrollAmount.up = scrollValue;

		pagesViewport = pagesViewport - scrollValue;

		currentPageControl('up');
		console.info('prevPageTriggerHeight', prevPageTriggerHeight);
		loadPrevPage();

		if ($pages.length > maxPageNumber) {
			removePage('last');
		}
	} else if (prevScroll < scrollValue) { // scroll down
		scrollAmount.down = scrollValue;

		pagesViewport = pagesViewport + scrollValue;

		currentPageControl('down');
		loadNextPage();

		if ($pages.length > maxPageNumber) {
			removePage('first');
		}
	}

	// for visual aid (do not include)
	$('.scrollDownValue').text(scrollAmount.down);
	$('.scrollUpValue').text(scrollAmount.up);

	prevScroll = scrollValue;
}

onScroll();
$(window).on('scroll', _.debounce(onScroll, 50));