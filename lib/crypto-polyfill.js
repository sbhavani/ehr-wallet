// Polyfill for crypto.randomUUID
import { v4 as uuidv4 } from 'uuid';

if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = function() {
    return uuidv4();
  };
}

export default {};
