
class MinHeap {
	constructor() {
		this.heap_array = [];
	}
	size() {
		return this.heap_array.length;
	}
	empty() {
		return (this.size() === 0);
	}
	push(value) {
		this.heap_array.push(value);
		this.up_heapify();
	}
	up_heapify() {
		var current_index = this.size() - 1;
		while (current_index > 0) {
			var current_element = this.heap_array[current_index];
			var parent_index = Math.trunc((current_index - 1) / 2);
			var parent_element = this.heap_array[parent_index];

			if (parent_element[0] < current_element[0]) {
				break;
			}
			else {
				this.heap_array[parent_index] = current_element;
				this.heap_array[current_index] = parent_element;
				current_index = parent_index;
			}
		}
	}
	top() {
		return this.heap_array[0];
	}
	pop() {
		if (this.empty() == false) {
			var last_index = this.size() - 1;
			this.heap_array[0] = this.heap_array[last_index];
			this.heap_array.pop();
			this.down_heapify();
		}
	}
	down_heapify() {
		var current_index = 0;
		var current_element = this.heap_array[0];
		while (current_index < this.size()) {
			var child_index1 = (current_index * 2) + 1;
			var child_index2 = (current_index * 2) + 2;
			if (child_index1 >= this.size() && child_index2 >= this.size()) {
				break;
			}
			else if (child_index2 >= this.size()) {
				let child_element1 = this.heap_array[child_index1];
				if (current_element[0] < child_element1[0]) {
					break;
				}
				else {
					this.heap_array[child_index1] = current_element;
					this.heap_array[current_index] = child_element1;
					current_index = child_index1;
				}
			}
			else {
				var child_element1 = this.heap_array[child_index1];
				var child_element2 = this.heap_array[child_index2];
				if (current_element[0] < child_element1[0] && current_element[0] < child_element2[0]) {
					break;
				}
				else {
					if (child_element1[0] < child_element2[0]) {
						this.heap_array[child_index1] = current_element;
						this.heap_array[current_index] = child_element1;
						current_index = child_index1;
					}
					else {
						this.heap_array[child_index2] = current_element;
						this.heap_array[current_index] = child_element2;
						current_index = child_index2;
					}
				}
			}
		}
	}
}
class Codec {
	getCodes(node, curr_code) {
		if (typeof (node[1]) === "string") {
			this.codes[node[1]] = curr_code;
			return;
		}
		this.getCodes(node[1][0], curr_code + '0');
		this.getCodes(node[1][1], curr_code + '1');
	}
	make_string(node) {
		if (typeof (node[1]) === "string") {
			return "'" + node[1];
		}
		return '0' + this.make_string(node[1][0]) + '1' + this.make_string(node[1][1]);
	}
	make_tree(tree_string) {
		let node = [];
		if (tree_string[this.index] === "'") {
			this.index++;
			node.push(tree_string[this.index]);
			this.index++;
			return node;
		}
		this.index++;
		node.push(this.make_tree(tree_string));
		this.index++;
		node.push(this.make_tree(tree_string));
		return node;
	}
	encode(data) {
		this.heap = new MinHeap();

		var mp = new Map();
		for (let i = 0; i < data.length; i++) {
			if (mp.has(data[i])) {
				let foo = mp.get(data[i]);
				mp.set(data[i], foo + 1);
			}
			else {
				mp.set(data[i], 1);
			}
		}
		if (mp.size === 0) {
			let final_string = "zer#";

			let output_message = "Compression complete and file will be downloaded automatically." + '\n' + "Compression Ratio : " + (data.length / final_string.length).toPrecision(6);
			return [final_string, output_message];
		}

		if (mp.size === 1) {
			let key, value;
			for (let [k, v] of mp) {
				key = k;
				value = v;
			}
			let final_string = "one" + '#' + key + '#' + value.toString();
			let output_message = "Compression complete and file will be downloaded automatically." + '\n' + "Compression Ratio : " + (data.length / final_string.length).toPrecision(6);
			return [final_string, output_message];
		}

		// Build Huffman tree
		for (let [key, value] of mp) {
			this.heap.push([value, key]);
		}
		while (this.heap.size() >= 2) {
			let min_node1 = this.heap.top();
			this.heap.pop();
			let min_node2 = this.heap.top();
			this.heap.pop();
			this.heap.push([min_node1[0] + min_node2[0], [min_node1, min_node2]]);
		}
		var huffman_tree = this.heap.top();
		this.heap.pop();
		this.codes = {};
		this.getCodes(huffman_tree, "");

		/// convert data into coded data
		let binary_string = "";
		for (let i = 0; i < data.length; i++) {
			binary_string += this.codes[data[i]];
		}
		let padding_length = (8 - (binary_string.length % 8)) % 8;
		for (let i = 0; i < padding_length; i++) {
			binary_string += '0';
		}
		let encoded_data = "";
		for (let i = 0; i < binary_string.length;) {
			let curr_num = 0;
			for (let j = 0; j < 8; j++, i++) {
				curr_num *= 2;
				curr_num += binary_string[i] - '0';
			}
			encoded_data += String.fromCharCode(curr_num);
		}
		let tree_string = this.make_string(huffman_tree);
		let ts_length = tree_string.length;
		let final_string = ts_length.toString() + '#' + padding_length.toString() + '#' + tree_string + encoded_data;

		// Check if compression is actually beneficial
		if (final_string.length >= data.length) {
			// If compressed size is not smaller, return uncompressed with special marker
			let uncompressed_string = "raw#" + data;
			let output_message = "File stored uncompressed (compression would increase size)." + '\n' + "Original Size: " + data.length + " bytes" + '\n' + "Note: Small files or files with low repetition may not compress well.";
			return [uncompressed_string, output_message];
		}

		let output_message = "Compression complete and file will be downloaded automatically." + '\n' + "Compression Ratio : " + (data.length / final_string.length).toPrecision(6);
		return [final_string, output_message];
	}

