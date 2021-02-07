# sm64vm

## What?
This is an attempt to build a scripting engine VM for the Javascript port of Super Mario 64.

## Example script
```javascript
keys.P.up(function() {
	var pos = mario.getPosition();
	
	console.log("Old position: ", pos);
	pos[1] = pos[1] + 50;
	console.log("New position: ", pos); 
	
        mario.setPosition(pos);
});
```

### Links
[sm64js main website](https://sm64js.com)
[sm64js Github page](https://github.com/sm64js/sm64js)

## Build instructions - Windows, Mac, or Linux 

### Prerequirements
* Node.js

### Run these commands
```bash
# Clone the source code
git clone https://github.com/leo-bc/sm64vm && cd sm64vm
# Install node packages
npm install
# Launch wepback dev server
npm run start
```