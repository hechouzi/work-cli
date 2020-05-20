export default {
/**
* 获取元素父级元素
* @param el // 当前对象
* @param parentSelector // 父级对象
* @return {*}
*/
  getParents (el, parentSelector /* optional */) {
    if (parentSelector === undefined) {
      parentSelector = ''
    }

    var p = el.parentNode
    while (p.className.indexOf(parentSelector) === -1) {
      p = p.parentNode
      if (p.tagName === 'HTML') return
    }
    return p
  }
}
