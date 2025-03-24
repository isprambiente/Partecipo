import Timeout from 'smart-timeout'
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "sender", "daySelect", "category", "scope", "calendar" ]

  sendForm(event) {
   this.element.requestSubmit();
  }
  
  delayedSendForm(event) {
    if ( Timeout.exists('textDelay') ) { Timeout.clear('textDelay', true) }
    Timeout.set('textDelay', () => {this.sendForm(event);}, 750)
  }

  exportPDF(event) {
    this.exportFORM(event, ".pdf")
  }

  exportCSV(event) {
    this.exportFORM(event, ".csv")
  }

  exportFORM(event, format) {
    let action = this.senderTarget.action
    this.senderTarget.action = action + format
    this.senderTarget.target = "_blank"
    this.senderTarget.requestSubmit()
    this.senderTarget.action = action
    this.senderTarget.target = ""
  }

  getDate(event) {
    this.daySelectTargets.forEach( (e) => { e.value = event.params['date']})
    this.senderTarget.requestSubmit()
  }

  updateCalendar(event) {
    console.log('Partito')
    let [category, scope] = ['','']
    if (this.hasCategoryTarget) { category = this.categoryTarget.value }
    if (this.hasScopeTarget) { category = this.scopeTarget.value }
    console.log(category)
    this.calendarTarget.setAttribute('src',`/it/happenings/calendar?filter[category]=${category}&filter[scope]=${scope}`)
  } 
}
