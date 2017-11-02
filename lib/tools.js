let URI = require('urijs')
let _ = require('lodash')
let changeCase = require('change-case')
const protractor = require('protractor')

module.exports = function () {
  // Get the parameters from the browser objets
  let baseUrl = URI(browser.params.baseUrl)

  /**
   * Return the URL of a specific route in the web application.
   * @param {*} fragment Fragment representing the state
   */
  function buildUri (fragment) {
    return URI(baseUrl).fragment(fragment).toString()
  }

  /**
   * Get the browser to the webapp page.
   */
  function getWebapp () {
  // Get the browser to the single page app.
    browser.get(baseUrl.toString())
  }

  /**
   * @returns true if the object is a locator.
   * @param {*} x 
   */
  function isLocator (x) {
    const locatorMatcher = /By\(.*\)/
    const jsMatcher = /function \(driver\).*/
    return x && (
      (typeof x.findElementsOverride === 'function') || 
      (typeof x === 'object' && locatorMatcher.test(x.toString())) || 
      (typeof x === 'function' && jsMatcher.test(x.toString()))
    )
  }

  /** 
   * Convert an object to a element finder. 
   */
  function toElementFinder (obj) {
    if (_.isString(obj)) {
      return element(by.id(obj))
    } else if (isLocator(obj)) {
      return element(obj)
    } else {
      return obj
    }
  }

  function pushButton (elem) {
    elem = toElementFinder(elem)
    scrollTo(elem)
    return elem.click()
  }
  selectMenu = pushButton;

  function enterData (elem, data) {
    elem = toElementFinder(elem)
    scrollTo(elem)
    return elem.clear().sendKeys(data)
  }

  function readData (elem) {
    elem = toElementFinder(elem)
    scrollTo(elem)
    return elem.getAttribute('value')()
  }

  function maximizeWin () {
    browser.driver.manage().window().maximize()
  }

  function scrollTo (elem) {
    elem = toElementFinder(elem)
    elem.getLocation().then(function (loc) {
      return browser.driver.executeScript('window.scrollTo(0,arguments[0]);', loc.y)
    })
  }

  // Intenal function to get the locator
  function getLocatorFromMeta (contextField, meta) {
    if (!meta) {
      return by.id(contextField)
    } else if (_.isString(meta.id)) {
      return by.id(meta.id)
    } else if (_.isString(meta.css)) {
      return by.css(meta.css)
    } else if (_.isString(meta.xpath)) {
      return by.xpath(meta.xpath)
    } else if (meta.locator) {
      return meta.locator
    } else {
      return by.id(contextField)
    }
  }

  /**
   * Build a standard page object module.
   * @param {*} base The base descriptor. Each instance can override it.
   */
  function buildPageObjectModule (base) {
    return (obj) => {
      let finalDescriptor = Object.assign({}, base, obj)
      return buildPageObject(finalDescriptor)
    }
  }

  /**
   * Build standard page objects from a descriptor object.
   */
  function buildPageObject (obj) {
    let result = {}

    // Nothing to do...
    if (!_.isObject(obj)) return result

    // Build fields
    let fields = obj.fields
    if (_.isObject(fields)) {
      for (let fieldKey of Object.keys(fields)) {
        let metadata = fields[fieldKey]
        let fieldName = changeCase.pascalCase(fieldKey)
        let locator = getLocatorFromMeta(fieldKey, metadata)

        result['enter' + fieldName] = enterData.bind(result, locator)
        result['read' + fieldName] = readData.bind(result, locator)
      }
    }

    // Build buttons
    let buttons = obj.buttons
    if (_.isObject(buttons)) {
      for (let buttonKey of Object.keys(buttons)) {
        let metadata = buttons[buttonKey]
        let buttonName = changeCase.pascalCase(buttonKey)

        let locator = getLocatorFromMeta(buttonKey, metadata)
        result['press' + buttonName] = pushButton.bind(result, locator)
      }
    }

    // Add others
    let others = obj.others
    if (_.isObject(others)) {
      for (let otherKey of Object.keys(others)) {
        let other = others[otherKey]
        if (_.isFunction(other)) {
          result[otherKey] = other.bind(result)
        }
      }
    }

    return result
  }

  return {
    buildUri,
    isLocator,
    toElementFinder,
    getWebapp,
    selectMenu,
    pushButton,
    enterData,
    readData,
    maximizeWin,
    scrollTo,
    buildPageObjectModule,
    buildPageObject
  }
}
