# VanillaJSRouter v1.0.1

VanillaJSRouter is a lightweight client-side router developed by anoxxxy aka Anoxy. This library allows for easy hash-based routing in vanilla JavaScript, inspired by RouterJS by Silvio Delgado.

## Key Features

- Prevent back navigation to specific routes
- Check if a route is a checkpoint

- Add routes with dynamic parameters
- Execute `beforeAll` and `afterAll` middleware functions for global route handling
- Support for individual `run_before` and `run_after` functions for specific routes
- Navigation via hash changes (`window.location.hash`)
- Simple API for adding routes, navigating, and clearing the hash

---

## Installation

Download or clone the library from [GitHub](https://github.com/anoxxxy/vanillajsrouter).

```bash
git clone https://github.com/anoxxxy/vanillajsrouter.git
```

Include the script in your HTML file:

```html
<script src="vanillajsrouter.js"></script>
```

## Getting Started

### 1. Initialize the Router

Call the Router object to start using the library.

```javascript
const router = new Router();
```

### 2. Add Routes

Define routes using the `add` method. Routes can have static paths or dynamic parameters:

```javascript
router.add('/home', () => {
  console.log('Welcome to the Home page!');
});

router.add('/user/:id', (matches, params) => {
  console.log(`User ID: ${params.id}`);
});
```

Explanation:
- `/home` is a static route
- `/user/:id` is a dynamic route where `:id` captures a value

### 3. Middleware

#### Global Middleware

Use `beforeAll` and `afterAll` to define functions that run before or after all routes.

```javascript
router.beforeAll(() => {
  console.log('Running before all routes...');
});

router.afterAll(() => {
  console.log('Running after all routes...');
});
```

#### Route-Specific Middleware

Each route can have its own `run_before` and `run_after` functions:

```javascript
router.add(
  '/about',
  () => {
    console.log('Welcome to the About page!');
  },
  () => {
    console.log('Before navigating to About...');
  },
  () => {
    console.log('After navigating to About...');
  }
);
```

### 4. Start the Router

Start the router to listen for hash changes:

```javascript
router.start();
```

### 5. Navigate Programmatically

Navigate to a specific route using the `navigate` method:

```javascript
router.navigate('/home', 'Home Page');
```
- The first parameter is the route
- The second parameter (optional) is the page title

### 6. Clear the Hash

Clear the hash value from the URL:

```javascript
router.clearHash();
```

### 7. Back Navigation

Navigate back to the previous route:

```javascript
router.back();
```

### 8. Access Registered Routes

Retrieve a list of all registered routes:

```javascript
console.log(router.routes());
```

### 9. Prevent Back Navigation to Specific Routes

Prevent the user from navigating back to certain routes by using the setPreventBackHashes method:

```javascript
router.setPreventBackHashes(['/protected', '/admin'], {
  onBackAttempt: () => {
    alert('Back navigation is not allowed.');
  },
});
```
The first parameter is an array of routes to prevent back navigation to.
The second parameter is an options object with the onBackAttempt callback to handle attempts to navigate back


### 10. Check if a Route is a Checkpoint

Use the isCheckpoint method to check if the current route (or a given route) is a checkpoint:
```javascript
if (router.isCheckpoint('/protected')) {
  console.log('This route is a checkpoint.');
}
```
Call router.isCheckpoint() without parameters to check if the current route is a checkpoint.
Pass a specific route to check it against the list of checkpoints.


## Full Example

Here's a complete example that uses multiple routes and middleware:

```javascript
const router = new Router();

// Global middleware
router.beforeAll(() => {
  console.log('Global middleware before all routes.');
});

router.afterAll(() => {
  console.log('Global middleware after all routes.');
});

// Define routes
router.add('/', () => {
  console.log('Home Page');
});

router.add('/profile/:username', (matches, params) => {
  console.log(`Welcome, ${params.username}!`);
});

router.add('/about', () => {
  console.log('About Page');
}, () => {
  console.log('Before navigating to About page...');
}, () => {
  console.log('After navigating to About page...');
});

// Prevent back navigation to specific routes
router.setPreventBackHashes(['/admin', '/settings'], {
  onBackAttempt: () => {
    console.warn('Cannot go back to this route!');
  },
});


// Start the router
router.start();
```
