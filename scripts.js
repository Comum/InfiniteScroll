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
		loadPage('end', pageCount);
	}
}

function loadPrevPage() { // console.log('aqui');
	if ((pagesViewport < prevPageTriggerHeight) && (deletedPages > 0)) {
	// if (pagesViewport < prevPageTriggerHeight){
		console.info('load prev page');
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
	}
}

function currentPageControl(direction) {
	if (direction === 'down') {
		if (pagesViewport > pagesCurrentHeight) {
			currentPage++;
		}
	} else if (direction === 'up') {
		if ((pagesViewport < pagesCurrentHeight - (pageHeight * 1.5)) && (currentPage > 1)){
			currentPage--;
		}
	}

	$('.currentPageValue').text(currentPage);
}

function onScroll() { console.log(currentPage);
	scrollValue = $document.scrollTop();

	pagesViewport = screenHeight - pagePlaceholder;
	pagesObjHeight = pageHeight * pageCount;
	pagesCurrentHeight = pageHeight * currentPage;

	// screen half way through last visible page
	nextPageTriggerHeight = pagesObjHeight - pageHeight / 2;

	// screen half way through first visible page
	prevPageTriggerHeight = $pagesSpacer.height() + pageHeight * 1.5;

	// check if the screen is at half size
	if ((pagesViewport > (pageHeight / 2)) && (firstRun)) {
		pageCount++;
		loadPage('end', pageCount);
		firstRun = false;
	}

	if (prevScroll > scrollValue) { // scroll up
		scrollAmount.up = scrollValue;

		pagesViewport = pagesViewport + scrollValue;

		currentPageControl('up');
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
// $(window).on('scroll', _.debounce(onScroll, 50));
$(window).on('scroll', onScroll);