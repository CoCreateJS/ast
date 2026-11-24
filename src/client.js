export { evaluateSync, evaluateAsync, evaluateAST, registerASTGlobals, isomorphicSandbox } from "./modules/evaluate/index.js";
export { processOperators, processOperatorsAsync, customOperators } from "./modules/evaluate/operators.js";

import { evaluateAsync } from "./modules/evaluate/index.js";
export default evaluateAsync;
