


class d3Chart {
    constructor(settings){  
        this.settings = settings;     
        this.isDataLoaded = false;
        this.alertBlock = document.getElementById('alertBlock');
        this.currIdBlcok = document.getElementById("currId");
        this.startDateBlock = document.getElementById("dateStart");
        this.endDateBlock = document.getElementById("dateEnd");
        this.buildCanvas(settings.canvas); 
        this.buildGrid(settings.canvas);     
        this.getData(this.requestURL(settings.request));
        
        var canvas = document.getElementById("myCanvas");
        
        canvas.addEventListener("mousemove", this.canvasHandler.bind(this));
        
        this.currIdBlcok.addEventListener('change', this.setCurrId.bind(this));
        this.startDateBlock.addEventListener('change', this.setStartDate.bind(this));
        this.endDateBlock.addEventListener('change', this.setEndDate.bind(this));

    }
    canvasHandler(e){
        if(this.isDataLoaded){
            let scales = this.domainScale();
            let x = e.offsetX==undefined?e.layerX:e.offsetX;
            let element = this.modifiedData[Math.round(scales.oX(x))];
            if(element){
                this.canvas
                    .select('#areaPointer')
                    .attr('transform', 'translate('+x+', 0)');
                this.canvas
                    .select('#infoDate')
                    .text(element.date.split('T')[0])
                this.canvas
                    .select('#infoCurrency')
                    .text(element.origValue + " BRB")

                this.canvas
                        .select('#circlePointer')
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
        this.clearCanvas();
        this.buildGrid(settings.canvas);     
        this.getData(this.requestURL(settings.request));
    }
    setCurrId(element) {
        console.log(element.target.value);
        this.settings.request.currId = element.target.value;
        this.rebuild();
    } 
    setStartDate(element){
        console.log(element.target.value);
        this.settings.request.startDate = element.target.value;
        this.rebuild();
    }
    setEndDate(element){
        console.log(element.target.value);
        this.settings.request.endDate = element.target.value;
        this.rebuild();
    }
    getData(url){
        let promise = new Promise((resolve, reject) => {
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
                    this.data = result;
                    this.convertData();
                    this.addListeners();
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
                        .x(function(d) { return d.x })
                        .y(function(d) {return d.y})
            
        let group = this.canvas.append('g');

        group.selectAll('path')
                .data([data])
                .enter()
                .append('path')
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', '#000')
                .attr('stroke-width', 2 )
            
    }
    domainScale(){
        let data = this.data;
        let maxmin = this.getMaxMinElements(this.data);
        let dataLength = data.length;
        let settings = this.settings.canvas;

            return {
                y: d3.scaleLinear().domain([maxmin[0], maxmin[1]]).range([settings.height*0.3, settings.height*0.6]),
                x: d3.scaleLinear().domain([0, dataLength]).range([0, settings.width]),
                oX: d3.scaleLinear().domain([0,settings.width ]).range([0, dataLength ])
            }
    }
    convertData(){
        this.clearMessage();
        let scales = this.domainScale();
        let setting = this.settings.canvas;
        let modifiedData = []; 
        let circleData = [];
                      
        this.data.map((item, i)=> {
            modifiedData.push({
                y: setting.height - scales.y(item.Cur_OfficialRate),
                x: scales.x(i), 
                date: item.Date,
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

        console.log(gridSizeH,gridSizeV);
        for(let i = 0; i < gridSizeV; i++){
            this.canvas.append('rect')
                    .attr('fill', '#dddddd')
                    .attr('width', 1)
                    .attr('height', settings.height)
                    .attr('y', 0)
                    .attr('x', i*settings.gridQ)
        }
        for(let i = 0; i < gridSizeH; i++){
            this.canvas.append('rect')
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
        let infoRectGroup = this.canvas.append('g');
        infoRectGroup.append('rect')
                                .attr('width',220)
                                .attr('height', 70)
                                .attr('stroke', '#f0c328')
                                .attr('stroke-width', 1)
                                .attr('fill', '#fff')
                                .attr('x', 10)
                                .attr('y', 10)
        infoRectGroup.append('text')
                        .attr('x', 20)
                        .attr('y', 30)
                        .attr('font-weight', 'bold')
                        .text('Date:')
        infoRectGroup.append('text')
                        .attr('id', 'infoDate')
                        .attr('x', 60)
                        .attr('y', 30)
                        .text('-')
         infoRectGroup.append('text')
                        .attr('x', 20)
                        .attr('y', 60)
                        .attr('font-weight', 'bold')
                        .text('Exchange course:')
        infoRectGroup.append('text')
                        .attr('id', 'infoCurrency')
                        .attr('x', 140)
                        .attr('y', 60)
                        .text('-')
    }
    buildCanvas(settings){
        this.canvas = d3.select('body')
                        .append('svg')
                        .attr('width', settings.width)
                        .attr('height', settings.height)
                        .attr('id', 'myCanvas');
                        
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
        gridQ: 40
    }
};
let newChart = new d3Chart(SETTINGS);
