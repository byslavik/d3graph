/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Chart {
    constructor(settings) {
        console.log(settings);
        let that = this;
        this.settings = settings;
        this.isDataLoaded = false;
        this.isDateChecked = false;
        this.dateErrorMessage = "Please check dates";

        this.alertBlock = document.getElementById('alertBlock');
        this.currIdBlcok = document.getElementById("currId");
        this.startDateBlock = document.getElementById("dateStart");
        this.endDateBlock = document.getElementById("dateEnd");

        this.buildCanvas(settings.canvas);

        this.currIdBlcok.addEventListener('change', this.setCurrId.bind(this));
        this.startDateBlock.addEventListener('change', this.setStartDate.bind(this));
        this.endDateBlock.addEventListener('change', this.setEndDate.bind(this));
    }
    rebuild() {
        let settings = this.settings;
        console.log('rebuild');
        this.clearCanvas();
        this.getData(this.requestURL(settings.request));
    }
    domainScale(maxmin, data) {
        let dataLength = data.length;

        let settings = this.settings.canvas;
        let settingsRequest = this.settings.request;

        let mindate = new Date(settingsRequest.startDate),
            maxdate = new Date(settingsRequest.endDate);

        let scales = {
            y: d3.scaleLinear().domain(maxmin).range([settings.height, 0]),
            x: d3.scaleTime().domain([mindate, maxdate]).range([0, settings.width]),
            oX: d3.scaleLinear().domain([0, settings.width]).range([0, dataLength])
        };

        this.scales = scales;
    }
    setCurrId(element) {
        this.settings.request.currId = element.target.value;
        this.rebuild();
    }
    setStartDate(element) {
        if (typeof element == 'object') {
            this.settings.request.startDate = element.target.value;
        } else {
            this.startDateBlock.value = element;
            this.settings.request.startDate = element;
        }
        console.log(element);
        this.rebuild();
    }
    setEndDate(element) {
        this.settings.request.endDate = element.target.value;
        this.rebuild();
    }
    getMaxMinElements(data, field) {
        let maxElement = 0;

        for (let item of data) {
            if (item[field] > maxElement) {
                maxElement = item[field];
            }
        }

        let minElement = maxElement;

        for (let item of data) {
            if (item[field] < minElement) {
                minElement = item[field];
            }
        }

        return [minElement, maxElement];
    }
    requestURL(settings) {
        return ['http://www.nbrb.by/API/ExRates/Rates/Dynamics/' + settings.currId + '?startDate=' + settings.startDate + '&endDate=' + settings.endDate, settings];
    }
    getData([url, settings]) {
        this.checkDates(settings.startDate, settings.endDate);
        if (this.isDateChecked) {

            let promise = new Promise((resolve, reject) => {
                console.log('loading data...');
                this.showMessage('loading data...');
                fetch(url).then(response => {
                    return response.json();
                }).then(data => {
                    resolve(data);
                }).catch(err => {
                    reject(err);
                });
            });

            promise.then(result => {
                console.log('data loaded');
                this.data = result;
                this.isDataLoaded = true;
                this.clearMessage();
                this.clearCanvas();
                this.convertData();
            }, error => {
                console.log(error);
            });
        }
    }

    showMessage(text) {
        this.alertBlock.innerHTML = text;
    }

    clearMessage() {
        this.alertBlock.innerHTML = '';
    }

    checkDates(dateFrom, dateTo) {
        //to do : dimension
        dateFrom = Date.parse(dateFrom);
        dateTo = Date.parse(dateTo);

        let between = dateTo - dateFrom;

        if (between > this.period || between < 0) {
            this.showMessage(this.dateErrorMessage);
            this.isDateChecked = false;

            return;
        }
        this.clearMessage();
        this.isDateChecked = true;
    }

    clearCanvas() {
        console.log('cleaning...');
        this.canvas.selectAll('*').remove();
    }

    buildCanvas(settings) {
        if (!document.getElementById('myCanvas')) {
            this.canvas = d3.select('body').append('svg').attr('width', settings.width + settings.axis + 150).attr('height', settings.height + settings.axis).attr('id', 'myCanvas');
        } else {
            this.canvas = d3.select('#myCanvas');
        }
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Chart;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Chart__ = __webpack_require__(0);


class Amplitude extends __WEBPACK_IMPORTED_MODULE_0__Chart__["a" /* default */] {
    constructor(settings) {
        super(settings);
        this.period = 1000 * 60 * 60 * 24 * 366;
        this.dateErrorMessage = "You can select dates only for one year";

        this.setStartDate('2015-05-01');
        this.getData(this.requestURL(this.settings.request));
    }
    convertData() {
        let modifiedData = [];

        this.data.map((item, i) => {
            let month = new Date(item.Date).getMonth();
            let year = new Date(item.Date).getFullYear();

            if (!modifiedData[month]) {
                modifiedData[month] = {};
                modifiedData[month].items = [];
                modifiedData[month].year = year;
                modifiedData[month].month = month;
            }
            modifiedData[month].items.push(item);
        });

        let result = modifiedData.map((item, i) => {
            let maxmin = this.getMaxMinElements(item.items, 'Cur_OfficialRate');

            let max = maxmin[1];
            let min = maxmin[0];

            return {
                month: item.month + 1,
                year: item.year,
                ampl: max - min,
                max: max,
                min: min
            };
        });

        // result = result.reverse();

        let maxminAmpl = this.getMaxMinElements(result, 'ampl');

        this.domainScale(maxminAmpl, result);

        if (modifiedData.length != 0) {
            this.modifiedData = result;

            this.isDataLoaded = true;
            this.draw(result);
        } else {
            this.showMessage('Something wrong. Please, verify your settings ant try again');
        }
    }
    buildAxis() {
        let scales = this.scales;
        let settings = this.settings.canvas;
        let maxmin = this.getMaxMinElements(this.modifiedData, 'ampl');
        this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
        // this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height  + 'px)').call(d3.axisBottom(scales.x));
    }

    draw(data) {
        let settings = this.settings.canvas;
        let scales = this.scales;
        let canvas = this.canvas;

        // let infoPopup = canvas.select('#infoPopup');
        this.clearMessage();
        this.buildAxis();

        let barWidth = settings.width / data.length - 5;
        canvas.selectAll('rect').data(data).enter().append('rect').attr('width', barWidth).attr('fill', '#f90').attr('x', function (d, i) {
            return (barWidth + 5) * i + settings.axis;
        }).attr('y', function (d) {
            return scales.y(d.ampl);
        }).on('mousemove', function (d, ev) {
            let x = d3.mouse(this)[0]++;
            let y = d3.mouse(this)[1]++;
            let offsetX = x > settings.width / 2 ? x - 150 : x;
            let offsetY = y - 67;
            let infoPopup = canvas.select('#infoPopup');
            infoPopup.select('.infoPopupDate text').text('Month: ' + d.month + '.' + d.year);
            infoPopup.select('.infoPopupMaxMin text').text('Max/Min: ' + d.max + '/' + d.min);
            infoPopup.select('.infoPopupAmpl text').text('Amplitude: ' + Math.round(d.ampl));

            infoPopup.attr('style', 'display: block; transform: translateX(' + offsetX + 'px) translateY(' + offsetY + 'px)');
        }).on('mouseleave', function () {
            canvas.select('#infoPopup').attr('style', 'display: none;');
        }).transition().duration(1000).attr('height', function (d) {
            return settings.height - scales.y(d.ampl);
        });

        this.drawInfoBox();
    }

    drawInfoBox() {
        let group = this.canvas.append('g').attr('id', "infoPopup");

        group.append('rect');

        group.append('g').attr('class', 'infoPopupDate').append('text').text('Date: 01.2016');

        group.append('g').attr('class', 'infoPopupMaxMin').append('text').text('max/min: 100/90');

        group.append('g').attr('class', 'infoPopupAmpl').append('text').text('Amplitude: 10');
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Amplitude;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Chart__ = __webpack_require__(0);


class Bar extends __WEBPACK_IMPORTED_MODULE_0__Chart__["a" /* default */] {
  constructor(settings) {
    super(settings);
    this.period = 1000 * 60 * 60 * 24 * 31;
    this.dateErrorMessage = "You can select dates only for one month";
    this.setStartDate('2016-04-01');
    this.getData(this.requestURL(this.settings.request));
  }
  convertData() {
    let modifiedData = [];
    this.domainScale(this.getMaxMinElements(this.data, 'Cur_OfficialRate'), this.data);

    let scales = this.scales;

    this.data.map((item, i) => {
      let date = new Date(item.Date);
      modifiedData.push({
        y: scales.y(item.Cur_OfficialRate),
        x: scales.x(date),
        date: item.Date.split('T')[0],
        value: item.Cur_OfficialRate
      });
    });

    if (modifiedData.length != 0) {
      this.modifiedData = modifiedData;

      this.isDataLoaded = true;
      this.draw(modifiedData);
    } else {
      this.showMessage('Something wrong. Please, verify your settings ant try again');
    }
  }
  buildAxis() {
    let scales = this.scales;
    let settings = this.settings.canvas;

    this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
    // this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height  + 'px)').call(d3.axisBottom(scales.x));
  }

  draw(data) {
    let settings = this.settings.canvas;
    let canvas = this.canvas;
    this.buildAxis();

    let barWidth = settings.width / data.length;
    canvas.selectAll('rect').data(data).enter().append('rect').attr('width', barWidth - 1).attr('fill', '#f90').attr('x', function (d, i) {
      return barWidth * i + settings.axis;
    }).attr('y', function (d) {
      return settings.height - d.y;
    }).on('mousemove', function (d, ev) {
      let x = d3.mouse(this)[0]++;
      let y = d3.mouse(this)[1]++;
      let offsetX = x > settings.width / 2 ? x - 150 : x;
      let offsetY = y - 67;
      let infoPopup = canvas.select('#infoPopup');
      infoPopup.select('.infoPopupDate text').text('Date: ' + d.date);
      infoPopup.select('.infoPopupRate text').text('Rate: ' + d.value + ' Bel. Rub.');

      infoPopup.attr('style', 'display: block; transform: translateX(' + offsetX + 'px) translateY(' + offsetY + 'px)');
    }).on('mouseleave', function () {
      canvas.select('#infoPopup').attr('style', 'display: none;');
    }).transition().duration(1000).attr('height', function (d) {
      return d.y;
    });

    this.drawInfoBox();
  }

  drawInfoBox() {
    let group = this.canvas.append('g').attr('id', "infoPopup");

    group.append('rect');

    group.append('g').attr('class', 'infoPopupDate').append('text').text('Date: 01.2016');

    group.append('g').attr('class', 'infoPopupRate').append('text').text('max/min: 100/90');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Bar;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Chart__ = __webpack_require__(0);


class Graph extends __WEBPACK_IMPORTED_MODULE_0__Chart__["a" /* default */] {
    constructor(settings) {
        super(settings);

        let that = this;
        this.period = 1000 * 60 * 60 * 24 * 366;
        this.dateErrorMessage = "You can select dates only for one year";

        this.setStartDate('2015-05-01');
        this.checkDates(settings.request.startDate, settings.request.endDate);

        if (this.isDateChecked) {
            this.getData(this.requestURL(this.settings.request));

            this.canvas.on("mousemove", function () {
                that.canvasHandler(d3.mouse(this));
            });
        }
    }
    draw(data) {
        console.log('draw...');

        let group = this.canvas.append('g');

        let line = d3.line().x(d => {
            return d.x;
        }).y(d => {
            return d.y;
        });

        var path = group.selectAll('path').data([data]).enter().append('path').attr('d', line).attr('fill', 'none').attr('stroke', 'blue').attr('stroke-width', 2).attr('style', "transform: translateX(30px)");

        console.log('done');
        this.buildAxis();
    }

    buildAxis() {
        let scales = this.scales;
        let settings = this.settings.canvas;

        this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
        this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height + 'px)').call(d3.axisBottom(scales.x));
    }

    formatDate(date) {
        var dd = date.getDate();
        if (dd < 10) dd = '0' + dd;

        var mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;

        var yyyy = date.getFullYear();

        return dd + '.' + mm + '.' + yyyy;
    }
    convertData() {
        this.clearMessage();
        this.domainScale(this.getMaxMinElements(this.data, 'Cur_OfficialRate'), this.data);

        let scales = this.scales;

        let settings = this.settings.canvas;
        let modifiedData = [];

        this.data.map((item, i) => {
            let date = new Date(item.Date);
            modifiedData.push({
                y: scales.y(item.Cur_OfficialRate),
                x: scales.x(date),
                date: this.formatDate(date),
                origValue: item.Cur_OfficialRate
            });
        });
        if (modifiedData.length != 0) {
            this.modifiedData = modifiedData;
            this.isDataLoaded = true;
            this.draw(modifiedData);
            this.addPointer();
            this.addInfoBlock();
        } else {
            this.showMessage('Something wrong. Please, verify your settings ant try again');
        }
    }
    addPointer() {
        let settings = this.settings.canvas;
        this.canvas.append('rect').attr('width', 1).attr('x', -1).attr('y', 0).attr('height', settings.height).attr('fill', '#000').attr('id', 'areaPointer');
        this.canvas.append('circle').attr('cx', -3).attr('r', 3).attr('cy', -3).attr('fill', 'red').attr('id', 'circlePointer');
    }
    addInfoBlock() {
        let canvasSettings = this.settings.canvas;
        let infoDateGroup = this.canvas.append('g');
        infoDateGroup.append('rect').attr('id', 'infoDateContainer').attr('width', 70).attr('height', 23).attr('stroke', '#f0c328').attr('stroke-width', 1).attr('fill', '#fff').attr('x', -300).attr('y', canvasSettings.height + 2);

        infoDateGroup.append('text').attr('id', 'infoDate').attr('x', -300).attr('y', canvasSettings.height + 18);

        let infoCurrGroup = this.canvas.append('g');
        infoCurrGroup.append('rect').attr('id', 'infoCurrencyContainer').attr('width', 80).attr('height', 23).attr('stroke', '#f0c328').attr('stroke-width', 1).attr('fill', '#fff').attr('x', canvasSettings.width + canvasSettings.axis).attr('y', -30);

        infoCurrGroup.append('text').attr('id', 'infoCurrency').attr('x', canvasSettings.width + canvasSettings.axis + 5).attr('y', -30);
    }
    canvasHandler(coords) {

        // console.log(coords);
        if (this.isDataLoaded) {
            let scales = this.scales;
            let x = coords[0];
            let settings = this.settings.canvas;
            // console.log(x);
            let element = this.modifiedData[Math.round(scales.oX(x - settings.axis))];
            if (element) {
                this.canvas.select('#areaPointer').transition().duration(70).attr('transform', 'translate(' + x + ', 0)');

                this.canvas.select('#infoDateContainer').transition().duration(70).attr('x', x);
                this.canvas.select('#infoDate').transition().duration(70).attr('x', x + 5).text(element.date.split('T')[0]);

                this.canvas.select('#infoCurrencyContainer').transition().duration(70).attr('y', element.y);

                this.canvas.select('#infoCurrency').transition().duration(70).attr('y', element.y + 17).text(element.origValue + " BRB");

                this.canvas.select('#circlePointer').transition().duration(70).attr('cx', x).attr('cy', element.y);
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Graph;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__pieces_Graph__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__pieces_Bar__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__pieces_Amplitude__ = __webpack_require__(1);




const SETTINGS = {
    request: {
        currId: 190,
        startDate: '2015-5-1',
        endDate: '2016-5-1'
    },
    canvas: {
        width: 700,
        height: 500,
        gridQ: 40,
        axis: 30
    }
};

// let graphChart = new Graph(SETTINGS);
// let barChart = new Bar(SETTINGS);
// let amplitudeChart = new Amplitude(SETTINGS);
//
let typeSelector = document.getElementById('type');

function changeView(ev) {
    switch (ev.target.value) {
        case 'bar':
            let bar = new __WEBPACK_IMPORTED_MODULE_1__pieces_Bar__["a" /* default */](SETTINGS);
            break;
        case 'ampl':
            let ampl = new __WEBPACK_IMPORTED_MODULE_2__pieces_Amplitude__["a" /* default */](SETTINGS);
            break;
        case 'dia':
            let dia = new __WEBPACK_IMPORTED_MODULE_0__pieces_Graph__["a" /* default */](SETTINGS);
            break;
    }
}

typeSelector.addEventListener('change', changeView);

/***/ })
/******/ ]);