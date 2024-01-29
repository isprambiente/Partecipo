// Visit The Stimulus Handbook for more details 
// https://stimulusjs.org/handbook/introduction
// 
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>
import { Controller } from "@hotwired/stimulus"
import SlimSelect from 'slim-select'

export default class extends Controller {
  static targets = [ 'simple', 'user', 'editor' ]

  connect() {
    if (this.hasSimpleTarget) {this.simpleTargets.forEach(element => this.simple(element))}
    if (this.hasUserTarget) {this.userTargets.forEach(element => this.user(element))}
    if (this.hasEditorTarget) {this.editorTargets.forEach(element => this.editor(element))}
  }

  simple(element) {
    new SlimSelect({ select: element })
  }

  user(element) {
    this.ajax(element, '/editor/users/list.json?')
  }

  editor(element) {
    this.ajax(element, '/admin/users/list.json?filter[editor]=1&')
  }

  get_data(element) {
    [{text: element.getAttribute("data-text"), value: element.getAttribute("data-value")}]
  }

  ajax(element, url) {
    new SlimSelect({
      select: element,
      placeholder: 'Seleziona un utente',
      searchingText: 'Sto cercando...',
      searchPlaceholder:  'Digita per ricercare',
      searchText: 'Nessun risultato',
      allowDeselect: true,
      ajax: function (search, callback) {
        // Check search value. If you dont like it callback(false) or callback('Message String')
        if (search.length < 3) {
          callback('Inserire almeno 3 caratteri')
          return
        }

        // Perform your own ajax request here
        fetch(`${url}filter[text]=${search}`)
        .then(function (response) { return response.json() })
        .then(function (json) {
          let data = []
          for (let i = 0; i < json.users.length; i++) {
            data.push({text: json.users[i].email, value: json.users[i].id})
          }
          callback(data)
        })
        .catch(function(error) { callback(false) })
      }
    })
  }

}