	decode(data) {
		let k = 0;
		let temp = "";
		while (k < data.length && data[k] != '#') {
			temp += data[k];
			k++;
		}
		if (k == data.length){
			alert("Invalid File! Please submit a valid De-Compressed file");
			location.reload();
			return;
		}
		if (temp === "zer") {
			let decoded_data = "";
			let output_message = "De-Compression complete and file will be downloaded automatically.";
			return [decoded_data, output_message];
		}
		if (temp === "raw") {
			// Handle uncompressed data
			let decoded_data = data.slice(k + 1); // Everything after "raw#"
			let output_message = "File was stored uncompressed and has been restored.";
			return [decoded_data, output_message];
		}
		if (temp === "one") {
			data = data.slice(k + 1);
			k = 0;
			temp = "";
			while (data[k] != '#') {
				temp += data[k];
				k++;
			}
			let one_char = temp;
			data = data.slice(k + 1);
			let str_len = parseInt(data);
			let decoded_data = "";
			for (let i = 0; i < str_len; i++) {
				decoded_data += one_char;
			}
			let output_message = "De-Compression complete and file will be downloaded automatically.";
			return [decoded_data, output_message];

		}
		data = data.slice(k + 1);
		let ts_length = parseInt(temp);
		k = 0;
		temp = "";
		while (data[k] != '#') {
			temp += data[k];
			k++;
		}
		data = data.slice(k + 1);
		let padding_length = parseInt(temp);
		temp = "";
		for (k = 0; k < ts_length; k++) {
			temp += data[k];
		}
		data = data.slice(k);
		let tree_string = temp;
		temp = "";
		for (k = 0; k < data.length; k++) {
			temp += data[k];
		}
		let encoded_data = temp;
		this.index = 0;
		var huffman_tree = this.make_tree(tree_string);

		let binary_string = "";
		for (let i = 0; i < encoded_data.length; i++) {
			let curr_num = encoded_data.charCodeAt(i);
			let curr_binary = "";
			for (let j = 7; j >= 0; j--) {
				let foo = curr_num >> j;
				curr_binary = curr_binary + (foo & 1);
			}
			binary_string += curr_binary;
		}
		binary_string = binary_string.slice(0, -padding_length);
		let decoded_data = "";
		let node = huffman_tree;
		for (let i = 0; i < binary_string.length; i++) {
			if (binary_string[i] === '1') {
				node = node[1];
			}
			else {
				node = node[0];
			}

			if (typeof (node[0]) === "string") {
				decoded_data += node[0];
				node = huffman_tree;
			}
		}
		let output_message = "De-Compression complete and file will be downloaded automatically.";
		return [decoded_data, output_message];
	}
}

