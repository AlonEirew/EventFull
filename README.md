# EventFull
EventFull is a web-based tool designed to facilitate the annotation of complete and consistent event relation graphs over a manageable subset of key events.
It takes as in- put a document with pre-identified event mentions, obtained using any off-the-shelf event extraction model, as well as an optional set of extracted tem- poral entities, highlighted in the text to aid the annotation process.

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

## Running the tasks
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
  * `includeTemp`
  * `includeCoref`
  * `includeCausal`
* `showRemainingAnnot` - control whether to show the remaining annotations in the annotation panel
* `exportAlways` - control whether to enable export even if the annotation is not complete
