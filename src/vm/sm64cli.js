class SM64CLI {
    start() {
        var ref = this;
        setInterval(() => {
            if (!ref.processing) {
                ref.processing = true;
                ref.fetchCommand();
            }
        }, 10);
    }

    fetchCommand() {
        var ref = this;
        fetch('http://localhost:1323/command', {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
            .then(data => {
                if (data.Text != "") {
                    console.log("Command", data);
                    this.processCommand(data);
                } else {
                    ref.processing = false;
                }
            });
    }

    processCommand(command) {
        if (!command.IsScript) {
            try {
                var response = this.vm.eval(command.Text);
                this.sendResponse(JSON.stringify(response));
            } catch (error) {
                this.sendResponse(error.message);
            }
        } else {
            try {
                var script = Vm.compile(command.Text, 'script.js')
                var response = Object.sm64vm.vm.run(script);
                // this.sendConsole(response);
            } catch (error) {
                this.sendConsole(error.message);
            }
        }

    }

    sendResponse(text) {
        if (text == "" || text == undefined)
            text = "empty response";

        var ref = this;
        var response = { Text: text };
        fetch('http://localhost:1323/response', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(response)
            }).then(res => res.json())
            .then(res => {
                console.log("Resp:", res)
                ref.processing = false;
            });
    }

    sendConsole(text) {
        if (typeof text !== 'string')
            text = text.toString();
        var response = { Text: text };
        fetch('http://localhost:1323/console', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(response)
            }).then(res => res.json())
            .then(res => {
                console.log("Console", res)
            });
    }
}