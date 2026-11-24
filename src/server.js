export { evaluateSync, evaluateAsync } from "./modules/evaluate/server.js";
export { evaluateAST, registerASTGlobals, isomorphicSandbox } from "./modules/evaluate/index.js";
export { processOperators, processOperatorsAsync, customOperators } from "./modules/evaluate/operators.js";

import { evaluateAsync } from "./modules/evaluate/server.js";
export default evaluateAsync;
