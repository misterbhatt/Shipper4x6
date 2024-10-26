document.getElementById("downloadSample").addEventListener("click", downloadSampleFile);
document.getElementById("generatePDF").addEventListener("click", generatePDF);

function downloadSampleFile() {
    const workbook = XLSX.utils.book_new();
    const data = [
        ["AWB No", "Customer Code", "Consignor Name", "Consignor Address", "GSTIN No", "Phone Number", "Email", "Weight", "Dimensions", "Declared Value", "Content Specifications", "Mode"]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "sample_file.xlsx");
}

function generatePDF() {
    const logoInput = document.getElementById("logoUpload").files[0];
    const excelFile = document.getElementById("excelUpload").files[0];
    
    if (!logoInput || !excelFile) {
        alert("Please upload both the logo and Excel file.");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (rows.length < 2) {
            alert("The Excel file is empty or incorrectly formatted.");
            return;
        }

        const [header, ...dataRows] = rows;
        const fields = dataRows[0];

        const awbNo = fields[0];
        const customerCode = fields[1];
        const consignorName = fields[2];
        const consignorAddress = fields[3];
        const gstin = fields[4] || "";
        const phone = fields[5];
        const email = fields[6];
        const weight = fields[7];
        const dimensions = fields[8] || "";
        const declaredValue = fields[9] || "";
        const contentSpec = fields[10];
        const mode = fields[11];

        const logoReader = new FileReader();
        logoReader.onload = function (event) {
            const logoDataURL = event.target.result;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: "in", format: [4, 6] });

            // Logo aligned to the right
            doc.addImage(logoDataURL, "PNG", 2.8, 0.2, 1.2, 0.6);

            // Set font size for compactness
            doc.setFontSize(8);

            // "Sender Details" Section
            doc.text("From Details:", 0.2, 0.7);
            doc.text(`Customer Code: ${customerCode}`, 0.2, 0.9);
            doc.text(`Name: ${consignorName}`, 0.2, 1.1);
            doc.text(`Address: ${consignorAddress}`, 0.2, 1.3);
            doc.text(`GSTIN: ${gstin}`, 0.2, 1.5);
            doc.text(`Phone: ${phone}`, 0.2, 1.7);
            doc.text(`Email: ${email}`, 0.2, 1.9);

            // Thinner separator line
            doc.setLineWidth(0.05);
            doc.line(0.2, 2.0, 3.8, 2.0);

            // Shipment Details Section
            doc.text("Shipment Details:", 0.2, 2.3);
            doc.text(`Dimensions: ${dimensions}`, 0.2, 2.5);
            doc.text(`Declared Value: ${declaredValue}`, 0.2, 2.7);
            doc.text(`Content Specifications: ${contentSpec}`, 0.2, 2.9);

            // Separator line
            doc.line(0.2, 3.0, 3.8, 3.0);

            // Mode and Barcode Section
            doc.text(`Mode: ${mode}`, 0.2, 3.3);

            // Generate and add barcode for AWB No
            const barcodeCanvas = document.createElement("canvas");
            JsBarcode(barcodeCanvas, awbNo, { format: "CODE128" });
            const barcodeDataURL = barcodeCanvas.toDataURL("image/png");
            doc.addImage(barcodeDataURL, "PNG", 0.2, 3.4, 3.6, 0.6);

            // Center-aligned AWB No with spacing below the barcode
            doc.text(`AWB No: ${awbNo}`, 2, 4.1, { align: "center" });

            // Separator line
            doc.line(0.2, 4.2, 3.8, 4.2);

            // Set font size 
            doc.setFontSize(10);

            // Consignee Details Section (Empty Fields for now)
            doc.text("Consignee/Receiver Details:", 0.2, 4.5);
            doc.text("Name:", 0.2, 4.7);
            doc.text("Address Line 1:", 0.2, 4.9);
            doc.text("Address Line 2:", 0.2, 5.1);
            doc.text("Phone:", 0.2, 5.3);

            doc.save("Shipping_Label.pdf");
        };
        logoReader.readAsDataURL(logoInput);
    };
    reader.readAsArrayBuffer(excelFile);
}
