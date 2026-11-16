export { astSync, astAsync } from "./modules/ast/server.js";
export { evaluateAST, registerASTGlobals, isomorphicSandbox } from "./modules/ast/index.js";
export { processOperators, processOperatorsAsync, customOperators } from "./modules/ast/operators.js";

import { astSync } from "./modules/ast/server.js";
export default astSync;
