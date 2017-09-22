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
    spinnerClassName: 'Spinner',
    throttleValue: 100
};

const $window = $(window);
const $document = $(document);
const $htmlBody = $('html, body');
const screenHeight = $window.height();

class HeavenScroll {
    /*
     * Initializes the plugin
     *
     * @param {String} el
     * @param {Object} options
     * @param {Integer} options.fadeInValue
     * @param {Integer} options.pageHeight
     * @param {Integer} options.maxPageNumber
     * @param {Integer} options.startPage
     * @param {Integer} options.endPage
     * @param {Integer} options.pageClassName
     * @param {Integer} options.urlQueryParamName
     * @param {Function} options.loadPageFunction
     * @param {String} options.spinnerClassName
     * @param {Integer} options.throttleValue
     */
    constructor(el, options) {
        this.el = el;
        this.$el = $(el);
        this.options = $.extend({}, defaultOptions, options) ;

        this.init();
        this.urlHasStartPageInfo();

        this.updateUrlStartPageParam('');
        this.initHeavenScroll();
        $window.on('scroll', _.throttle(this.onScroll.bind(this), this.options.throttleValue));
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
                this.options.pageHeight = screenHeight * 1.2;
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

        if (this.options.throttleValue === -1) {
            if (this.$el.data('throttleValue')) {
                this.options.throttleValue = this.$el.data('throttleValue');
            } else {
                this.options.throttleValue = 100;
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

        if (this.urlParams.length <= 1) {
            return;
        }

        if (this.urlParams[1].match(this.options.urlQueryParamName)) {
            this.urlParams[1]
                .split('&')
                .forEach((arg) => {
                    let pageValue;

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
                });
        }
    }

    /**
     * Returns the resolved promise when the html is added to the DOM
     *
     * @param {String} position
     * @param {Integer} printPageNumber
     */
    loadPage(position, printPageNumber) {
        let args;

        args = {
            pageClassName: this.options.pageClassName,
            pageNumber: printPageNumber
        }

        return new Promise((resolve, reject) => {
            // NOTE: the function needs to be reassigned because it loses scope when it is called with the callback 
            this.loadPageFunction = this.options.loadPageFunction;
            this.loadPageFunction(args, (html) => {
                let realHtml;

                // check if this.wrapHtmlPage() is called in implemented (by 'user') function
                if (typeof html === 'undefined' || !html) {
                    realHtml = this.wrapHtmlPage(`<p class="errorLoadingPageMessage">Error Loading Page</p>`, args);
                } else if (html.match(this.options.pageClassName)) {
                    realHtml = html;
                } else {
                    realHtml = this.wrapHtmlPage(html, args);   
                }

                if (position === 'iniHeaven') {
                    $(realHtml).hide().prependTo(this.$el).fadeIn(this.options.fadeInValue);
                    
                    if (this.urlStartPage === 1) {
                        localStorage.setItem('listingPage1', this.$el.find('.' + this.options.pageClassName + ':first').height());
                    }

                } else if (position === 'end') {
                    $(realHtml).hide().insertAfter('.' + this.options.pageClassName + ':last').fadeIn(this.options.fadeInValue);
                    this.$el.find('.afterPlaceHolderDiv:first').remove();
                } else if (position === 'ini') {
                    $(realHtml).hide().insertBefore('.' + this.options.pageClassName + ':first').fadeIn(this.options.fadeInValue);
                    this.$el.find('.beforePlaceHolderDiv:last').remove();
                } else {
                    console.error('loadPage(position, printPageNumber): "' + position + '" is not a valid argument.');
                }

                this.$pages = this.$el.find('.' + this.options.pageClassName);
                resolve();
            });
        });
    }

    /**
     * Returns the wrapped html into a div
     *
     * @param {String} contentEl
     * @param {Object} options
     * @param {String} options.pageClassName
     * @param {Integer} options.pageNumber
     */
    wrapHtmlPage(contentEl, options) {
        let htmlNewContent = contentEl;

        if (typeof contentEl === 'undefined' || !contentEl) {
            htmlNewContent = `<p class="errorLoadingPageMessage">Error Loading Page</p>`;
        }

        return `<div
                     class="${options.pageClassName}"
                     style="
                         position: relative;"
                     data-page-number="${options.pageNumber}"
                     >
                        ${htmlNewContent}
                </div>`;
    }

    populatePlaceholderEmptyDivs() {
        let html = '';
        let placholderHeight;

        for (let i = 1 ; i <= (this.urlStartPage - 2) ; i++) {
            placholderHeight = localStorage.getItem('listingPage' + i) || this.options.pageHeight;

            html = html + `<div class="beforePlaceHolderDiv" style="width: 100%; height: ${placholderHeight}px; position: relative;"></div>`;
        }

        this.$el.prepend(html);
    }

    initHeavenScroll() { 
        let pagesArray = [];

        if (this.urlStartPage <= 1) {
            return this.loadPage('iniHeaven', this.urlStartPage);
        }

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
                    setTimeout(() => {
                        let firstPage = this
                            .$el
                            .find('.' + this.options.pageClassName + ':eq(1)')
                            .position()
                            .top;

                        $htmlBody.animate({ scrollTop: firstPage }, 0);
                    }, 0);
                }
            });
    }

    /**
     * Removes the first or last page
     *
     * @param {String} position
     */
    removePage(position) {
        let pageHeight;
        let html;
        let $page;

        if ((position !== 'first') && (position !== 'last')) {
            console.error('removePage(position): "' + position + '" is not a valid argument.');
        } else {
            if (position === 'first') {
                $page = this.$el.find('.' + this.options.pageClassName + ':first');
                pageHeight = $page.height();
                html = `<div class="beforePlaceHolderDiv" style="width: 100%; height: ${pageHeight}px; position: relative;"></div>`;
            } else if (position === 'last') {
                $page = this.$el.find('.' + this.options.pageClassName + ':last');
                pageHeight = $page.height();
                html = `<div class="afterPlaceHolderDiv" style="width: 100%; height: ${pageHeight}px; position: relative;"></div>`;
            }

            $page.replaceWith(html);
        }
    }

    replaceQueryParam(param, newval, search) {
        let regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
        let query = search.replace(regex, "$1").replace(/&$/, '');

        return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
    }

    /**
     * Updates url current page parameter
     *
     * @param {Integer} pageNumber
     */
    urlQueryParamValueUpdate(pageNumber) {
        let pageHeight;
        let urlParam;

        if (this.urlParams.length > 1) {
            urlParam = this.replaceQueryParam(this.options.urlQueryParamName, pageNumber, window.location.search);

            window
                .history
                .replaceState("", "", urlParam);
        } else {
            urlParam = '?' + this.options.urlQueryParamName + '=' + pageNumber;

            window
                .history
                .replaceState("", "", urlParam, window.location.search);
        }

        pageHeight = this.$el.find(`.${this.options.pageClassName}[data-page-number=${pageNumber}]`).height();
        localStorage.setItem('listingPage' + pageNumber, pageHeight);
    }

    /**
     * Sets up to update url current page parameter
     *
     * @param {String} scrolligOption
     */
    updateUrlStartPageParam(scrolligOption) {
        let $dataPageNumber;
        let pageTriggerPosition;
        let screenTrigger;

        if (this.firstRun) {
            if (this.urlStartPage === 1) {
                this.urlQueryParamValueUpdate(this.urlStartPage);
            }

            this.firstRun = false;
        }

        if (scrolligOption === 'down') {
            $dataPageNumber = this.$el.find('[data-page-number=' + (this.currentPage + 1) + ']');
            screenTrigger = screenHeight * 0.75;

            if ($dataPageNumber.length) {
                pageTriggerPosition = $dataPageNumber[0].getBoundingClientRect().top;
                
                if (pageTriggerPosition < screenTrigger) {
                    this.currentPage++;
                    this.urlQueryParamValueUpdate(this.currentPage);
                }
            }
        } else if (scrolligOption === 'up') {
            $dataPageNumber = this.$el.find('[data-page-number=' + (this.currentPage - 1) + ']');
            screenTrigger = screenHeight * 0.25;

            if ($dataPageNumber.length) {
                pageTriggerPosition = $dataPageNumber[0].getBoundingClientRect().bottom;

                if (pageTriggerPosition > screenTrigger) {
                    this.currentPage--;
                    this.urlQueryParamValueUpdate(this.currentPage);
                }
            }
        } else if (scrolligOption !== '') {
            console.error('updateUrlStartPageParam(scrolligOption): "' + scrolligOption + '" is not a valid argument.');
        }
    }

    /**
     * Adds the spinner
     *
     * @param {String} position
     */
    addSpinner(position) {
        let html = `<div class="${this.options.spinnerClassName} show"></div>`;
        let spinnerHeightPosition;
        let $page;

        return new Promise((resolve, reject) => {
            if (position === 'top') {
                $page = this.$el.find('.' + this.options.pageClassName + ':first');
                $(html).insertBefore($page);
                resolve();
            } else if (position === 'bottom') {
                $page = this.$el.find('.' + this.options.pageClassName + ':last');
                $(html).insertAfter($page);
                resolve();
            }
        });
    }

    /**
     * Removes the spinner
     *
     * @param {Function} cb
     */
    removeSpinner(cb) {
        // return new Promise((resolve, reject) => {
        //     $.when(this.$el.find('.' + this.options.spinnerClassName).remove()).done(() => resolve());
        // });
        console.log($('.' + this.options.spinnerClassName))
        $('.' + this.options.spinnerClassName).remove();
    }

    /**
     * Sets up loading page status
     *
     * @param {String} scrollDir
     * @param {Integer} pageNumber
     */
    loadingPage(scrollDir, pageNumber) {
        let pagesLength = this.$el.find('.' + this.options.pageClassName).length;
        let spinnerPosition = 'top';
        let loadPagePosition = 'ini';
        let removePagePositon = 'last';
        let pageToLoad = (pageNumber - 1);

        if (scrollDir === 'scrollDown') {
            spinnerPosition = 'bottom';
            loadPagePosition = 'end';
            removePagePositon = 'first';
            pageToLoad = pageNumber;
        } else if(scrollDir !== 'scrollUp') {
            return Promise.reject(console.error('loadingPage(scrollDir, pageNumber): "' + scrollDir + '" is not a valid argument.'));
        }
        
        return this.addSpinner(spinnerPosition)
        .then(() => {
            return this.loadPage(loadPagePosition, pageToLoad)
        })
        .then(() => {
            if (pagesLength >= this.options.maxPagesNumber) {
                this.removePage(removePagePositon);
            }
        })
        .then(() => {
            this.removeSpinner();
        });

        return Promise.resolve();
    }

    onScroll() {
        let pages = document.getElementsByClassName(this.options.pageClassName);
        let pageNumber;
        let pageTopPosition;
        let pageBottomPosition;
        const screenTrigger = screenHeight - 50;

        this.scrollValue = $document.scrollTop();

        if (this.prevScroll > this.scrollValue) { // scroll up
            this.updateUrlStartPageParam('up');
            pageTopPosition = Math.abs(pages[0].getBoundingClientRect().top);
            pageBottomPosition = Math.abs(pages[0].getBoundingClientRect().bottom);
            pageNumber = parseInt(pages[0].getAttribute('data-page-number'));

            if (((pageTopPosition - pageBottomPosition) <= screenTrigger) && (pageNumber > 1)) {
                if ($htmlBody.attr('data-processing')) {
                    return;
                }
                $htmlBody.attr('data-processing', '1');
        
                this.loadingPage('scrollUp', pageNumber)
                .finally(() => {
                    $htmlBody.removeAttr('data-processing');
                });
            }
        } else if ((this.prevScroll < this.scrollValue) && (this.prevScroll !== 0)) { // scroll down
            this.updateUrlStartPageParam('down');
            pageTopPosition = Math.abs(pages[(pages.length - 1)].getBoundingClientRect().top);
            pageBottomPosition = Math.abs(pages[(pages.length - 1)].getBoundingClientRect().bottom);

            if (((pageBottomPosition - pageTopPosition) <= screenTrigger) && (this.currentPage < this.options.endPage)) {
                pageNumber = parseInt(pages[(pages.length - 1)].getAttribute('data-page-number')) + 1;

                if ($htmlBody.attr('data-processing')) {
                    return;
                }
                $htmlBody.attr('data-processing', '1');

                this.loadingPage('scrollDown', pageNumber)
                .finally(() => {
                    $htmlBody.removeAttr('data-processing');                    
                });
            }
        }

        this.prevScroll = this.scrollValue;
    }
}

export default HeavenScroll;
