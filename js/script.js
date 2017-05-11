


class d3Chart {
    constructor(settings){
      let that = this;
        this.settings = settings;
        this.isDataLoaded = false;

        this.alertBlock = document.getElementById('alertBlock');
        this.currIdBlcok = document.getElementById("currId");
        this.startDateBlock = document.getElementById("dateStart");
        this.endDateBlock = document.getElementById("dateEnd");

        this.betweenDates = this.checkDates(settings.request.startDate, settings.request.endDate);

        if(this.betweenDates){
          this.buildCanvas(settings.canvas);
          this.buildGrid(settings.canvas);
          this.getData(this.requestURL(settings.request));

          this.canvas.on("mousemove", function() {that.canvasHandler(d3.mouse(this)) } );
        }

        this.currIdBlcok.addEventListener('change', this.setCurrId.bind(this));
        this.startDateBlock.addEventListener('change', this.setStartDate.bind(this));
        this.endDateBlock.addEventListener('change', this.setEndDate.bind(this));
    }
    canvasHandler(coords){

      // console.log(coords);
        if(this.isDataLoaded){
            let scales = this.scales;
            let x = coords[0];
            let settings = this.settings.canvas;
            // console.log(x);
            let element = this.modifiedData[Math.round(scales.oX(x - settings.axis))];
            if(element){
                this.canvas
                    .select('#areaPointer')
                    .transition()
                    .duration(70)
                    .attr('transform', 'translate(' + x + ', 0)');

                this.canvas
                    .select('#infoDateContainer')
                    .transition()
                    .duration(70)
                    .attr('x', x)
                this.canvas
                    .select('#infoDate')
                    .transition()
                    .duration(70)
                    .attr('x', x+5)
                    .text(element.date.split('T')[0])

                this.canvas
                    .select('#infoCurrencyContainer')
                    .transition()
                    .duration(70)
                    .attr('y', element.y);

                this.canvas
                    .select('#infoCurrency')
                    .transition()
                    .duration(70)
                    .attr('y', element.y+17)
                    .text(element.origValue + " BRB")

                this.canvas
                        .select('#circlePointer')
                        .transition()
                        .duration(70)
                        .attr('cx', x)
                        .attr('cy', element.y)
            }
        }

    }
    showMessage(text) {
        this.alertBlock.innerHTML = text;
    }
    clearMessage(){
        this.alertBlock.innerHTML = '';
    }
    rebuild(){
        let settings = this.settings;
        console.log('rebuild');
        this.betweenDates = this.checkDates(settings.request.startDate, settings.request.endDate);

        if(this.betweenDates){
          this.clearCanvas();
          this.buildGrid(settings.canvas);
          this.getData(this.requestURL(settings.request));
        }
    }
    setCurrId(element) {
        this.settings.request.currId = element.target.value;
        this.rebuild();
    }
    setStartDate(element){
        this.settings.request.startDate = element.target.value;
        this.rebuild();
    }
    setEndDate(element){
        this.settings.request.endDate = element.target.value;
        this.rebuild();
    }
    getData(url){
        let promise = new Promise((resolve, reject) => {
            console.log('loading data...');
            fetch(url)
                .then((response)=>{
                    return response.json()
                })
                .then((data)=>{
                    resolve(data);
                })
                .catch((err)=>{
                    reject(err)
                });
        });

        promise
            .then(
                result => {
                    console.log('data loaded');
                    this.data = result;
                    this.convertData();
                },
                error => {
                    console.log(error);
                }
            );
    }
    getMaxMinElements(data) {
        let maxElement = 0;

        for(let item of data) {
            if(item.Cur_OfficialRate > maxElement) {
                maxElement = item.Cur_OfficialRate
            }
        }

        let minElement = maxElement;

        for(let item of data) {
            if(item.Cur_OfficialRate < minElement) {
                minElement = item.Cur_OfficialRate
            }
        }

        return [minElement, maxElement];
    }
    draw(data) {
        console.log('draw...');
        let line = d3.line()
                        .x((d) => {return d.x})
                        .y((d) => {return d.y})

        let group = this.canvas.append('g');

        group.selectAll('path')
                .data([data])
                .enter()
                .append('path')
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', 'blue')
                .attr('stroke-width', 2 )
                .attr('style', "transform: translateX(30px)" );

        console.log('done');
        this.buildAxis();

    }
    domainScale(){
        let data = this.data;
        let maxmin = this.getMaxMinElements(data);
        let dataLength = data.length;
        let settings = this.settings.canvas;
        let settingsRequest = this.settings.request;
        let mindate = new Date(settingsRequest.startDate),
            maxdate = new Date(settingsRequest.endDate);

        let scales = {
                y: d3.scaleLinear().domain([maxmin[0], maxmin[1]]).range([settings.height, 0]),
                x: d3.scaleTime().domain([mindate, maxdate]).range([0, settings.width]),
                oX: d3.scaleLinear().domain([0, settings.width]).range([0, dataLength])
            }



            this.scales = scales;
    }
    buildAxis() {
      let scales = this.scales;
      let settings = this.settings.canvas;

      this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
      this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height  + 'px)').call(d3.axisBottom(scales.x));
    }
    formatDate(date) {
        var dd = date.getDate();
        if (dd < 10) dd = '0' + dd;

        var mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;

        var yyyy = date.getFullYear()

        return dd + '.' + mm + '.' + yyyy;
    }
    convertData(){
        this.clearMessage();
        this.domainScale();

        let scales = this.scales;

        let settings = this.settings.canvas;
        let modifiedData = [];
        let circleData = [];
        this.data.map((item, i)=> {
          let date = new Date(item.Date)
            modifiedData.push({
                y: scales.y(item.Cur_OfficialRate),
                x: scales.x(date),
                date: this.formatDate(date),
                origValue: item.Cur_OfficialRate
            });
        })
        if(modifiedData.length != 0){
            this.modifiedData = modifiedData;

            this.isDataLoaded = true;
            this.draw(modifiedData);
            this.addPointer();
            this.addInfoBlock();
        } else {
            this.showMessage('Something wrong. Please, verify your settings ant try again');
        }

    }
    clearCanvas() {
        console.log('cleaning...');
        this.canvas.selectAll('*').remove();
    }
    buildGrid(settings){
        let gridSizeH = settings.height / settings.gridQ;
        let gridSizeV = settings.width / settings.gridQ;
        let gridGroup = this.canvas.append('g')
                                    .attr('style', 'transform: translateX(' + settings.axis + 'px)');

        for(let i = 0; i < gridSizeV; i++){
            gridGroup.append('rect')
                    .attr('fill', '#dddddd')
                    .attr('width', 1)
                    .attr('height', settings.height)
                    .attr('y', 0)
                    .attr('x', i*settings.gridQ)
        }
        for(let i = 0; i < gridSizeH; i++){
            gridGroup.append('rect')
                    .attr('fill', '#dddddd')
                    .attr('height', 1)
                    .attr('width', settings.width)
                    .attr('x', 0)
                    .attr('y', settings.height - i*settings.gridQ)
        }

    }
    addPointer(){
        let settings = this.settings.canvas;
        this.canvas.append('rect')
                        .attr('width', 1)
                        .attr('x', -1)
                        .attr('y', 0)
                        .attr('height', settings.height)
                        .attr('fill', '#000')
                        .attr('id', 'areaPointer');
        this.canvas.append('circle')
                      .attr('cx', -3)
                      .attr('r', 3)
                      .attr('cy', -3)
                      .attr('fill', 'red')
                      .attr('id', 'circlePointer')
    }
    addInfoBlock(){
        let canvasSettings = this.settings.canvas;
        let infoDateGroup = this.canvas.append('g');
        infoDateGroup.append('rect')
                                .attr('id', 'infoDateContainer')
                                .attr('width', 70)
                                .attr('height', 23)
                                .attr('stroke', '#f0c328')
                                .attr('stroke-width', 1)
                                .attr('fill', '#fff')
                                .attr('x', -300)
                                .attr('y', canvasSettings.height+2);

        infoDateGroup.append('text')
                            .attr('id', 'infoDate')
                            .attr('x', -300)
                            .attr('y', canvasSettings.height+18);


        let infoCurrGroup = this.canvas.append('g');
        infoCurrGroup.append('rect')
                                .attr('id', 'infoCurrencyContainer')
                                .attr('width',80)
                                .attr('height', 23)
                                .attr('stroke', '#f0c328')
                                .attr('stroke-width', 1)
                                .attr('fill', '#fff')
                                .attr('x', canvasSettings.width + canvasSettings.axis)
                                .attr('y', -30)

        infoCurrGroup.append('text')
                            .attr('id', 'infoCurrency')
                            .attr('x', canvasSettings.width + canvasSettings.axis+5)
                            .attr('y', -30)

    }
    buildCanvas(settings){
        this.canvas = d3.select('body')
                        .append('svg')
                        .attr('width', settings.width + settings.axis + 150)
                        .attr('height', settings.height + settings.axis)
                        .attr('id', 'myCanvas');


    }
    checkDates(dateFrom, dateTo) {
        dateFrom = Date.parse(dateFrom);
        dateTo = Date.parse(dateTo);

        let between = (dateTo - dateFrom)/(1000*60*60*24*365);
        between = between.toFixed(2);
        if(between > 1 || between < 0){
          console.log(false);
          this.showMessage('you can select dates only for one year');
          return false;
        }

        return true;
    }

    requestURL(settings){
        return 'http://www.nbrb.by/API/ExRates/Rates/Dynamics/' + settings.currId + '?startDate=' + settings.startDate + '&endDate=' + settings.endDate
    }

}
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
let newChart = new d3Chart(SETTINGS);
