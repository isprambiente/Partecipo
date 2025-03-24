import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="calendar"
export default class extends Controller {
  static targets = [ "container" ]
  static values = {
    days: String,
  }
  connect() {
    this.daysValue.split(' ').forEach( (d) => { 
      if (d !== "") {
        ("calendar-date-" + d) ; document.getElementById("calendar-date-" + d).className += 'has-background-success has-text-white' 
      }
    })
  }
}
