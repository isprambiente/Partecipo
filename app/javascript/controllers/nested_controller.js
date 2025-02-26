import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="nested"
export default class extends Controller {
  static targets = [ 'content', 'template' ]

  add(event) {
    event.preventDefault()
    let clone = document.createElement('div')
    clone.setAttribute('class', this.templateTarget.getAttribute('class'))
    clone.dataset.target = 'nested.entry'
    clone.innerHTML = this.templateTarget.innerHTML
    this.contentTarget.appendChild(clone)
    let index = this.templateTarget.dataset.index
    let newIndex = this.contentTarget.children.length + 1
    clone.querySelectorAll('[name]').forEach( (field) => { 
      //field.setAttribute('name', field.getAttribute('name').replace(`[${index}]`, `[${newIndex}]`))
      this.setAttribute(field, 'name', `[${index}]`, `[${newIndex}]`)
      //field.setAttribute('id', field.getAttribute('name').replace(`[${index}]`, `[${newIndex}]`))
      this.setAttribute(field, 'id', `_${index}_`, `_${newIndex}_`)
    } )
    clone.querySelectorAll('[for]').forEach( (field) => { 
      // field.setAttribute('for', field.getAttribute('for').replace(`_${index}_`, `_${newIndex}_`))
      this.setAttribute(field, 'for', `_${index}_`, `_${newIndex}_`)
    } )   
  }

  setAttribute(field, name, key, newKey) {
    field.setAttribute(name, field.getAttribute(name).replace(key, newKey))
  }
}
