import Chart from './Chart';

export default class Bar extends Chart {
  constructor(settings) {
    super(settings);
    this.period = 1000*60*60*24*31;
    this.dateErrorMessage = "You can select dates only for one month";
    this.setStartDate('2016-04-01');
    this.getData(this.requestURL(this.settings.request));
    
  }
  convertData() {
    let modifiedData = [];
    this.domainScale(this.getMaxMinElements(this.data, 'Cur_OfficialRate'), this.data);

    let scales = this.scales;

    this.data.map((item, i)=> {
      let date = new Date(item.Date);
        modifiedData.push({
            y: scales.y(item.Cur_OfficialRate),
            x: scales.x(date),
            date: item.Date.split('T')[0],
            value: item.Cur_OfficialRate
        });
    })

    if(modifiedData.length != 0){
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
    canvas
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', barWidth-1)
            .attr('fill', '#f90')
            .attr('x', function(d,i){return (barWidth)*i + settings.axis;})
            .attr('y', function(d){ return settings.height - d.y;} )
            .on('mousemove', function(d, ev){
              let x =  d3.mouse(this)[0]++ ;
              let y = d3.mouse(this)[1]++;
              let offsetX = x > settings.width / 2 ? x - 150 : x ;
              let offsetY = y - 67 ;
              let infoPopup = canvas.select('#infoPopup');
                infoPopup.select('.infoPopupDate text').text('Date: ' + d.date);
                infoPopup.select('.infoPopupRate text').text('Rate: ' + d.value + ' Bel. Rub.');

                infoPopup
                      .attr('style', 'display: block; transform: translateX('+ offsetX +'px) translateY('+ offsetY +'px)');  
                    })
            .on('mouseleave', function() {
              canvas.select('#infoPopup').attr('style', 'display: none;');
            })
            .transition()
            .duration(1000)
            
            .attr('height', function(d){return d.y})
      
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
            .attr('class', 'infoPopupRate')
            .append('text')
            .text('max/min: 100/90');

  }
}
