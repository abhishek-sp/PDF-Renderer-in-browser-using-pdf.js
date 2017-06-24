var __PDF_DOC,
	__CURRENT_PAGE,
	__TOTAL_PAGES,
	__PAGE_RENDERING_IN_PROGRESS = 0,
	__CANVAS = $('#pdf-canvas').get(0),
	__CANVAS_CTX = __CANVAS.getContext('2d');

function showPDF(pdf_url) {
	$("#pdf-loader").show();

	PDFJS.getDocument({ url: pdf_url }).then(function(pdf_doc) {
		__PDF_DOC = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;
		
		// Hide pdf loader, show pdf container
		$("#pdf-loader").hide();
		$("#pdf-contents").show();
		$("#pdf-total-pages").text(__TOTAL_PAGES);
		showPage(1);
	}).catch(function(error) {
		$("#pdf-loader").hide();
		$("#upload-button").show();
		
		alert(error.message);
	});;
}

function showPage(page_no) {
	__PAGE_RENDERING_IN_PROGRESS = 1;
	__CURRENT_PAGE = page_no;

	// Disable buttons while page is being loaded
	$("#pdf-next, #pdf-prev").attr('disabled', 'disabled');
	$("#pdf-canvas").hide();   //During page render
	$("#page-loader").show();  //Hide canvas, show page loader
	$("#pdf-current-page").text(page_no);
	
	// Fetch the page
	__PDF_DOC.getPage(page_no).then(function(page) {
		
		var scale_required = __CANVAS.width / page.getViewport(1).width;
		var viewport = page.getViewport(scale_required);

		// Set canvas height
		__CANVAS.height = viewport.height;

		var renderContext = {
			canvasContext: __CANVAS_CTX,
			viewport: viewport
		};
		
		// Render page contents in the canvas
		page.render(renderContext).then(function() {
			__PAGE_RENDERING_IN_PROGRESS = 0;

			$("#pdf-next, #pdf-prev").removeAttr('disabled');

			$("#pdf-canvas").show(); // Show the canvas
			$("#page-loader").hide(); // Hide the page loader
            $("#main").hide();
		});
	});
}

$("#upload-button").on('click', function() {
	$("#file-to-upload").trigger('click');
});

// After choosing a PDF file
$("#file-to-upload").on('change', function() {
	// Validate PDF
    if(['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
        alert('Error : Not a PDF');
        return;
    }

	$("#upload-button").hide();

	showPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
});

// Previous page
$("#pdf-prev").on('click', function() {
	if(__CURRENT_PAGE != 1)
		showPage(--__CURRENT_PAGE);
});

// Next page
$("#pdf-next").on('click', function() {
	if(__CURRENT_PAGE != __TOTAL_PAGES)
		showPage(++__CURRENT_PAGE);
});