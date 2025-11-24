// server/src/routes/resultRoutes.js
const express = require('express');
const router = express.Router();

// Safe require helper
function safeRequire(p) {
  try { return require(p); } catch (e) {
    console.warn(`safeRequire: failed to load ${p}:`, e && e.message);
    return null;
  }
}

let verifyAdmin = safeRequire('../middleware/authMiddleware');
let resultController = safeRequire('../controllers/resultController');

// If the middleware export is an object (named exports), try common shapes
if (verifyAdmin && typeof verifyAdmin !== 'function') {
  if (typeof verifyAdmin.protect === 'function') verifyAdmin = verifyAdmin.protect;
  else if (typeof verifyAdmin.default === 'function') verifyAdmin = verifyAdmin.default;
}

// helpers to avoid passing non-functions to router.* (which crashes)
const mkMiddleware = (maybe, name) => {
  if (typeof maybe === 'function') return maybe;
  console.warn(`resultRoutes: middleware "${name}" is not a function (type=${typeof maybe}). Using fallback that returns 500.`);
  return (req, res) => res.status(500).json({ success: false, message: `Server misconfiguration: middleware "${name}" not available` });
};

const mkHandler = (maybe, name) => {
  if (typeof maybe === 'function') return maybe;
  console.warn(`resultRoutes: handler "${name}" is not a function (type=${typeof maybe}). Using fallback handler.`);
  return (req, res) => res.status(500).json({ success: false, message: `Server misconfiguration: handler "${name}" not available` });
};

const safeVerifyAdmin = mkMiddleware(verifyAdmin, 'verifyAdmin');

// Accept both legacy path /add and improved restful routes (/ and /:id)
const safeAddResult = mkHandler(resultController?.addResult || resultController?.AddResults, 'addResult');
const safeGetResults = mkHandler(resultController?.getResults || resultController?.GetResults, 'getResults');
const safeGetResult = mkHandler(resultController?.getResult, 'getResult'); // optional

// POST /api/results and POST /api/results/add (compatibility)
router.post('/', safeVerifyAdmin, safeAddResult);
router.post('/add', safeVerifyAdmin, safeAddResult);

// GET /api/results
router.get('/', safeVerifyAdmin, safeGetResults);

// optional: get single result
router.get('/:id', safeVerifyAdmin, safeGetResult);

module.exports = router;