window.onload = function () {
	decodeBtn = document.getElementById("decode");
	encodeBtn = document.getElementById("encode");
	uploadFile = document.getElementById("uploadfile")
	submitBtn = document.getElementById("submitbtn");
	step1 = document.getElementById("step1");
	step2 = document.getElementById("step2");
	step3 = document.getElementById("step3");
	codecObj = new Codec();

	// Initialize drag and drop functionality
	initializeDragAndDrop();

	// Initialize file input change handler
	uploadFile.addEventListener('change', handleFileSelect);

	submitBtn.onclick = function () {
		var uploadedFile = uploadFile.files[0];
		if (uploadedFile === undefined) {
			alert("No file uploaded.\nPlease upload a file and try again");
			return;
		}
		let nameSplit = uploadedFile.name.split('.');
		var extension = nameSplit[nameSplit.length - 1].toLowerCase();
		if (extension != "txt") {
			alert("Invalid file type (." + extension + ") \nPlease upload a valid .txt file and try again");
			return;
		}
		document.getElementById("step1").style.display = "none";
		document.getElementById("step2").style.display = "inline-flex";
		document.getElementById("startagain").style.visibility = "visible";
	}

	encodeBtn.onclick = function () {
		var uploadedFile = uploadFile.files[0];
		if (uploadedFile === undefined) {
			alert("No file uploaded.\nPlease upload a file and try again");
			return;
		}
		console.log(uploadedFile.size);
		if(uploadedFile.size === 0){
			alert("You have uploaded an empty file!\nThe compressed file might be larger in size than the uncompressed file (compression ratio might be smaller than one).\nBetter compression ratios are achieved for larger file sizes!");
		}
		else if(uploadedFile.size <= 350){
			alert("The uploaded file is very small in size (" + uploadedFile.size +" bytes) !\nThe compressed file might be larger in size than the uncompressed file (compression ratio might be smaller than one).\nBetter compression ratios are achieved for larger file sizes!");
		}
		else if(uploadedFile.size < 1000){
			alert("The uploaded file is small in size (" + uploadedFile.size +" bytes) !\nThe compressed file's size might be larger than expected (compression ratio might be small).\nBetter compression ratios are achieved for larger file sizes!");
		}

		// Show step 3 and start processing
		document.getElementById("step2").style.display = "none";
		document.getElementById("step3").style.display = "inline-flex";

		// Start progress simulation
		simulateProgress(() => {
			var fileReader = new FileReader();
			fileReader.onload = function (fileLoadedEvent) {
				try {
					let text = fileLoadedEvent.target.result;
					let [encodedString, outputMsg] = codecObj.encode(text);
					myDownloadFile(uploadedFile.name.split('.')[0] + "_compressed.txt", encodedString);

					// Enhanced output message with statistics
					const originalSize = text.length;
					const compressedSize = encodedString.length;
					const ratio = (originalSize / compressedSize).toPrecision(4);
					const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

					const enhancedMsg = `
						<div class="stats-container">
							<div class="stat-item">
								<span class="stat-label">Original Size:</span>
								<span class="stat-value">${formatFileSize(originalSize)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Compressed Size:</span>
								<span class="stat-value">${formatFileSize(compressedSize)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Compression Ratio:</span>
								<span class="stat-value">${ratio}:1</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Space Saved:</span>
								<span class="stat-value">${savings}%</span>
							</div>
						</div>
						<p class="text2">Compression complete! File downloaded automatically.</p>
					`;

					ondownloadChanges(enhancedMsg);
				} catch (error) {
					console.error('Compression error:', error);
					showError('Compression Failed', 'An error occurred while compressing your file. Please try again with a different file.');
				}
			}
			fileReader.onerror = function() {
				showError('File Reading Error', 'Could not read the uploaded file. Please make sure it is a valid text file.');
			};
			fileReader.readAsText(uploadedFile, "UTF-8");
		});
	}

	decodeBtn.onclick = function () {
		console.log("decode onclick");
		var uploadedFile = uploadFile.files[0];
		if (uploadedFile === undefined) {
			alert("No file uploaded.\nPlease upload a file and try again!");
			return;
		}

		// Show step 3 and start processing
		document.getElementById("step2").style.display = "none";
		document.getElementById("step3").style.display = "inline-flex";

		// Start progress simulation
		simulateProgress(() => {
			var fileReader = new FileReader();
			fileReader.onload = function (fileLoadedEvent) {
				try {
					let text = fileLoadedEvent.target.result;
					let [decodedString, outputMsg] = codecObj.decode(text);

					// Check if decode was successful
					if (decodedString === undefined || decodedString === null) {
						throw new Error('Decompression returned invalid result');
					}

					myDownloadFile(uploadedFile.name.split('.')[0] + "_decompressed.txt", decodedString);

					// Enhanced output message with statistics
					const compressedSize = text.length;
					const decompressedSize = decodedString.length;
					const ratio = (decompressedSize / compressedSize).toPrecision(4);

					const enhancedMsg = `
						<div class="stats-container">
							<div class="stat-item">
								<span class="stat-label">Compressed Size:</span>
								<span class="stat-value">${formatFileSize(compressedSize)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Decompressed Size:</span>
								<span class="stat-value">${formatFileSize(decompressedSize)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Expansion Ratio:</span>
								<span class="stat-value">${ratio}:1</span>
							</div>
						</div>
						<p class="text2">Decompression complete! File downloaded automatically.</p>
					`;

					ondownloadChanges(enhancedMsg);
				} catch (error) {
					console.error('Decompression error:', error);
					showError('Decompression Failed', 'The file does not appear to be a valid compressed file created by this tool. Please make sure you are uploading a file that was compressed using this application.');
				}
			}
			fileReader.onerror = function() {
				showError('File Reading Error', 'Could not read the uploaded file. Please make sure it is a valid compressed file.');
			};
			fileReader.readAsText(uploadedFile, "UTF-8");
		});
	}

}



