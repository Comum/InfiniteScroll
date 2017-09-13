/* eslint-disable */
/**
 * Heaven Scroll
 */
var defaultOptions = {
    fadeInValue: 1500,
    pageHeight: -1,
    maxPagesNumber: -1,
    startPage: -1,
    endPage: -1,
    pageClassName: -1,
    urlQueryParamName: -1,
    loadPageFunction: function () {},
    hasSpinner: false,
    spinnerClassName: -1
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
        this.urlHasStartPageInfo();

        this.updateUrlStartPageParam('');
        this.initHeavenScroll();
        $window.on('scroll', () => this.onScroll());
    }

    init() {
        if (this.options.fadeInValue === -1) {
            if (this.$el.data('fadeInValue')) {
                this.options.fadeInValue = this.$el.data('fadeInValue');
            } else {
                this.options.fadeInValue = 1000;
            }
        }

        if (this.options.maxPagesNumber === -1) {
            if (this.$el.data('maxPages')) {
                this.options.maxPagesNumber = this.$el.data('maxPages');
            } else {
                this.options.maxPagesNumber = 3;
            }
        }

        if (this.options.pageHeight === -1) {
            if (this.$el.data('pageHeight')) {
                this.options.pageHeight = this.$el.data('pageHeight');
            } else {
                this.options.pageHeight = 1584;
            }
        }

        if (this.options.startPage === -1) {
            if (this.$el.data('startPage')) {
                this.options.startPage = this.$el.data('startPage');
            } else {
                this.options.startPage = 1;
            }
        }

        if (this.options.endPage === -1) {
            if (this.$el.data('endPage')) {
                this.options.endPage = this.$el.data('endPage');
            } else {
                this.options.endPage = 100;
            }
        }

        if (this.options.pageClassName === -1) {
            if (this.$el.data('pageClassName')) {
                this.options.pageClassName = this.$el.data('');
            } else {
                this.options.pageClassName = 'pageSingle';
            }
        }

        if (this.options.urlQueryParamName === -1) {
            if (this.$el.data('urlQueryParamName')) {
                this.options.urlQueryParamName = this.$el.data('urlQueryParamName');
            } else {
                this.options.urlQueryParamName = 'startPage';
            }
        }

        this.isPageLoading = false;
        this.urlStartPage = 1;
        this.currentPage = 1;
        this.prevScroll = 0;
        this.firstRun = true;
        this.$pages = this.$el.find('.' + this.options.pageClassName);
        this.urlParams = [];

        this.$el.css('position', 'relative');
    }

    urlHasStartPageInfo() {
        this.urlParams = $(location)
            .attr('href')
            .split('?');

        if (this.urlParams.length > 1) {
            if (this.urlParams[1].indexOf(this.options.urlQueryParamName) !== -1) {
                this.urlParams[1]
                    .split('&')
                    .forEach(function (arg) {
                        var pageValue;

                        if (arg.indexOf(this.options.urlQueryParamName) !== -1) {
                            pageValue = parseInt(arg.split('=')[1], 10);
                            if ((pageValue > 1) && (pageValue <= this.options.endPage)) {
                                this.urlStartPage = parseInt(arg.split('=')[1], 10);
                            } else if ((pageValue > 1) && (pageValue > this.options.endPage)){
                                this.urlStartPage = this.options.endPage;
                            }
                            this.currentPage = this.urlStartPage;
                            return;
                        }
                    }.bind(this));
            }
        }
    }

    loadPage(position, printPageNumber) {
        let args;

        args = {
            pageClassName: this.options.pageClassName,
            pageNumber: printPageNumber
        }

        return new Promise((resolve, reject) => {
            this.loadPageFunction = this.options.loadPageFunction;
            this.loadPageFunction(args, (html) => {
                if (html !== '') {
                    if (position === 'iniHeaven') {
                        $(html).hide().prependTo(this.$el).fadeIn(this.options.fadeInValue);
                        
                        if (this.urlStartPage === 1) {
                            localStorage.setItem('listingPage1', this.$el.find('.' + this.options.pageClassName + ':first').height());
                        }

                    } else if (position === 'end') {
                        $(html).hide().appendTo(this.$el).fadeIn(this.options.fadeInValue);
                    } else if (position === 'ini') {
                        $(html).hide().insertAfter('.placeHolderDiv:last').fadeIn(this.options.fadeInValue);
                        this.$el.find('.placeHolderDiv:last').remove();
                    }
                }

                this.$pages = this.$el.find('.' + this.options.pageClassName);

                resolve();
            });
        });
    }

    wrapHtmlPage(contentEl, options) {
        return `<div
                     class="${options.pageClassName}"
                     style="
                         position: relative;"
                     data-page-number="${options.pageNumber}"
                     >
                        ${contentEl}
                </div>`;
    }

    populatePlaceholderEmptyDivs() {
        var html = '';
        var placholderHeight;
        var i;

        for (i = 1 ; i <= (this.urlStartPage - 2) ; i++) {
            // check if local variable with height exists and update placholderHeight value
            placholderHeight = localStorage.getItem('listingPage' + i) || this.options.pageHeight;

            html = html + `<div class="placeHolderDiv" style="width: 100%; height: ${placholderHeight}px; position: relative;"></div>`;
        }

        this.$el.prepend(html);
    }

    initHeavenScroll() {
        var pagesArray = [];

        if (this.urlStartPage > 1) {
            // load 3 pages, 1 before and 1 after
            if (this.urlStartPage === this.options.endPage) {
                pagesArray = [(this.urlStartPage - 1), this.urlStartPage];
            } else {
                pagesArray = [(this.urlStartPage - 1), this.urlStartPage, (this.urlStartPage + 1)];
            }

            return this.loadPage('iniHeaven', pagesArray)
                .then(() => {
                    // only if startPage is bigger than 3 it will update padding on start up
                    if (this.urlStartPage > 1) {
                        if (this.urlStartPage > 2) {
                            this.populatePlaceholderEmptyDivs();
                        }

                        // scroll to page
                        setTimeout(function () {
                            var firstPage = document.getElementsByClassName(this.options.pageClassName)[1].getBoundingClientRect().top + window.scrollY;

                            $htmlBody.animate({ scrollTop: firstPage }, 0);
                        }.bind(this), 0);
                    }
                });
        }

        return this.loadPage('iniHeaven', this.urlStartPage);
    }

    removePage(position) {
        var pageHeight;
        var html;
        var $page;

        if (position === 'first') {
            $page = this.$el.find('.' + this.options.pageClassName + ':first');
            pageHeight = $page.height();
            html = `<div class="placeHolderDiv" style="width: 100%; height: ${pageHeight}px; position: relative;"></div>`;
            $page.replaceWith(html);
        } else if (position === 'last') {
            this.$el.find('.' + this.options.pageClassName + ':last').remove();
        }
    }

    replaceQueryParam(param, newval, search) {
        var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
        var query = search.replace(regex, "$1").replace(/&$/, '');

        return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
    }

    urlQueryParamValueUpdate(pageNumber) {
        var pageHeight;

        if (this.urlParams.length > 1) {
            window.history.replaceState("", "", this.replaceQueryParam(this.options.urlQueryParamName, pageNumber, window.location.search));
        } else {
            window.history.replaceState("", "", '?' + this.options.urlQueryParamName + '=' + pageNumber, window.location.search);
        }

        pageHeight = this.$el.find(`.${this.options.pageClassName}[data-page-number=${pageNumber}]`).height();
        localStorage.setItem('listingPage' + pageNumber, pageHeight);
    }

    updateUrlStartPageParam(scrolligOption) {
        if (this.firstRun) {
            if (this.urlStartPage === 1) {
                this.urlQueryParamValueUpdate(this.urlStartPage);
            }

            this.firstRun = false;
        }

        if (scrolligOption === 'down') {
            if (this.$el.find('[data-page-number=' + (this.currentPage + 1) + ']').length) {
                if (this.$el.find('[data-page-number=' + (this.currentPage + 1) + ']')[0].getBoundingClientRect().top < (screenHeight * 0.75)) {
                    this.currentPage++;
                    this.urlQueryParamValueUpdate(this.currentPage);
                }
            }
        } else if (scrolligOption === 'up') {
            if (this.$el.find('[data-page-number=' + (this.currentPage - 1) + ']').length) {
                if (this.$el.find('[data-page-number=' + (this.currentPage - 1) + ']')[0].getBoundingClientRect().bottom > (screenHeight * 0.25)) {
                    this.currentPage--;
                    this.urlQueryParamValueUpdate(this.currentPage);
                }
            }
        }
    }

    addSpinner(position) {
        var html;
        var spinnerHeightPosition;
        var $lastPage;

        if (position === 'top') {
            spinnerHeightPosition = $('.' + this.options.pageClassName + ':first-child').position().top;
            html = `<div
                        class="${this.options.spinnerClassName}"
                        style="
                            position: absolute;
                            bottom: ${spinnerHeightPosition}px;
                        ">
                    </div>`;
            this.$el.prepend(html);
        } else if (position === 'bottom') {
            $lastPage = $('.' + this.options.pageClassName + ':last-child');
            spinnerHeightPosition = $lastPage.position().top + $lastPage.outerHeight(true);
            html = `<div
                        class="${this.options.spinnerClassName}"
                        style="
                            position: absolute;
                            top: ${spinnerHeightPosition}px;
                        ">
                    </div>`;
            this.$el.append(html);
        }
    }

    removeSpinner(cb) {
        return new Promise((resolve, reject) => {
            $.when($('.' + this.options.spinnerClassName).remove()).done(() => resolve());
        });
    }

    loadingPage(scrollDir, pageNumber) {
        var pagesLength;

        if (scrollDir === 'scrollUp') {
            // this.addSpinner('top');
            return this.loadPage('ini', (pageNumber - 1))
            .then(() => {
                this.removePage('last');
                this.removeSpinner();
            });
        } else if (scrollDir === 'scrollDown') {
            pagesLength = this.$el.find('.' + this.options.pageClassName).length;

            this.addSpinner('bottom');
            return this.loadPage('end', pageNumber)
            .then(() => {
                if (pagesLength >= this.options.maxPagesNumber) {
                    this.removePage('first');
                }
                this.removeSpinner();
            });
        }

        return Promise.resolve();
    }

    onScroll() {
        var pages = document.getElementsByClassName(this.options.pageClassName);
        var pageNumber;

        if (!this.isPageLoading) {
            this.scrollValue = $document.scrollTop();

            if (this.prevScroll > this.scrollValue) { // scroll up
                this.updateUrlStartPageParam('up');
                if (((Math.abs(pages[0].getBoundingClientRect().top) - Math.abs(pages[0].getBoundingClientRect().bottom)) <= (screenHeight - 50)) && (pages[0].getAttribute('data-page-number') > 1)) {
                    this.isPageLoading = true;

                    pageNumber = parseInt(pages[0].getAttribute('data-page-number'));
                    this.loadingPage('scrollUp', pageNumber)
                    .then(() => {
                        this.isPageLoading = false;
                    });
                }
            } else if ((this.prevScroll < this.scrollValue) && (this.prevScroll !== 0)) { // scroll down
                this.updateUrlStartPageParam('down');

                if (((Math.abs(pages[(pages.length - 1)].getBoundingClientRect().bottom) - Math.abs(pages[(pages.length - 1)].getBoundingClientRect().top)) <= (screenHeight - 50)) && (this.currentPage < this.options.endPage)) {
                    this.isPageLoading = true;

                    pageNumber = parseInt(pages[(pages.length - 1)].getAttribute('data-page-number')) + 1;
                    this.loadingPage('scrollDown', pageNumber)
                    .then(() => {
                        this.isPageLoading = false;
                    });
                }
            }

            this.prevScroll = this.scrollValue;
        }
    }
}

export default HeavenScroll;
