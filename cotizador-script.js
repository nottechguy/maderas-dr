document.addEventListener('DOMContentLoaded', function() {
    // ===== DATOS Y VARIABLES =====
    var initialProducts = [
        { id: 1, name: 'Tabla 30cm x 2.5mts 3/4" (Primera)', price: 280.00 }, { id: 2, name: 'Tabla 25cm x 2.5mts 3/4" (Primera)', price: 235.00 }, { id: 3, name: 'Tabla 20cm x 2.5mts 3/4" (Primera)', price: 185.00 }, { id: 4, name: 'Tabla 15cm x 2.5mts 3/4" (Primera)', price: 140.00 }, { id: 5, name: 'Tabla 10cm x 2.5mts 3/4" (Primera)', price: 95.00 }, { id: 6, name: 'Fajilla 5cm x 2.5mts 3/4" (Primera)', price: 50.00 }, { id: 7, name: 'Tabla 30cm x 2.5mts 3/4" (Segunda)', price: 220.00 }, { id: 8, name: 'Tabla 25cm x 2.5mts 3/4" (Segunda)', price: 185.00 }, { id: 9, name: 'Tabla 20cm x 2.5mts 3/4" (Segunda)', price: 150.00 }, { id: 10, name: 'Tabla 15cm x 2.5mts 3/4" (Segunda)', price: 110.00 }, { id: 11, name: 'Tabla 10cm x 2.5mts 3/4" (Segunda)', price: 75.00 }, { id: 12, name: 'Fajilla 5cm x 2.5mts 3/4" (Segunda)', price: 40.00 }, { id: 13, name: 'Tabla 30cm x 2.5mts 3/4" (Tercera)', price: 180.00 }, { id: 14, name: 'Tabla 25cm x 2.5mts 3/4" (Tercera)', price: 150.00 }, { id: 15, name: 'Tabla 20cm x 2.5mts 3/4" (Tercera)', price: 120.00 }, { id: 16, name: 'Tabla 15cm x 2.5mts 3/4" (Tercera)', price: 90.00 }, { id: 17, name: 'Tabla 10cm x 2.5mts 3/4" (Tercera)', price: 60.00 }, { id: 18, name: 'Triplay 18mm x 1.22 x 2.44mts', price: 780.00 }, { id: 19, name: 'Triplay 15mm x 1.22 x 2.44mts', price: 640.00 }, { id: 20, name: 'Barrote de segunda 5cm x 10cm 2.5mts', price: 150.00 }, { id: 21, name: 'Polin de segunda 10cm x 10cm 2.5mts', price: 300.00 }
    ];
    var products = [];
    var quoteItems = [];
    var get = function(id) { return document.getElementById(id); };

    // ===== FUNCIONES AUXILIARES =====
    var formatCurrency = function(amount) {
        var formattedAmount = parseFloat(amount || 0).toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return '$' + formattedAmount;
    };

    function numeroALetras(num) {
        if (num === null || num === undefined) {
            return "Cero pesos 00/100 M.N.";
        }

        var numero = parseFloat(num).toFixed(2);
        var [entero, decimales] = numero.split('.');

        var unidades = ["", "un ", "dos ", "tres ", "cuatro ", "cinco ", "seis ", "siete ", "ocho ", "nueve "];
        var decenas = ["diez ", "once ", "doce ", "trece ", "catorce ", "quince ", "dieciséis ", "diecisiete ", "dieciocho ", "diecinueve "];
        var veintenas = ["", "", "veinte ", "treinta ", "cuarenta ", "cincuenta ", "sesenta ", "setenta ", "ochenta ", "noventa "];

        var convertirDecenas = function(n) {
            n = n % 100;
            if (n === 0) return "";
            if (n < 10) return unidades[n];
            if (n < 20) return decenas[n - 10];
            if (n > 20 && n < 30) return "veinti" + unidades[n % 10];
            var d = Math.floor(n / 10);
            var u = n % 10;
            return veintenas[d] + (u > 0 ? "y " + unidades[u] : "");
        };

        var convertirCentenas = function(n) {
            if (n > 99) {
                if (n == 100) return "cien ";
                else {
                    var c = Math.floor(n / 100);
                    return ["", "ciento ", "doscientos ", "trescientos ", "cuatrocientos ", "quinientos ", "seiscientos ", "setecientos ", "ochocientos ", "novecientos "][c];
                }
            }
            return "";
        };

        var convertirMiles = function(n) {
            if (n < 1000) return convertirCentenas(n) + convertirDecenas(n);
            var miles = Math.floor(n / 1000);
            var resto = n % 1000;
            var milesTexto = miles === 1 ? "mil " : (convertirCentenas(miles) + convertirDecenas(miles)) + "mil ";
            var restoTexto = convertirCentenas(resto) + convertirDecenas(resto);
            return milesTexto + restoTexto;
        };

        var convertirMillones = function(n) {
            if (n < 1000000) return convertirMiles(n);
            var millones = Math.floor(n / 1000000);
            var resto = n % 1000000;
            var millonesTexto = millones === 1 ? "un millón " : convertirMiles(millones) + "millones ";
            var restoTexto = convertirMiles(resto);
            return millonesTexto + restoTexto;
        };

        var enteroLetras = parseInt(entero) > 0 ? convertirMillones(parseInt(entero)) : "cero";
        var parteDecimal = parseInt(decimales) > 0 ? " " + decimales + "/100 M.N." : " 00/100 M.N.";
        
        var resultado = enteroLetras.trim() + " pesos" + parteDecimal;
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
    }

    var loadProductsFromLocalStorage = function() {
        var stored = localStorage.getItem('madereria_products');
        products = stored && JSON.parse(stored).length > 0 ? JSON.parse(stored) : initialProducts;
    };

    // ===== FUNCIONES DE RENDERIZADO =====
    var renderViews = function() {
        renderMaterialList();
        renderPdfTable();
        renderProductSelector();
    };

    var renderMaterialList = function() {
        var listContainer = get('cotizacion-list');
        listContainer.innerHTML = '';
        var subtotal = 0;
        quoteItems.forEach(function(item) {
            var product = products.find(function(p) { return p.id == item.id; });
            if (!product) return;
            var itemSubtotal = item.quantity * product.price;
            subtotal += itemSubtotal;

            var listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.dataset.id = item.id;
            listItem.innerHTML = `
                <div class="item-main">
                    <div class="item-text">
                        <span class="text-primary">${product.name}</span>
                        <span class="text-secondary">
                            Cantidad: <input type="number" value="${item.quantity}" min="1" class="cantidad-input-list"> @ ${formatCurrency(product.price)}
                        </span>
                    </div>
                    <div class="item-subtotal">${formatCurrency(itemSubtotal)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-delete-item" title="Quitar producto">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </button>
                </div>`;
            listContainer.appendChild(listItem);
        });

        var ivaCheckbox = get('iva-checkbox');
        var breakdownContainer = get('totals-breakdown');
        var iva = 0;
        var total = subtotal;

        if (ivaCheckbox.checked) {
            iva = subtotal * 0.16;
            total = subtotal + iva;
            breakdownContainer.innerHTML = `
                <div class="total-line"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                <div class="total-line"><span>IVA (16%)</span><span>${formatCurrency(iva)}</span></div>
                <div class="total-line grand-total"><span>Total</span><span>${formatCurrency(total)}</span></div>`;
        } else {
            breakdownContainer.innerHTML = `<div class="total-line grand-total"><span>Total</span><span>${formatCurrency(total)}</span></div>`;
        }
        
        get('total-en-letra').textContent = numeroALetras(total);
        
        var accionesFinales = document.querySelector('.acciones-finales');
        if (quoteItems.length > 0) {
            accionesFinales.classList.remove('hidden');
        } else {
            accionesFinales.classList.add('hidden');
        }
    };

    var renderPdfTable = function() {
    };

    var renderProductSelector = function() {
        var select = get('producto-select');
        select.innerHTML = '<option value="">-- Seleccione un producto --</option>';
        products.forEach(function(p) { select.innerHTML += `<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`; });
    };

    // ===== EVENT LISTENERS =====
    get('cotizacion-list').addEventListener('input', function(e) {
        if (e.target.classList.contains('cantidad-input-list')) {
            var listItem = e.target.closest('.list-item');
            if (!listItem) return;
            var id = listItem.dataset.id;
            var newQuantity = parseInt(e.target.value, 10) || 0;
            var item = quoteItems.find(function(q) { return q.id == id; });
            var product = products.find(function(p) { return p.id == id; });
            if (!item || !product) return;
            item.quantity = newQuantity;

            var itemSubtotal = item.quantity * product.price;
            var subtotalElement = listItem.querySelector('.item-subtotal');
            if (subtotalElement) {
                subtotalElement.textContent = formatCurrency(itemSubtotal);
            }
            
            var subtotal = 0;
            quoteItems.forEach(function(quoteItem) {
                var associatedProduct = products.find(function(p) { return p.id == quoteItem.id; });
                if (associatedProduct) {
                    subtotal += quoteItem.quantity * associatedProduct.price;
                }
            });

            var ivaCheckbox = get('iva-checkbox');
            var breakdownContainer = get('totals-breakdown');
            var total = subtotal;

            if (ivaCheckbox.checked) {
                var iva = subtotal * 0.16;
                total = subtotal + iva;
                breakdownContainer.innerHTML = `
                    <div class="total-line"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                    <div class="total-line"><span>IVA (16%)</span><span>${formatCurrency(iva)}</span></div>
                    <div class="total-line grand-total"><span>Total</span><span>${formatCurrency(total)}</span></div>`;
            } else {
                breakdownContainer.innerHTML = `<div class="total-line grand-total"><span>Total</span><span>${formatCurrency(total)}</span></div>`;
            }
            get('total-en-letra').textContent = numeroALetras(total);
            renderPdfTable();
        }
    });

    get('cotizacion-list').addEventListener('click', function(e) {
        var deleteButton = e.target.closest('.btn-delete-item');
        if (deleteButton) {
            var id = deleteButton.closest('.list-item').dataset.id;
            quoteItems = quoteItems.filter(function(item) { return item.id != id; });
            renderViews();
        }
    });

    get('btn-agregar-producto').addEventListener('click', function() {
        var productId = get('producto-select').value;
        if (!productId) return;
        var existing = quoteItems.find(function(item) { return item.id == productId; });
        if (existing) { existing.quantity++; } 
        else { quoteItems.push({ id: productId, quantity: 1 }); }
        renderViews();
    });

    get('btn-limpiar-cotizacion').addEventListener('click', function() {
        if (confirm('¿Limpiar la cotización actual?')) {
            quoteItems = [];
            renderViews();
        }
    });

    get('iva-checkbox').addEventListener('change', renderViews);

    get('btn-exportar-pdf').addEventListener('click', async function() {
        function loadImageAsDataURL(url) {
            return new Promise(function(resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = this.naturalWidth;
                    canvas.height = this.naturalHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(this, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = function() { reject(new Error('No se pudo cargar la imagen: ' + url)); };
                img.src = url;
            });
        }

        try {
            var logoBase64 = await loadImageAsDataURL('logo.png');
            var nombreCliente = get('cliente-nombre').value.trim();
            var domicilioCliente = get('cliente-domicilio').value.trim();
            var lugarCliente = get('cliente-lugar').value.trim();
            var rfcCliente = get('cliente-rfc').value.trim();
            var jsPDF = window.jspdf.jsPDF;
            var doc = new jsPDF('p', 'mm', 'a4');
            var pageHeight = doc.internal.pageSize.getHeight();
            var pageWidth = doc.internal.pageSize.getWidth();
            var margin = 15;
            var y = 20;
            var lineHeight = 6;

            doc.addImage(logoBase64, 'PNG', margin, y - 8, 30, 30, 15);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("MADERERÍA DÍAZ", margin + 35, y);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            y += 5;
            doc.text("TABLAS - TABLONES - BARROTES - POLIN - TRIPLAY - FAJILLAS", margin + 35, y);
            y += 4;
            doc.text("Bulevard de las Naciones 2029 local 3, Playa Diamante, Acapulco Diamante, C.P. 39897", margin + 35, y);
            y += 4;
            doc.text("R.F.C. DIRR850320F24 | Tel: 742-120-24-02 / 744-265-44-30", margin + 35, y);
            y += 4;
            
            var fechaActual = new Date();
            var dia = ('0' + fechaActual.getDate()).slice(-2);
            var mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2); // Se suma 1 porque los meses empiezan en 0
            var anio = fechaActual.getFullYear();
            var fechaFormateada = dia + '/' + mes + '/' + anio;
            doc.text("Fecha: " + fechaFormateada, margin + 35, y);

            y += 12;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Datos del Cliente", margin, y);
            doc.setLineWidth(0.2);
            doc.line(margin, y + 2, pageWidth - margin, y + 2);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            y += lineHeight + 2;
            doc.text("Nombre: " + nombreCliente, margin, y);
            y += lineHeight;
            doc.text("Domicilio: " + domicilioCliente, margin, y);
            y += lineHeight;
            doc.text("Lugar: " + lugarCliente, margin, y);
            y += lineHeight;
            doc.text("R.F.C: " + rfcCliente, margin, y);

            y += 12;
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Cant.", margin, y);
            doc.text("Descripción", margin + 20, y);
            doc.text("P. Unit.", margin + 140, y, { align: 'right' });
            doc.text("Importe", margin + 175, y, { align: 'right' });
            doc.line(margin, y + 2, pageWidth - margin, y + 2);
            y += lineHeight + 2;
            doc.setFont("helvetica", "normal");
            var subtotal = 0;
            var hasNomenclatura = false;

            quoteItems.forEach(function(item) {
                if (y > pageHeight - 30) { doc.addPage(); y = 20; }
                var product = products.find(function(p) { return p.id == item.id; });
                if (!product) return;
                if (!hasNomenclatura && /\(Primera|Segunda|Tercera\)/g.test(product.name)) { hasNomenclatura = true; }
                var itemSubtotal = item.quantity * product.price;
                subtotal += itemSubtotal;
                var descriptionLines = doc.splitTextToSize(product.name, 90);
                doc.text(String(item.quantity), margin + 5, y, { align: 'center' });
                doc.text(descriptionLines, margin + 20, y);
                doc.text(formatCurrency(product.price), margin + 140, y, { align: 'right' });
                doc.text(formatCurrency(itemSubtotal), margin + 175, y, { align: 'right' });
                y += (descriptionLines.length * 5) + 2;
            });

            doc.line(margin, y, pageWidth - margin, y);
            y += lineHeight;
            if (hasNomenclatura) {
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.text("Nomenclatura: (Primera): Madera de primera, (Segunda): Madera de segunda, (Tercera): Madera de tercera.", margin, y);
                y += 10;
            }
            
            var ivaCheckbox = get('iva-checkbox');
            var iva = 0;
            var total = subtotal;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            if (ivaCheckbox.checked) {
                iva = subtotal * 0.16;
                total = subtotal + iva;
                doc.text("Subtotal:", margin + 140, y, { align: 'right' });
                doc.text(formatCurrency(subtotal), margin + 175, y, { align: 'right' });
                y += lineHeight;
                doc.text("IVA (16%):", margin + 140, y, { align: 'right' });
                doc.text(formatCurrency(iva), margin + 175, y, { align: 'right' });
                y += lineHeight;
            }
            doc.setFontSize(11);
            doc.text("Total:", margin + 140, y, { align: 'right' });
            doc.text(formatCurrency(total), margin + 175, y, { align: 'right' });
            y += lineHeight;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            var totalEnLetras = numeroALetras(total);
            var textoLargo = doc.splitTextToSize("(" + totalEnLetras + ")", 80);
            doc.text(textoLargo, margin + 175, y, { align: 'right' });
            var docname = 'cotizacion-madereria-diaz-';
            var docFecha = anio + '-' + mes + '-' + dia;

            if (nombreCliente != '') {
                docname = docname + nombreCliente.replace(/\s+/g, '-') + '-' + docFecha;
            } else {
                docname = docname + docFecha;
            }

            doc.save(docname + '.pdf');

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("No se pudo generar el PDF. Asegúrate de que la ruta al logo es correcta.");
        }
    });

    // ===== INICIALIZACIÓN =====
    var init = function() {
        loadProductsFromLocalStorage();
        renderViews();
    };

    init();
});
