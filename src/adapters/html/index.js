// src/adapters/html/index.js
export { BridgeView } from './components/bridge-view';
export { AuthGuard } from './components/auth-guard';
export { RoleGuard } from './components/role-guard';
export { Auth } from './core/auth';
export { Bridge } from './core/bridge';
export { Query } from './core/query';
export { Storage } from './utils/storage';
export { htmxUtils } from './utils/htmx';
export { domUtils } from './utils/dom';

// Usage example:
/**
 * HTML Template:
 * 
 * <auth-guard redirect-url="/login">
 *   <bridge-view
 *     resource="users"
 *     require-auth="true"
 *     user-types="admin,manager"
 *   >
 *     <div class="users-list"
 *       hx-get="/api/users"
 *       hx-trigger="load"
 *       hx-ext="bridge"
 *       bridge-resource="users"
 *     >
 *     </div>
 *     
 *     <form
 *       hx-post="/api/users"
 *       hx-ext="bridge"
 *       bridge-resource="users"
 *     >
 *       <input name="name" />
 *       <input name="email" />
 *       <button type="submit">Add User</button>
 *     </form>
 *   </bridge-view>
 * </auth-guard>
 */