const rewire = require('rewire')
const expect = require('chai').expect
const sinon = require('sinon')
const protractor = require('protractor')
const toolsFactory = rewire('../lib/tools')

let browser = {
  params: {
    baseUrl: 'http://localhost/test'
  },
  get: sinon.spy(),
  driver: {
    manage: () => browser.driver.manageObj,
    manageObj: {
      window: () => browser.driver.manageObj.windowObj,
      windowObj: {
        maximize: sinon.stub()
      }
    }
  },
}
const element = sinon.stub()
const by = {
  id: sinon.stub()
}
toolsFactory.__set__('browser', browser)
toolsFactory.__set__('element', element)
toolsFactory.__set__('by', by)
const tools = toolsFactory()

let protractorBy = new protractor.ProtractorBy()

describe('tools', function () {

  beforeEach(function () {
    browser.get.reset()
    browser.driver.manageObj.windowObj.maximize.reset()
    element.reset()
    by.id.reset()
  })

  describe('#buildUri()', function () {
    it('should return the baseUri when called with space parameter.', function () {
      expect(tools.buildUri('')).to.equal(browser.params.baseUrl)
    })

    it('should return the baseUri with correct fragment when called with a fragment', function () {
      expect(tools.buildUri('test')).to.equal(browser.params.baseUrl + '#test')
    })
  })

  describe('#getWebapp', function () {
    it('should get the home page from the browser.', function () {
      tools.getWebapp()
      expect(browser.get.calledOnce).to.be.true
      expect(browser.get.calledWith(browser.params.baseUrl)).to.be.true
    })
  })

  describe('#isLocator', function() {
    it('should return true for WebDriverLocator id', function() {
      expect(tools.isLocator( protractorBy.id('test'))).to.be.true
    })
    it('should return true for WebDriverLocator css', function() {
      expect(tools.isLocator( protractorBy.css('.test'))).to.be.true
    })
    it('should return true for WebDriverLocator className', function() {
      expect(tools.isLocator( protractorBy.className('test'))).to.be.true
    })
    it('should return true for WebDriverLocator LinkTest', function() {
      expect(tools.isLocator( protractorBy.linkText('test'))).to.be.true
    })
    it('should return true for WebDriverLocator js', function() {
      expect(tools.isLocator( protractorBy.js('test'))).to.be.true
    })
    it('should return true for WebDriverLocator name', function() {
      expect(tools.isLocator( protractorBy.name('test'))).to.be.true
    })
    it('should return true for WebDriverLocator partialLinkText', function() {
      expect(tools.isLocator( protractorBy.partialLinkText('test'))).to.be.true
    })
    it('should return true for WebDriverLocator tagName', function() {
      expect(tools.isLocator( protractorBy.tagName('test'))).to.be.true
    })
    it('should return true for WebDriverLocator xpath', function() {
      expect(tools.isLocator( protractorBy.xpath('test'))).to.be.true
    })
    it('should return true for ProtractorLocator binding', function() {
      expect(tools.isLocator( protractorBy.binding('test'))).to.be.true
    })
    it('should return true for ProtractorLocator exactBinding', function() {
      expect(tools.isLocator( protractorBy.exactBinding('test'))).to.be.true
    })
    it('should return true for ProtractorLocator model', function() {
      expect(tools.isLocator( protractorBy.model('test'))).to.be.true
    })
    it('should return true for ProtractorLocator buttonText', function() {
      expect(tools.isLocator( protractorBy.buttonText('test'))).to.be.true
    })
    it('should return true for ProtractorLocator partialButtonText', function() {
      expect(tools.isLocator( protractorBy.partialButtonText('test'))).to.be.true
    })
    it('should return true for ProtractorLocator repeater', function() {
      expect(tools.isLocator( protractorBy.repeater('test'))).to.be.true
    })
    it('should return true for ProtractorLocator exactRepeater', function() {
      expect(tools.isLocator( protractorBy.exactRepeater('test'))).to.be.true
    })
    it('should return true for ProtractorLocator cssContainingText', function() {
      expect(tools.isLocator( protractorBy.cssContainingText('test'))).to.be.true
    })
    it('should return false for a random object', function() {
      expect(tools.isLocator( { random: true } )).to.be.false
    })
    it('should return false for a random string', function() {
      expect(tools.isLocator( "test" )).to.be.false
    })
    it('should return false for a wisely crafted string', function() {
      expect(tools.isLocator( "By(test)" )).to.be.false
    })
    it('should return false for another wiselly crafted string', function() {
      expect(tools.isLocator( "function (driver) {}" )).to.be.false
    })
    it('should return false for a function', function() {
      expect(tools.isLocator( function () {} )).to.be.false
    })
  })

  describe('#toElementFinder', function () {
    it('should convert string to element finder by id.', function () {
      by.id.onCall(0).returns('selectorById')
      element.onCall(0).returns('elementFinderById')
      let t = tools.toElementFinder('id')
      expect(element.calledWith('selectorById'))
      expect(t).to.equals('elementFinderById')
    })

    it('should convert locator to element finder.', function () {
      const locator = protractorBy.id('test')
      element.onCall(0).returns('elementFinderById')
      let t = tools.toElementFinder(locator)
      expect(element.calledWith(locator))
      expect(t).to.equals('elementFinderById')
    })

    it('should pass thru things not known.', function () {
      const strange = Symbol("strange")
      let t = tools.toElementFinder(strange)
      expect(t).to.equals(strange)
    })
  })

  // describe('#pushButton', function () {
  //   it('should scroll to and click on the specified item.', function() {
  //     let t = tools.pushButton('#MyButton')
  //   })
  // })
    

})