function myDownloadFile(fileName, text) {
	let a = document.createElement('a');
	a.href = "data:application/octet-stream," + encodeURIComponent(text);
	a.download = fileName;
	a.click();
}

function ondownloadChanges(outputMsg) {
	// Hide loading spinner and progress bar
	document.getElementById("loadingSpinner").style.display = "none";
	document.getElementById("progressContainer").classList.add("hidden");

	step3.innerHTML = "";
	let img = document.createElement("img");
	img.src = "done.jpg";
	img.id = "doneImg";
	step3.appendChild(img);
	var br = document.createElement("br");
	step3.appendChild(br);
	let msg3 = document.createElement("div");
	msg3.className = "text2";
	msg3.innerHTML = outputMsg;
	step3.appendChild(msg3);
}

// Drag and Drop Functionality
function initializeDragAndDrop() {
	const fileLabel = document.getElementById('fileLabel');
	const fileInput = document.getElementById('uploadfile');

	// Prevent default drag behaviors
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		fileLabel.addEventListener(eventName, preventDefaults, false);
		document.body.addEventListener(eventName, preventDefaults, false);
	});

	// Highlight drop area when item is dragged over it
	['dragenter', 'dragover'].forEach(eventName => {
		fileLabel.addEventListener(eventName, highlight, false);
	});

	['dragleave', 'drop'].forEach(eventName => {
		fileLabel.addEventListener(eventName, unhighlight, false);
	});

	// Handle dropped files
	fileLabel.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
}

