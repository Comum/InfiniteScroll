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
        this.initContainerOffset(); // used?
        this.urlHasStartPageInfo();

        this.updateUrlStartPageParam('');
        this.initHeavenScroll();
        $window.on('scroll', () => this.onScroll());
    }

    init() {
        if (this.options.fadeInValue === -1) {
            this.options.fadeInValue = this.$el.data('fadeInValue');
        }

        if (this.options.maxPagesNumber === -1) {
            this.options.maxPagesNumber = this.$el.data('maxPages');
        }

        if (this.options.pageHeight === -1) {
            this.options.pageHeight = this.$el.data('pageHeight');
        }

        if (this.options.startPage === -1) {
            this.options.startPage = this.$el.data('startPage');
        }

        if (this.options.endPage === -1) {
            this.options.endPage = this.$el.data('endPage');
        }

        if (this.options.pageClassName === -1) {
            this.options.pageClassName = this.$el.data('pageClassName');
        }

        if (this.options.urlQueryParamName === -1) {
            this.options.urlQueryParamName = this.$el.data('urlQueryParamName');
        }

        this.isPageLoading = false;
        // if this.urlStartPage is differnet than zero than url has startPage
        this.urlStartPage = 1;
        this.currentPage = 1;
        this.prevScroll = 0;
        this.firstRun = true;
        this.$pages = this.$el.find('.' + this.options.pageClassName);
        this.urlParams = [];
    }

    initContainerOffset() {
        this.pagePlaceholder = this.$el.position().top;
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
                            if (pageValue > 1) {
                                this.urlStartPage = parseInt(arg.split('=')[1], 10);
                            }
                            this.currentPage = this.urlStartPage;
                            return;
                        }
                    }.bind(this));
            }
        }
    }

    updateContainerPadding(paddingValue) {
        this.$el.css('padding-top', paddingValue + 'px');
    }

    loadPage(position, printPageNumber) {
        let args = {
            pageClassName: this.options.pageClassName,
            pageNumber: printPageNumber
        }

        return new Promise((resolve, reject) => {
            this.options.loadPageFunction(args, (html) => {
                if (position === 'ini') {
                    $(html).hide().prependTo(this.$el).fadeIn(this.options.fadeInValue);
                } else if (position === 'end') {
                    $(html).hide().appendTo(this.$el).fadeIn(this.options.fadeInValue);
                }

                this.$pages = this.$el.find('.' + this.options.pageClassName);

                resolve();
            });
        });
    }

    initHeavenScroll() {
        if (this.urlStartPage > 1) { // load 3 pages, 1 before and 1 after
            return this.loadPage('ini', [(this.urlStartPage - 1), this.urlStartPage, (this.urlStartPage + 1)])
                .then(() => {
                    // only if startPage is bigger than 3 it will update padding on start up
                    if (this.urlStartPage > 1) {
                        this.updateContainerPadding((this.urlStartPage - 2) * this.options.pageHeight);
                        // scroll to page
                        setTimeout(function () {
                            var firstPage = document.getElementsByClassName(this.options.pageClassName)[1].getBoundingClientRect().top;

                            $htmlBody.animate({ scrollTop: firstPage }, 0);
                        }.bind(this), 0);
                    }
                });
        }

        return this.loadPage('ini', this.urlStartPage);
    }

    removePage(position) {
        if (position === 'first') {
            $('.' + this.options.pageClassName + ':first-child').remove();
        } else if (position === 'last') {
            $('.' + this.options.pageClassName + ':last-child').remove();
        }
    }

    replaceQueryParam(param, newval, search) {
        var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
        var query = search.replace(regex, "$1").replace(/&$/, '');

        return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
    }

    urlQueryParamValueUpdate(pageNumber) {
        if (this.urlParams.length > 1) {
            window.history.replaceState("", "", this.replaceQueryParam(this.options.urlQueryParamName, pageNumber, window.location.search));
        } else {
            window.history.replaceState("", "", '?' + this.options.urlQueryParamName + '=' + pageNumber, window.location.search);
        }
    }

    updateUrlStartPageParam(scrolligOption) {
        if (this.firstRun) {
            if (this.urlStartPage === 1) {
                this.urlQueryParamValueUpdate(this.urlStartPage);
            }

            this.firstRun = false;
        }

        if (scrolligOption === 'down') {
            if ($('[data-page-number=' + (this.currentPage + 1) + ']').length) {
                if ($('[data-page-number=' + (this.currentPage + 1) + ']')[0].getBoundingClientRect().top < (screenHeight * 0.75)) {
                    this.currentPage++;
                    this.urlQueryParamValueUpdate(this.currentPage);
                }
            }
        } else if (scrolligOption === 'up') {
            if ($('[data-page-number=' + (this.currentPage - 1) + ']').length) {
                if ($('[data-page-number=' + (this.currentPage - 1) + ']')[0].getBoundingClientRect().bottom > (screenHeight * 0.25)) {
                    this.currentPage--;
                    this.urlQueryParamValueUpdate(this.currentPage);
                }
            }
        }
    }

    onScroll() {
        var firstPageNumber;
        var pages = document.getElementsByClassName(this.options.pageClassName);
        var pagesLength = $('.' + this.options.pageClassName).length;

        if (!this.isPageLoading) {
            this.scrollValue = $document.scrollTop();

            if (this.prevScroll > this.scrollValue) { // scroll up
                this.updateUrlStartPageParam('up');
                if (((Math.abs(pages[0].getBoundingClientRect().top) - Math.abs(pages[0].getBoundingClientRect().bottom)) <= (screenHeight - 50)) && (pages[0].getAttribute('data-page-number') > 1)) {
                    this.isPageLoading = true;
                    
                    return this.loadPage('ini', (parseInt(pages[0].getAttribute('data-page-number')) - 1))
                    .then(() => {
                        this.isPageLoading = false;
                        if (pagesLength >= this.options.maxPagesNumber) {
                            this.removePage('last');
                            firstPageNumber = $('.' + this.options.pageClassName + ':first-child').data('pageNumber');
                            // For now just token height;
                            this.updateContainerPadding((parseInt(firstPageNumber, 10) - 1) * this.options.pageHeight);
                        }
                    });
                }
            } else if ((this.prevScroll < this.scrollValue) && (this.prevScroll !== 0)) { // scroll down
                this.updateUrlStartPageParam('down');

                if ((Math.abs(pages[(pages.length - 1)].getBoundingClientRect().bottom) - Math.abs(pages[(pages.length - 1)].getBoundingClientRect().top)) <= (screenHeight - 50)) {
                    this.isPageLoading = true;
                    
                    return this.loadPage('end', (parseInt(pages[(pages.length - 1)].getAttribute('data-page-number')) + 1))
                    .then(() => {
                        this.isPageLoading = false;
                        if (pagesLength >= this.options.maxPagesNumber) {
                            this.removePage('first');
                            firstPageNumber = $('.' + this.options.pageClassName + ':first-child').data('pageNumber');
                            // For now just token height;
                            this.updateContainerPadding((parseInt(firstPageNumber, 10) - 1) * this.options.pageHeight);
                        }
                    });
                }
            }

            this.prevScroll = this.scrollValue;
        }
    }
}

export default HeavenScroll;
