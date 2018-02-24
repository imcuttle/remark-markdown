'use strict'
var openCloseTag = require('./utils/html').openCloseTag
module.exports = breaks

function breaks(options) {
  options = options || {}
  var wrap = 'wrap' in options ? options.wrap : 'markdown'
  var parser = this.Parser
  var compiler = this.Compiler
  var tokenizers
  var methods
  /* istanbul ignore if - never used (yet) */
  if (!isRemarkParser(parser)) {
    throw new Error('Missing parser to attach `remark-markdown` to')
  }

  tokenizers = parser.prototype.blockTokenizers
  methods = parser.prototype.blockMethods
  tokenizers.markdown = tokenizeMarkdown
  methods.splice(methods.indexOf('html'), 0, 'markdown')

  if (!isRemarkCompiler(compiler)) {
    return
  }

  var visitors = compiler.prototype.visitors
  visitors.markdownBlock = function (node) {
    var contents = this.all(node)
    return '<markdown>\n' + contents.join('\n') + '\n</markdown>'
  }

  function tokenizeMarkdown(eat, value, silent) {
    var now
    var $1
    var $2
    var match
    var cRegex = /(<markdown>([^]+?)<\/markdown>)/i
    var regex = new RegExp('^' + cRegex.source, 'i')
    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    if (regex.test(value)) {
      $1 = RegExp.$1
      $2 = RegExp.$2
      now = eat.now()
      var add = eat($1)
      var exit = this.enterBlock()
      var values = this.tokenizeBlock($2, now)
      exit()

      var d = add(
        {
          type: 'markdownBlock',
          children: values,
          data: {
            hName: wrap
          }
        }
      )

      if (true === tokenizeMarkdown.__entry) {
        return tokenizeMarkdown.call(this, eat, value.substring($1.length), silent)
      }
      return d
    }

    if (value && openCloseTag.test(value)) {
      // var html
      if (true === tokenizeMarkdown.__entry) {
        delete tokenizeMarkdown.__entry
        value = value.substring(0, openCloseTag.lastIndex)
      }
      match = value.match(cRegex)
      if (match) {
        tokenizeMarkdown.__entry = true
        value = value.substring(0, match.index)
      }

      return eat(value)({
        type: 'html',
        value: value
      })
    }

  }
}

function isRemarkParser(parser) {
  return Boolean(
    parser &&
    parser.prototype &&
    parser.prototype.inlineTokenizers &&
    parser.prototype.inlineMethods
  )
}

function isRemarkCompiler(compiler) {
  return Boolean(
    compiler &&
    compiler.prototype &&
    compiler.prototype.visitors
  )
}