function highlight(e) {
	document.getElementById('fileLabel').classList.add('dragover');
}

function unhighlight(e) {
	document.getElementById('fileLabel').classList.remove('dragover');
}

function handleDrop(e) {
	const dt = e.dataTransfer;
	const files = dt.files;

	if (files.length > 0) {
		document.getElementById('uploadfile').files = files;
		handleFileSelect();
	}
}

// File Selection Handler
function handleFileSelect() {
	const file = document.getElementById('uploadfile').files[0];
	const fileNameDisplay = document.getElementById('fileNameDisplay');
	const fileLabel = document.getElementById('fileLabel');

	if (file) {
		fileNameDisplay.textContent = `Selected: ${file.name}`;
		fileNameDisplay.style.display = 'block';
		fileLabel.innerHTML = '<i class="fas fa-check-circle"></i> File Selected';
		fileLabel.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';

		// Update file info for step 2
		document.getElementById('displayFileName').textContent = file.name;
		document.getElementById('displayFileSize').textContent = formatFileSize(file.size);
		document.getElementById('displayFileType').textContent = file.type || 'text/plain';

		// Load file preview
		loadFilePreview(file);
	}
}

// Load file preview
function loadFilePreview(file) {
	const filePreview = document.getElementById('filePreview');
	const previewContent = document.getElementById('previewContent');
	const toggleButton = document.getElementById('togglePreview');

	if (file.size > 10000) { // If file is larger than 10KB
		filePreview.classList.add('hidden');
		return;
	}

	const reader = new FileReader();
	reader.onload = function(e) {
		const content = e.target.result;
		const preview = content.length > 500 ? content.substring(0, 500) + '...' : content;

		previewContent.textContent = preview;
		filePreview.classList.remove('hidden');

		// Toggle preview functionality
		let showingFull = false;
		toggleButton.onclick = function() {
			if (showingFull) {
				previewContent.textContent = preview;
				toggleButton.textContent = 'Show Full Content';
				showingFull = false;
			} else {
				previewContent.textContent = content;
				toggleButton.textContent = 'Show Preview Only';
				showingFull = true;
			}
		};

		// Show/hide toggle button based on content length
		toggleButton.style.display = content.length > 500 ? 'block' : 'none';
	};

	reader.onerror = function() {
		console.error('Error reading file for preview');
		filePreview.classList.add('hidden');
	};

	reader.readAsText(file);
}

// Format file size for display
function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced progress simulation
function simulateProgress(callback) {
	const progressBar = document.getElementById('progressBar');
	const progressContainer = document.getElementById('progressContainer');
	const loadingSpinner = document.getElementById('loadingSpinner');

	// Show progress elements
	loadingSpinner.style.display = 'block';
	progressContainer.classList.remove('hidden');

	let progress = 0;
	const interval = setInterval(() => {
		progress += Math.random() * 15;
		if (progress > 100) progress = 100;

		progressBar.style.width = progress + '%';

		if (progress >= 100) {
			clearInterval(interval);
			setTimeout(() => {
				callback();
			}, 500);
		}
	}, 100);
}

// Enhanced error handling
function showError(message, details = '') {
	step3.innerHTML = `
		<div style="color: #721c24; background: #f8d7da; padding: 2rem; border-radius: 10px; border: 1px solid #f5c6cb;">
			<i class="fas fa-exclamation-triangle fa-3x" style="color: #dc3545; margin-bottom: 1rem;"></i>
			<h3>Error</h3>
			<p><strong>${message}</strong></p>
			${details ? `<p style="font-size: 0.9rem; margin-top: 1rem;">${details}</p>` : ''}
			<button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
				Try Again
			</button>
		</div>
	`;
}
