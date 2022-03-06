const np = require('number-precision')

module.exports = () => {
  return {
    postcssPlugin: 'postcss-aspect-ratio-polyfill',
    Declaration: {
      'aspect-ratio': (decl, {Rule, AtRule, Declaration}) => {
        const rule = decl.parent
        const supports = new AtRule({ name: 'supports', params: 'not (aspect-ratio: auto)' })
        const selector = rule.selector
        const beforeRule = new Rule({selector: `${selector}::before`, raws: {after: rule.raws.after, semicolon: rule.raws.semicolon}})
        const afterRule = new Rule({selector: `${selector}::after`, raws: {before: rule.raws.after, after: rule.raws.after, semicolon: rule.raws.semicolon}})

        const numberValueRegexp = /['"]?((?:\d*\.?\d*)?)(?:\s*[\:\|\/]\s*)(\d*\.?\d*)['"]?/g

        if (!numberValueRegexp.test(decl.value)) {
          beforeRule.append([new Declaration({ prop: "content", value: "unset" })])
          afterRule.append([new Declaration({ prop: "content", value: "unset" })])
        } else {
          const ratio = decl.value.replace(
            numberValueRegexp,
            (match, width, height) => np.times(np.divide(height, width), 100) + '%'
          )

          beforeRule.append([
            new Declaration({prop: 'float', value: 'left', raws: decl.raws}),
            new Declaration({prop: 'padding-top', value: ratio}),
            new Declaration({prop: 'content', value: "''"}),
          ])

          afterRule.append([
            new Declaration({prop: 'display', value: 'block'}),
            new Declaration({prop: 'content', value: "''"}),
            new Declaration({prop: 'clear', value: 'both'}),
          ])
        }

        supports.append(beforeRule)
        supports.append(afterRule)

        rule.after(supports)
      },
    },
  }
}

module.exports.postcss = true
