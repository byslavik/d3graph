export default class Chart {
  constructor(settings) {
    let that = this;
    this.settings = settings;
    this.isDataLoaded = false;
    this.isDateChecked = false;
    this.isDenominated = false;
    this.dateOfDenomination = new Date('2016-06-30');
    this.dateErrorMessage = "Please check dates";
    this.dateUpdateMessage = "Dates were updated"
    this.data = [];
    this.alertBlock = document.getElementById('alertBlock');
    this.currIdBlcok = document.getElementById("currId");
    this.startDateBlock = document.getElementById("dateStart");
    this.endDateBlock = document.getElementById("dateEnd");
    this.updateDatesButton = document.getElementById("updateDates");
    
    this.buildCanvas(settings.canvas);
    
    this.currIdBlcok.addEventListener('change', this.setCurrId.bind(this));
    this.updateDatesButton.addEventListener('click', this.updatesDates.bind(this, this.startDateBlock, this.endDateBlock));
  }
  rebuild(){
      let settings = this.settings;
      console.log('rebuild');
    this.clearCanvas();
    this.getData(this.requestURL(settings.request));
      

  }
  isInteger(num){
      return (num ^ 0) === num; 
  }
  domainScale(maxmin, data){
      let dataLength = data.length;

      let settings = this.settings.canvas;
      let settingsRequest = this.settings.request;

      let mindate = new Date(data[0].Date);

      if(data[dataLength-1]) {
          let maxdate = new Date(data[dataLength-1].Date);
          let scales = {
              y: d3.scaleLinear().domain(maxmin).range([settings.height, 0]),
              x: d3.scaleTime().domain([mindate, maxdate]).range([0, settings.width]),
              oX: d3.scaleLinear().domain([0, settings.width]).range([0, dataLength])
          }
          
          this.scales = scales;
      } else {
        this.showMessage('Something wrong with server data.');

        return false;
      }


          
  }
  setCurrId(element) {
      this.settings.request.currId = element.target.value;
      this.rebuild();
  }
  setDenominated(value) {
      this.isDenominated = value;
  }
  formatDashDate(date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    var yyyy = date.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

  formatDotDate(date) {
      var dd = date.getDate();
      if (dd < 10) dd = '0' + dd;

      var mm = date.getMonth() + 1;
      if (mm < 10) mm = '0' + mm;

      var yyyy = date.getFullYear()

      return dd + '.' + mm + '.' + yyyy;
  }
  updatesDates(from, to){
      this.setStartDate(from);
      this.setEndDate(to);

      this.setDenominated(false);

      let dateFrom = new Date(this.settings.request.startDate);
      let dateTo = new Date(this.settings.request.endDate);

      if(this.dateOfDenomination <= dateTo && this.dateOfDenomination >= dateFrom) {
          this.setDenominated(true);
      }

      this.rebuild();
  }
  setStartDate(element){
      if(typeof element == 'object') {
        let newDate = element.value
        this.settings.request.startDate = newDate;

      } else {
          this.startDateBlock.value = element;
          this.settings.request.startDate = element;
      }
      
  }
  setEndDate(element){
      if(typeof element == 'object') {
        let newDate = element.value
        this.settings.request.endDate = newDate;

      } else {
          this.endDateBlock.value = element;
          this.settings.request.endDate = element;
      }
      
      
  }
  getMaxMinElements(data, field) {
      let maxElement = 0;

      for(let item of data) {
          if(item[field] > maxElement) {
              maxElement = item[field]
          }
      }

      let minElement = maxElement;

      for(let item of data) {
          if(item[field] < minElement) {
              minElement = item[field]
          }
      }

      return [minElement, maxElement];
  }
  requestURL(settings){
      return ['https://pdpcurrencyrates.herokuapp.com/api/currency/' + settings.currId + '/' + settings.startDate + '/' + settings.endDate , settings]
  }
 
  getData([url, settings]){

            let promise = new Promise((resolve, reject) => {
                console.log('loading data...');
                this.showMessage('loading data...');
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
                        // console.log(result);
                        this.data = result;
                        this.isDataLoaded = true;
                        this.currIdBlcok.removeAttribute('disabled');
                        this.startDateBlock.removeAttribute('disabled');
                        this.endDateBlock.removeAttribute('disabled');
                        this.clearMessage();
                        this.clearCanvas();
                        this.convertData();

                    },
                    error => {
                        console.log(error);
                });
  }

  showMessage(text) {
      this.alertBlock.innerHTML = text;
  }

  clearMessage(){
      this.alertBlock.innerHTML = '';
  }
  checkDates(dateFrom, dateTo) { //to do : dimension
      dateFrom = Date.parse(dateFrom);
      dateTo = Date.parse(dateTo);

      let between = dateTo - dateFrom;

      if(between > this.period || between < 0){
        this.showMessage(this.dateErrorMessage);
        
        return false;
      }
      this.clearMessage()
      return true;
  }
  clearCanvas() {
      console.log('cleaning...');
      this.canvas.selectAll('*').remove();
  }

  buildCanvas(settings){
      if(!document.getElementById('myCanvas')) {
          this.canvas = d3.select('.wrapper')
                      .append('svg')
                      .attr('width', settings.width + settings.axis + 150)
                      .attr('height', settings.height + settings.axis)
                      .attr('id', 'myCanvas');
      } else {
          this.canvas = d3.select('#myCanvas'); 
      }

  }


}
