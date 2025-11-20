'use strict';

const DEFAULT_OPTIONS = {
  max: 250,
  skipBlankLines: true,
  skipComments: true
};

const schema = [
  {
    type: 'object',
    properties: {
      max: {
        type: 'integer',
        minimum: 0
      },
      skipBlankLines: {
        type: 'boolean'
      },
      skipComments: {
        type: 'boolean'
      }
    },
    additionalProperties: false
  }
];

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'soft line-count warning to complement the hard max-lines rule'
    },
    schema,
    messages: {
      exceed: 'File has {{actual}} logical lines. Soft limit is {{max}}.'
    }
  },
  create(context) {
    return {
      Program() {
        const sourceCode = context.getSourceCode();
        const optionValues = Object.assign({}, DEFAULT_OPTIONS, context.options[0]);
        const comments = optionValues.skipComments ? sourceCode.getAllComments() : [];
        const commentLineNumbers = new Set();

        for (const comment of comments) {
          for (let line = comment.loc.start.line; line <= comment.loc.end.line; line += 1) {
            commentLineNumbers.add(line);
          }
        }

        const lines = sourceCode.lines;
        let counted = 0;
        let overflowLine = null;

        for (let index = 0; index < lines.length; index += 1) {
          const lineNumber = index + 1;
          const content = lines[index];
          const isBlank = content.trim() === '';

          if (optionValues.skipBlankLines && isBlank) {
            continue;
          }

          if (optionValues.skipComments && commentLineNumbers.has(lineNumber)) {
            continue;
          }

          counted += 1;

          if (counted > optionValues.max && overflowLine === null) {
            overflowLine = lineNumber;
          }
        }

        if (counted > optionValues.max) {
          context.report({
            loc: overflowLine
              ? {
                  start: { line: overflowLine, column: 0 },
                  end: { line: overflowLine, column: 0 }
                }
              : undefined,
            messageId: 'exceed',
            data: {
              actual: counted,
              max: optionValues.max
            }
          });
        }
      }
    };
  }
};
