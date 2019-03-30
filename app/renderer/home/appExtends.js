class AppExtend {
  find(query) {
    return this.view.querySelector(query)
  }
  bind() {
    this.view.addEventListener('click', event => {
      let target = event.target
      while(target.parentNode) {
        if (target === this.view || target === document.body) {
          break
        }
        if (target.dataset.click) {
          this.bindEvent().clicks[target.dataset.click](event)
          break
        }
        target = target.parentNode
      }
    })
    this.view.addEventListener('mouseenter', () =>  {
      this.view.classList.add('app-hover')
    })
    this.view.addEventListener('mouseleave', () => {
      this.view.classList.remove('app-hover')
    })
  }
  bindOthre() {
    const focusEvent = this.bindEvent().focus
    const blurEvent = this.bindEvent().blur
    Object.keys(focusEvent).forEach(key => {
      this.find(`[data-focus=${key}]`) 
      && this.find(`[data-focus=${key}]`).addEventListener('focus', focusEvent[key])
    })
    Object.keys(blurEvent).forEach(key => {
      this.find(`[data-blur=${key}]`) 
      && this.find(`[data-blur=${key}]`).addEventListener('blur', blurEvent[key])
    })
  }
}

module.exports = AppExtend