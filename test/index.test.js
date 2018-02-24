/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/2/24
 * @description
 */
const remark = require('remark')
const html = require('remark-html')
const stringify = require('remark-stringify')
const mark = require('../index')
const openCloseTag = require('../utils/html').openCloseTag

describe('html openTag', function () {
  it('<div></div>', () => {
    expect(openCloseTag.test('<div></div>')).toBeTruthy()
  })

  it('<div>asd</div>', () => {
    expect(openCloseTag.test('<div>sss</div>')).toBeTruthy()
  })

  it('<div a="xx"/>', () => {
    expect(openCloseTag.test('<div a="xx"/>')).toBeTruthy()
  })

  it('<0ss a="xx"/>', () => {
    expect(openCloseTag.test('<div a="xx"/>')).toBeTruthy()
  })
  it('aa<0ss a="xx"/>', () => {
    expect(openCloseTag.test('aa<div a="xx"/>')).toBeFalsy()
  })

  it('</div>', () => {
    expect(openCloseTag.test('</div>')).toBeTruthy()
  })
})

describe('main', function () {
  test('illegal block', () => {
    remark()
      .use(html)
      .use(mark)
      .process('asd<markdown>## h</markdown>', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe('<p>asd<markdown>## h</markdown></p>')
      })
  })

  test('right block', () => {
    remark()
      .use(html)
      .use(mark)
      .process('<markdown>## h #x\n ## hh</markdown>', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe('<markdown><h2>h #x</h2><h2>hh</h2></markdown>')
      })
  })

  test('right block case 1', () => {
    remark()
      .use(html)
      .use(mark)
      .process('<markdown>\n'
               + '## h #x\n '
               + '## hh\n'
               + '</markdown>', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe('<markdown><h2>h #x</h2><h2>hh</h2></markdown>')
      })
  })

  test('right block case 2', () => {
    remark()
      .use(html)
      .use(mark)
      .process('<span>abc</span><div>'
               + '<span>a</span><markdown>\n'
               + '## hxx\n '
               + '## hh\n'
               + '<p>abc</p>\n'
               + '</markdown><span>abc</span></div>', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe(
          '<span>abc</span><div><span>a</span>\n<markdown><h2>hxx</h2><h2>hh</h2><p>abc</p></markdown>\n<span>abc</span></div>'
        )
      })
  })

  test('inline html', () => {
    remark()
      .use(html)
      .use(mark)
      .process('<span>xxx</span></div>', function (err, content) {
        expect(content.contents.trim()).toBe('<span>xxx</span></div>')
      })
  })

  test('block html ', () => {
    remark()
      .use(html)
      .use(mark)
      .process('<div><span>xxx</span></div>', function (err, content) {
        expect(content.contents.trim()).toBe('<div><span>xxx</span></div>')
      })

    remark()
      .use(html)
      .use(mark)
      .process('<div><span>xxx<markdown># a</markdown><markdown># b</markdown></span></div>', function (err, content) {
        expect(content.contents.trim()).toBe('<div><span>xxx\n<markdown><h1>a</h1></markdown>\n<markdown><h1>b</h1></markdown>\n\n</span></div>')
      })
  })

  test('customized options', () => {
    remark()
      .use(html)
      .use(mark, { wrap: 'div' })
      .process('<markdown>## h #x\n ## hh</markdown>', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe('<div><h2>h #x</h2><h2>hh</h2></div>')
      })
  })

  test('stringify', () => {
    remark()
      .use(mark, { wrap: 'div' })
      .process('<markdown>## h #x ## hh</markdown>', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe('<markdown>\n## h #x ## hh\n</markdown>')
      })
  })

  test('stringify case 1', () => {
    remark()
      .use(mark, { wrap: 'div' })
      .process('<div><markdown>\n'
               + '## h #x \n'
               + '## hh \n'
               + '</markdown></div>\n', function (err, content) {
        expect(err).toBeNull()
        expect(content.contents.trim()).toBe('<div>\n\n<markdown>\n## h #x\n## hh\n</markdown>\n\n\n\n</div>')
      })
  })

})
