import Chart from './Chart';

export default class Amplitude extends Chart {
  constructor(settings) {
    super(settings);
    this.period = 1000*60*60*24*366;
    this.dateErrorMessage = "You can select dates only for one year";

    
    this.setStartDate('2015-05-01');
    this.getData(this.requestURL(this.settings.request));
  }
  convertData() {
    let modifiedData = [];

    this.data.map((item, i)=> {
      let month = new Date(item.Date).getMonth();
      let year = new Date(item.Date).getFullYear();

        if(!modifiedData[month]){
            modifiedData[month] = {};
            modifiedData[month].items = [];
            modifiedData[month].year = year;
            modifiedData[month].month = month;
        }
          modifiedData[month].items.push(item);

    })

    let result = modifiedData.map((item, i)=>{
      let maxmin = this.getMaxMinElements(item.items, 'Cur_OfficialRate');

      let max = maxmin[1];
      let min = maxmin[0];
      

      return {
        month: item.month + 1,
        year: item.year,
        ampl: max - min,
        max: max,
        min: min
      }
    });

    // result = result.reverse();

    let maxminAmpl = this.getMaxMinElements(result, 'ampl');

    this.domainScale(maxminAmpl, result);

    if(modifiedData.length != 0){
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
    canvas
          .selectAll('rect')
          .data(data)
          .enter()
          .append('rect')
          .attr('width', barWidth)
          .attr('fill', '#f90')
          .attr('x', function(d,i){return (barWidth + 5)*i + settings.axis;})
          .attr('y', function(d){ return scales.y(d.ampl);} )
          .on('mousemove', function(d, ev){
              let x =  d3.mouse(this)[0]++ ;
              let y = d3.mouse(this)[1]++;
              let offsetX = x > settings.width / 2 ? x - 150 : x ;
              let offsetY = y - 67 ;
              let infoPopup = canvas.select('#infoPopup');
                infoPopup.select('.infoPopupDate text').text('Month: ' + d.month + '.' + d.year);
                infoPopup.select('.infoPopupMaxMin text').text('Max/Min: ' + d.max + '/' + d.min);
                infoPopup.select('.infoPopupAmpl text').text('Amplitude: ' + Math.round(d.ampl));

                infoPopup
                      .attr('style', 'display: block; transform: translateX('+ offsetX +'px) translateY('+ offsetY +'px)');  
                    })
          .on('mouseleave', function() {
            canvas.select('#infoPopup').attr('style', 'display: none;');
          })
          .transition()
          .duration(1000)
          .attr('height', function(d){ return settings.height - scales.y(d.ampl)})
  
  
      this.drawInfoBox();
      
  }
  
  drawInfoBox() {
      let group = this.canvas.append('g').attr('id', "infoPopup");

      group.append('rect');

      group.append('g')
            .attr('class', 'infoPopupDate')
            .append('text')
            .text('Date: 01.2016');
        
      group.append('g')
            .attr('class', 'infoPopupMaxMin')
            .append('text')
            .text('max/min: 100/90');

      group.append('g')
            .attr('class', 'infoPopupAmpl')
            .append('text')
            .text('Amplitude: 10');
  }
}
