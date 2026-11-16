export { astSync, astAsync, evaluateAST, registerASTGlobals, isomorphicSandbox } from "./modules/ast/index.js";
export { processOperators, processOperatorsAsync, customOperators } from "./modules/ast/operators.js";

import { astSync } from "./modules/ast/index.js";
export default astSync;
