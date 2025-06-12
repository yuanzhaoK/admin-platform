// JSON 标量类型解析器
export const JSONScalar = {
  serialize: (value: any) => value,
  parseValue: (value: any) => value,
  parseLiteral: (ast: any) => {
    if (ast.kind === 'StringValue') {
      return JSON.parse(ast.value);
    }
    return null;
  },
};

// 导出所有标量类型
export const scalars = {
  JSON: JSONScalar,
}; 