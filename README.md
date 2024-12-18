# EventFull Annotation Tool
This repository contains the implementation of our tool, as described in [this paper](https://arxiv.org/pdf/2412.12733).  


![Alt text](https://raw.githubusercontent.com/AlonEirew/EventFull/refs/heads/main/imgs/figure1.png)


## Install and Deploy (with npm)
```bash
npm install
npm start
```

[//]: # (### With Node.js)
[//]: # (An alternative to npm install)
[//]: # (1&#41; Install Node.js)
[//]: # (2&#41; Install express &#40;npm install express&#41;)
[//]: # (3&#41; run the server.js file &#40;node server.js&#41;)
[//]: # (4&#41; go to localhost:3000 in your browser)

## Running the Tasks
1) Go to localhost:3000 in your browser
2) Follow the instructions at each step and answer the questions
3) Save your work occasionally

## See Logs
1) In the client browser click the left mouse button and select "inspect"
2) Go to the console tab

## Input format
An example of how an input file should look like can be found in the `example` folder.
* `input_example.json` is an example of the input file format.
* `input_example_include_temporal.json` is an example of the input file format with optional temporal entities.

## Output format
* `export_example.json` is an example of the output file format.

## Configuration
The tool can be configured by changing the `public/config.json` file.
* To select which annotation steps to include, modify the following parameters:
  * `includeAxis` - Event selection step
  * `includeTemp` - Temporal relation annotation step
  * `includeCoref` - Coreference resolution step
  * `includeCausal` - Causal relation annotation step
* `showRemainingAnnot` - control whether to show the remaining annotations in the annotation panel
* `exportAlways` - control whether to enable export even if the annotation is not complete
