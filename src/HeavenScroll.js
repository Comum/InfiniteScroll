/* eslint-disable */
/**
 * Heaven Scroll
 */
var defaultOptions = {
    pageHeight: -1,
    maxPagesNumber: -1,
    startPage: -1,
    pageClassName: -1,
    urlQueryParamName: -1,
    loadPageFunction: function () {}
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
        $window.on('scroll', () => this.onScroll());
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

        if (this.options.pageClassName === -1) {
            this.options.pageClassName = this.$el.data('pageClassName');
        }

        if (this.options.urlQueryParamName === -1) {
            this.options.urlQueryParamName = this.$el.data('urlQueryParamName');
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
        let args = {
            pageClassName: this.options.pageClassName,
            pageNumber: printPageNumber
        }

        this.options.loadPageFunction(args, (html) => {
            if (position === 'ini') {
                this.$el.prepend(html);
            } else if (position === 'end') {
                this.$el.append(html);
            }
            this.$pages = this.$el.find('.' + this.options.pageClassName);
        });
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
        var urlStartPage = this.options.urlQueryParamName;
        var currentPage;
        var arr = $(location)
            .attr('href')
            .split('?');

        if (arr.length > 1) {
            if (arr[1].indexOf(urlStartPage) !== -1) {
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
                    this.updateContainerPadding((this.currentPage - 2) * this.options.pageHeight + this.pagePlaceholder);
                    scrollAmount = (this.pagePlaceholder * 2) + this.options.pageHeight * (this.currentPage - 1);
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

    replaceQueryParam(param, newval, search) {
        var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
        var query = search.replace(regex, "$1").replace(/&$/, '');

        return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
    }

    urlQueryParamValueUpdate() {
        if ($(location).attr('href').split('?').length > 1) {
            window.history.replaceState("", "", this.replaceQueryParam(this.options.urlQueryParamName, this.currentPage, window.location.search));
        } else {
            window.history.replaceState("", "", '?' + this.options.urlQueryParamName + '=' + this.currentPage, window.location.search);
        }
    }

    currentPageControl(direction) {
        if (direction === 'down') {
            if (this.pagesViewport > this.pagesCurrentHeight) {
                this.currentPage++;
                this.urlQueryParamValueUpdate();
            }
        } else if (direction === 'up') {
            if (this.urlStartUp) {
                // first load when the url is used
                if ((this.pagesViewport < this.prevPageTriggerHeight) && (this.currentPage > 1)) {
                    this.currentPage--;
                    this.urlQueryParamValueUpdate();
                    this.urlStartUp = false;
                }
            } else {
                if ((this.pagesViewport < (this.pagesCurrentHeight - this.options.pageHeight * 0.5)) && (this.currentPage > 1)) {
                    this.currentPage--;
                    this.urlQueryParamValueUpdate();
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

export default HeavenScroll;
