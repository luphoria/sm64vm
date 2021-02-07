# sm64vm

## What?
This is an attempt to build a scripting engine VM for the Javascript port of Super Mario 64. The scripting language of choice is also Javascript, meaning JS is embedded in JS in this project.

A script text area and run button are now available on the website directly below the game.

Beware; it is incredibly buggy and only one script can be executed during a single instance of the game. Refresh the website to run another.

## Example script
```javascript
mario.onActionChange = function(o, n) {
    console.log("Changed action from " + o + " to " + n);
}

keys.P.up(function() { // On the release of the P key
    var pos = mario.getPosition();
    console.log("Old position: ", pos);
    
    pos[1] = pos[1] + 500; // Add 500 units to Mario's height

    console.log("New position: ", pos); 
    mario.setPosition(pos);
});
```

### Links
[sm64js](https://github.com/sm64js/sm64js)

## Build instructions - Windows, Mac, or Linux 

### Prerequirements
* Node.js

### Run these commands
```bash
git clone https://github.com/leo-bc/sm64vm
cd sm64vm
npm install
npm run start
```

## API
* `mario`
  * `getPosition()` gets Mario's position in a truple of x, y and z
  * `setPosition(position)` sets Mario's position to the truple `position`
  * `getAction()` gets Mario's current action constant in string form
  * `onActionChange` executes before Mario changes his action; should be set to a `function(oldAction, newAction)`
* `camera`
  * `activate(active)` set the camera active or inactive based on the `active` boolean value
* `keys` direct reference to the `Keydrown` object/library that handles input: [API reference](https://jeremyckahn.github.io/keydrown/)

The following (helper) functions have been implemented in the API:
* `console.log()`
* `JSON.stringify()`
* `setInterval()`
