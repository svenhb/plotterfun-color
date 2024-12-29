importScripts('helpers.js')

postMessage(['sliders', defaultControls.concat([
	{label: 'Line Count', value: 50, min: 10, max: 500},			// 200
	{label: 'Amplitude pos/neg', value: 1, min: -10, max: 10, step: 0.1},	// 5
//	{label: 'Sampling', value: 1, min: 0.5, max: 2.9, step: 0.1},
	{label: 'Threshold start line', value: 1, min: 0, max: 255},
	{label: 'Join Ends', type:'checkbox'},
//	{label: 'Invert Deflection', type:'checkbox'}
])]);


onmessage = function(e) {
	const [ config, pixData ] = e.data;
	const getPixel = pixelProcessor(config, pixData);

	const width = parseInt(config.width);
	const height = parseInt(config.height);
	const lineCount = parseInt(config['Line Count']);
	const spacing = 1;	//parseFloat(config.Sampling);
	const amplitude = parseFloat(config['Amplitude pos/neg']);		//(config.Amplitude);
	const threshold = parseFloat(config['Threshold start line']);	//(config.Threshold);
	const joined = config['Join Ends'];
	const invert = false;//config['Invert Deflection'];

	let squiggleData = [];
	if (joined) squiggleData[0]=[];
	let toggle = false;
	let drawn = false;
	let horizontalLineSpacing = Math.floor(height / lineCount);

	for (let y = 0; y < height; y+= horizontalLineSpacing) {
	//	let a = 0;
		toggle=!toggle;
		drawn = false;
		currentLine = [];
		//currentLine.push([toggle?0:width, y]);

		for (let x = toggle? spacing: width-spacing; (toggle && x <= width) || (!toggle && x >= 0); x += toggle?spacing:-spacing ) {
			let z = getPixel(x, y);
			if (z >= threshold) {
				drawn = true;
				let r = amplitude * z / lineCount;
				if (invert)
					currentLine.push([x, y + r]);	
				else
					currentLine.push([x, y - r]);	
			}
			else
			{	  
				if (drawn && !joined)
				{	
					squiggleData.push(currentLine);
					currentLine = [];
					drawn = false;
				}
			}
		}

		if (joined)
			squiggleData[0]=squiggleData[0].concat(currentLine);
		else
			if (drawn)
			  squiggleData.push(currentLine);
	}
	postLines(squiggleData);
}

