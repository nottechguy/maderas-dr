document.addEventListener('DOMContentLoaded', function() {
    // ===== APPLICATION STATE =====
    var businessInfo = {};
    var products = [];
    var categories = [];
    var quoteItems = [];
    var filteredProducts = [];
    var currentSort = 'name';
    var priceSortDirection = 'asc';
    var get = function(id) { return document.getElementById(id); };
    
    var menuIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
    var menuOpenIcon = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0,0h24v24H0V0z" fill="none"/><path d="M3,18h13v-2H3V18z M3,13h10v-2H3V13z M3,6v2h13V6H3z M21,15.59L17.42,12L21,8.41L19.59,7l-5,5l5,5L21,15.59z"/></svg>';

    // ===== MODAL HELPER FUNCTIONS =====
    var appModal = get('app-modal');
    var modalTitle = get('modal-title-generic');
    var modalMessage = get('modal-message-generic');
    var modalButtons = get('modal-buttons-generic');

    function showAlert(message, title) {
        if (!appModal) return;
        modalTitle.textContent = title || 'Aviso';
        modalMessage.textContent = message;
        modalButtons.innerHTML = '<button id="modal-ok-btn" class="btn-confirm">Aceptar</button>';
        appModal.showModal();
        get('modal-ok-btn').onclick = function() {
            appModal.close();
        };
    }

    function showConfirm(message, title, onConfirm) {
        if (!appModal) return;
        modalTitle.textContent = title || 'Confirmar';
        modalMessage.textContent = message;
        modalButtons.innerHTML = `
            <button id="modal-cancel-btn">Cancelar</button>
            <button id="modal-confirm-btn" class="btn-danger">Confirmar</button>
        `;
        appModal.showModal();
        
        get('modal-cancel-btn').onclick = function() {
            appModal.close();
        };
        get('modal-confirm-btn').onclick = function() {
            appModal.close();
            if (onConfirm) onConfirm();
        };
    }

    // ===== NAVIGATION AND VIEWS =====
    var cotizadorView = get('cotizador-view');
    var productosView = get('productos-view');
    var categoriesView = get('categories-view');
    var infoView = get('info-view');
    var welcomeView = get('welcome-view');
    var appLayout = get('app-layout');
    
    var navCotizador = get('nav-cotizador');
    var navProductosToggle = get('nav-productos-toggle');
    var navCategories = get('nav-categories');
    var navProductList = get('nav-product-list');
    var navInfo = get('nav-info');
    
    var sidebar = document.querySelector('.sidebar');
    var scrim = get('scrim'); 
    var menuToggle = get('menu-toggle');

   var showView = function(viewToShow, activeLink) {
        // Hide all main views
        [cotizadorView, productosView, categoriesView, infoView].forEach(function(v) { if(v) v.classList.add('hidden'); });
        if (viewToShow) viewToShow.classList.remove('hidden');
        
        // Clear all active links
        document.querySelectorAll('.sidebar-nav a').forEach(function(n) { n.classList.remove('active'); });
        if (activeLink) activeLink.classList.add('active');

        var fab = get('fab-add-product');
        if (fab) {
            if (viewToShow === productosView) {
                fab.classList.remove('fab-hidden');
            } else {
                fab.classList.add('fab-hidden');
            }
        }
    };

    // ===== ✨ ROUTING LOGIC ✨ =====
    function handleRouting() {
        var hash = window.location.hash || '#cotizador';
        var productSubmenu = navProductosToggle ? navProductosToggle.parentElement : null;

        // Close any open submenus before switching views
        if (productSubmenu && hash !== '#productos' && hash !== '#categorias') {
            productSubmenu.classList.remove('open');
        }

        switch (hash) {
            case '#categorias':
                showView(categoriesView, navCategories);
                if (productSubmenu) productSubmenu.classList.add('open');
                break;
            case '#productos':
                showView(productosView, navProductList);
                if (productSubmenu) productSubmenu.classList.add('open');
                break;
            case '#info':
                showView(infoView, navInfo);
                break;
            case '#cotizador':
            default:
                showView(cotizadorView, navCotizador);
                break;
        }
    }

    // ===== EVENT HANDLERS =====
    function closeSidebar() {
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (menuToggle) menuToggle.innerHTML = menuIcon;
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                menuToggle.innerHTML = menuOpenIcon;
            } else {
                menuToggle.innerHTML = menuIcon;
            }
        });
    }

    if (navProductosToggle) {
        navProductosToggle.addEventListener('click', function(e) {
            e.preventDefault();
            this.parentElement.classList.toggle('open');
        });
    }
    
    document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(function(link) {
        if (link.id === 'nav-productos-toggle') return;
        link.addEventListener('click', function() {
            if (sidebar && window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                if (menuToggle) menuToggle.innerHTML = menuIcon;
            }
        });
    });
    
    if (scrim) {
        scrim.addEventListener('click', closeSidebar);
    }

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (menuToggle) menuToggle.innerHTML = menuIcon;
        }
    });

    // ===== MODAL AND FORMS =====
    var productModal = get('product-modal');
    var formProducto = get('form-producto');
    var businessInfoForm = get('business-info-form');
    var categoryForm = get('category-form');

    var openProductModal = function(product) {
        if (!productModal) return;
        formProducto.reset();
        renderCategorySelector(get('producto-categoria'));
        if (product) {
            get('modal-title').textContent = 'Editar Producto';
            get('producto-id').value = product.id;
            get('producto-sku').value = product.sku;
            get('producto-nombre').value = product.name;
            get('producto-descripcion').value = product.description;
            get('producto-categoria').value = product.product_category;
            get('producto-stock').value = product.stock;
            get('producto-precio').value = product.price;
        } else {
            get('modal-title').textContent = 'Agregar Producto';
            get('producto-id').value = '';
        }
        productModal.showModal();
    };
    
    var fabButton = get('fab-add-product');
    if (fabButton) fabButton.addEventListener('click', function() { openProductModal(); });
    var showAddModalButton = get('btn-show-add-modal');
    if (showAddModalButton) showAddModalButton.addEventListener('click', function() { openProductModal(); });
    var cancelModalButton = get('btn-cancelar-modal');
    if (cancelModalButton) cancelModalButton.addEventListener('click', function() { productModal.close(); });
    if (get('begin-setup-btn')) get('begin-setup-btn').addEventListener('click', function() {
        welcomeView.classList.add('hidden');
        appLayout.classList.remove('hidden');
        showView(infoView, navInfo);
    });
    if (get('info-logo')) get('info-logo').addEventListener('change', function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var preview = get('logo-preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // ===== DATA LOGIC AND RENDERING =====
    function formatDate(format, dateInput) {
        var date;

        if (dateInput === undefined || dateInput === null) {
            date = new Date();
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) {
            return ''; // Return empty string for invalid dates
        }

        var padTwoDigits = function(num) {
            return String(num).padStart(2, '0');
        };

        var hours24 = date.getHours();
        var ampm = hours24 >= 12 ? 'pm' : 'am';
        var hours12 = hours24 % 12;
        hours12 = hours12 ? hours12 : 12; // the hour '0' should be '12'

        var replacements = {
            YYYY: date.getFullYear(),
            MM: padTwoDigits(date.getMonth() + 1),
            DD: padTwoDigits(date.getDate()),
            hh: padTwoDigits(hours24),
            h: hours12,
            mm: padTwoDigits(date.getMinutes()),
            ss: padTwoDigits(date.getSeconds()),
            a: ampm
        };

        // Replace all placeholders with their corresponding values
        return format.replace(/YYYY|MM|DD|hh|h|mm|ss|a/g, function(match) {
            return replacements[match];
        });
    }
    

    var formatCurrency = function(amount) {
        var formattedAmount = parseFloat(amount || 0).toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return '$' + formattedAmount;
    };
    
    function numeroALetras(num) {
        if (num === null || num === undefined) return "Cero pesos 00/100 M.N.";
        var numero = parseFloat(num).toFixed(2);
        var [entero, decimales] = numero.split('.');
        var unidades = ["", "un ", "dos ", "tres ", "cuatro ", "cinco ", "seis ", "siete ", "ocho ", "nueve "];
        var decenas = ["diez ", "once ", "doce ", "trece ", "catorce ", "quince ", "dieciséis ", "diecisiete ", "dieciocho ", "diecinueve "];
        var veintenas = ["", "", "veinte ", "treinta ", "cuarenta ", "cincuenta ", "sesenta ", "setenta ", "ochenta ", "noventa "];
        var convertirDecenas = function(n) { n = n % 100; if (n === 0) return ""; if (n < 10) return unidades[n]; if (n < 20) return decenas[n - 10]; if (n > 20 && n < 30) return "veinti" + unidades[n % 10]; var d = Math.floor(n / 10); var u = n % 10; return veintenas[d] + (u > 0 ? "y " + unidades[u] : ""); };
        var convertirCentenas = function(n) { if (n > 99) { if (n == 100) return "cien "; else { var c = Math.floor(n / 100); return ["", "ciento ", "doscientos ", "trescientos ", "cuatrocientos ", "quinientos ", "seiscientos ", "setecientos ", "ochocientos ", "novecientos "][c]; } } return ""; };
        var convertirMiles = function(n) { if (n < 1000) return convertirCentenas(n) + convertirDecenas(n); var miles = Math.floor(n / 1000); var resto = n % 1000; var milesTexto = miles === 1 ? "mil " : (convertirCentenas(miles) + convertirDecenas(miles)) + "mil "; var restoTexto = convertirCentenas(resto) + convertirDecenas(resto); return milesTexto + restoTexto; };
        var convertirMillones = function(n) { if (n < 1000000) return convertirMiles(n); var millones = Math.floor(n / 1000000); var resto = n % 1000000; var millonesTexto = millones === 1 ? "un millón " : convertirMiles(millones) + "millones "; var restoTexto = convertirMiles(resto); return millonesTexto + restoTexto; };
        var enteroLetras = parseInt(entero) > 0 ? convertirMillones(parseInt(entero)) : "cero";
        var parteDecimal = parseInt(decimales) > 0 ? " " + decimales + "/100 M.N." : " 00/100 M.N.";
        var resultado = enteroLetras.trim() + " pesos" + parteDecimal;
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
    }
    
    var renderViews = function() {
        renderMaterialList();
        renderProductList();
        renderProductSelector();
        renderBusinessInfo();
        renderCategoryList();
    };

    var renderBusinessInfo = function() {
        var sidebarName = get('sidebar-business-name');
        if (sidebarName) sidebarName.textContent = businessInfo.name || 'MADERAS DR';
        var sidebarRfc = get('sidebar-rfc');
        if (sidebarRfc) sidebarRfc.textContent = businessInfo.rfc || 'N/A';
        var sidebarTel = get('sidebar-tel');
        if (sidebarTel) sidebarTel.textContent = businessInfo.contacto_telefono || 'N/A';
        
        var sidebarLogo = get('sidebar-logo');
        var previewLogo = get('logo-preview');
        if (businessInfo.logo) {
            if (sidebarLogo) {
                sidebarLogo.src = businessInfo.logo;
                sidebarLogo.style.display = "inline-block";
            }
            if (previewLogo) {
                previewLogo.src = businessInfo.logo;
                previewLogo.style.display = "inline-block";
            }
        }
        
        if (get('info-name')) {
            get('info-name').value = businessInfo.name || '';
            get('info-description').value = businessInfo.description || '';
            get('info-rfc').value = businessInfo.rfc || '';
            get('info-calle').value = businessInfo.ubicacion_calle || '';
            get('info-colonia').value = businessInfo.ubicacion_colonia || '';
            get('info-cp').value = businessInfo.ubicacion_codigo_postal || '';
            get('info-municipio').value = businessInfo.ubicacion_municipio || '';
            get('info-estado').value = businessInfo.ubicacion_estado || '';
            get('info-tel').value = businessInfo.contacto_telefono || '';
            get('info-email').value = businessInfo.contacto_correo_electronico || '';
        }
    };

    var renderCategorySelector = function(selectElement) {
        if (!selectElement) return;
        selectElement.innerHTML = '<option value="">-- Seleccione --</option>';
        categories.forEach(function(cat) {
            selectElement.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    };

    var renderMaterialList = function() {
        var listContainer = get('cotizacion-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';
        var subtotal = 0;
        quoteItems.forEach(function(item) {
            var product = products.find(function(p) { return p.id == item.id; });
            if (!product) return;

            var category = categories.find(function(c) { return c.id === product.product_category; });
            var categoryName = category ? category.name : 'Sin Categoría';            

            var itemSubtotal = item.quantity * product.price;
            subtotal += itemSubtotal;
            var listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.dataset.id = item.id;
            listItem.innerHTML = `
                <div class="item-main">
                    <div class="item-text">
                        <span class="item-category-tag">${categoryName}</span>
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
        if (ivaCheckbox && breakdownContainer) {
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
        }
        var totalEnLetra = get('total-en-letra');
        if (totalEnLetra) totalEnLetra.textContent = numeroALetras(total);
        var accionesFinales = document.querySelector('.acciones-finales');
        if (accionesFinales) {
            if (quoteItems.length > 0) {
                accionesFinales.classList.remove('hidden');
            } else {
                accionesFinales.classList.add('hidden');
            }
        }
    };

    var renderProductSelector = function() {
        var select = get('producto-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Seleccione un producto --</option>';
        
        // Sort products alphabetically for better usability
        var sortedProducts = [].slice.call(products).sort(function(a, b) {
            return (a.name || '').localeCompare(b.name || '');
        });

        sortedProducts.forEach(function(p) { 
            // Find the category for the current product
            var category = categories.find(function(c) {
                return c.id === p.product_category;
            });
            // Use a fallback text if category is not found
            var categoryName = category ? category.name : 'Sin Categoría';

            // Append the new option with the category name included
            select.innerHTML += `<option value="${p.id}">(${categoryName}) ${p.name} - ${formatCurrency(p.price)}</option>`; 
        });
    };
    var renderCategoryList = function() {
        var listContainer = get('category-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';
        categories.forEach(function(cat) {
            var item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <span>${cat.name}</span>
                <button class="btn-delete-category" data-id="${cat.id}" title="Eliminar categoría">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                </button>
            `;
            listContainer.appendChild(item);
        });
    };

var applySearchAndSort = function() {
        var searchInput = get('product-search-input');
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        if (searchTerm) {
            filteredProducts = products.filter(function(p) {
                return (p.name || '').toLowerCase().includes(searchTerm);
            });
        } else {
            filteredProducts = [].slice.call(products);
        }

        filteredProducts.sort(function(a, b) {
            if (currentSort === 'nombre') {
                return (a.name || '').localeCompare(b.name || '');
            }
            if (currentSort === 'categoria') {
                var catA = categories.find(function(c) { return c.id === a.product_category; });
                var catB = categories.find(function(c) { return c.id === b.product_category; });
                return (catA ? catA.name : '').localeCompare(catB ? catB.name : '');
            }
            if (currentSort === 'precio') {
                // ✨ Lógica para orden ascendente y descendente ✨
                if (priceSortDirection === 'asc') {
                    return (a.price || 0) - (b.price || 0);
                } else {
                    return (b.price || 0) - (a.price || 0);
                }
            }
            return 0;
        });
    };

    var renderProductList = function() {
        var listContainer = get('product-list-container');
        if (!listContainer) return;
        applySearchAndSort();
        listContainer.innerHTML = '';
        if (filteredProducts.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No se encontraron productos.</p>';
            return;
        }
        filteredProducts.forEach(function(p) {
            var category = categories.find(function(c) { return c.id === p.product_category; });
            var categoryName = category ? category.name : 'Sin categoría';
            var item = document.createElement('div');
            item.className = 'product-list-item';
            item.dataset.id = p.id;
            item.innerHTML = `
                <div class="product-summary">
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-category">${categoryName}</div>
                    </div>
                    <div class="product-price">${formatCurrency(p.price)}</div>
                    <div class="product-actions">
                        <button class="btn-editar" data-id="${p.id}">Editar</button>
                        <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
                        <button class="expand-icon" title="Ver detalles">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="product-details">
                    <div class="details-grid">
                        <div><span class="label">SKU</span><span>${p.sku || 'N/A'}</span></div>
                        <div><span class="label">Stock</span><span>${p.stock}</span></div>
                        <div><span class="label">Descripción</span><span>${p.description || 'Sin descripción'}</span></div>
                    </div>
                </div>`;
            listContainer.appendChild(item);
        });
    };
    
    // ===== ADDITIONAL EVENT HANDLERS =====
    if (formProducto) {
        formProducto.addEventListener('submit', function(e) {
            e.preventDefault();
            var id = parseInt(get('producto-id').value);
            var productData = {
                sku: get('producto-sku').value,
                name: get('producto-nombre').value,
                description: get('producto-descripcion').value,
                product_category: parseInt(get('producto-categoria').value),
                stock: parseInt(get('producto-stock').value),
                price: parseFloat(get('producto-precio').value)
            };
    
            if (id) {
                productData.id = id;
                updateData('products', productData, function() {
                    showAlert('Producto actualizado', 'Éxito');
                    productModal.close();
                    fetchAndRenderAllData();
                });
            } else {
                addData('products', productData, function() {
                    showAlert('Producto agregado', 'Éxito');
                    productModal.close();
                    fetchAndRenderAllData();
                });
            }
        });
    }

    if (businessInfoForm) {
        businessInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var logoInput = get('info-logo');
            var logoFile = logoInput ? logoInput.files[0] : null;
            var saveData = function(logoBase64) {
                var infoData = {
                    id: 1,
                    name: get('info-name').value,
                    logo: logoBase64 || businessInfo.logo,
                    description: get('info-description').value,
                    rfc: get('info-rfc').value,
                    ubicacion_calle: get('info-calle').value,
                    ubicacion_colonia: get('info-colonia').value,
                    ubicacion_codigo_postal: get('info-cp').value,
                    ubicacion_municipio: get('info-municipio').value,
                    ubicacion_estado: get('info-estado').value,
                    contacto_telefono: get('info-tel').value,
                    contacto_correo_electronico: get('info-email').value
                };
                updateBusinessInfo(infoData, function() {
                    showAlert('Información guardada', 'Éxito');
                    getAllData('products', function(products) {
                        if (products.length === 0) {
                            populateProductsAndCategories(fetchAndRenderAllData);
                        } else {
                            fetchAndRenderAllData();
                        }
                    });
                });
            };
            if (logoFile) {
                var reader = new FileReader();
                reader.onload = function(e) { saveData(e.target.result); };
                reader.readAsDataURL(logoFile);
            } else {
                saveData(null);
            }
        });
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var newCategoryNameInput = get('new-category-name');
            var newCategoryName = newCategoryNameInput.value.trim();

            if (newCategoryName) {
                addData('product_category', { name: newCategoryName }, function() {
                    showAlert('Categoría "' + newCategoryName + '" agregada.', 'Éxito');
                    newCategoryNameInput.value = '';
                    fetchAndRenderAllData();
                });
            }
        });
    }

    var categoryList = get('category-list');
    if (categoryList) {
        categoryList.addEventListener('click', function(e) {
            var deleteButton = e.target.closest('.btn-delete-category');
            if (deleteButton) {
                var categoryId = parseInt(deleteButton.dataset.id);
                var categoryItemElement = deleteButton.closest('.category-item');
                var isCategoryInUse = products.some(function(p) { return p.product_category === categoryId; });
                if (isCategoryInUse) {
                    showAlert("No se puede eliminar esta categoría porque está siendo utilizada por uno o más productos.", "Categoría en Uso");
                    return;
                }
                showConfirm("¿Estás seguro de que quieres eliminar esta categoría?", "Confirmar Eliminación", function() {
                    deleteData('product_category', categoryId, function() {
                        if (categoryItemElement) {
                            categoryItemElement.remove();
                        }
                        fetchAndRenderAllData();
                        showAlert('Categoría eliminada.', 'Éxito');
                    });
                });
            }
        });
    }

    var productListContainer = get('product-list-container');
    if (productListContainer) {
        productListContainer.addEventListener('click', function(e) {
            var target = e.target;
            var expandButton = target.closest('.expand-icon');
            if (expandButton) {
                expandButton.closest('.product-list-item').classList.toggle('expanded');
                return;
            }
            var productId = parseInt(target.dataset.id);
            if (target.classList.contains('btn-editar')) {
                var productToEdit = products.find(function(p) { return p.id === productId; });
                if (productToEdit) {
                    openProductModal(productToEdit);
                }
            }
            if (target.classList.contains('btn-eliminar')) {
                showConfirm("¿Estás seguro de que quieres eliminar este producto?", "Confirmar Eliminación", function() {
                    deleteData('products', productId, function() {
                        showAlert('Producto eliminado.', 'Éxito');
                        fetchAndRenderAllData();
                    });
                });
            }
        });
    }
    
    var cotizacionList = get('cotizacion-list');
    if (cotizacionList) {
        cotizacionList.addEventListener('input', function(e) {
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
            }
        });

        cotizacionList.addEventListener('click', function(e) {
            var deleteButton = e.target.closest('.btn-delete-item');
            if (deleteButton) {
                var id = deleteButton.closest('.list-item').dataset.id;
                quoteItems = quoteItems.filter(function(item) { return item.id != id; });
                renderViews();
            }
        });
    }
    
    var productSelect = get('producto-select');
    if (productSelect) {
        productSelect.addEventListener('change', function() {
            var addButton = get('btn-agregar-producto');
            if (this.value) {
                addButton.classList.remove('hidden');
            } else {
                addButton.classList.add('hidden');
            }
        });
    }

    var btnAgregarProducto = get('btn-agregar-producto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', function() {
            var productId = get('producto-select').value;
            if (!productId) return;

            // Check if the item is new before modifying the array
            var isNewItem = !quoteItems.some(function(item) { return item.id == productId; });

            var existing = quoteItems.find(function(item) { return item.id == productId; });
            if (existing) {
                existing.quantity++;
            } else {
                quoteItems.push({ id: productId, quantity: 1 });
            }
            
            renderViews(); // Redraws the list

            // Only scroll and animate if it's a brand new item
            if (isNewItem) {
                setTimeout(function() {
                    var listContainer = get('cotizacion-list');
                    var lastItem = listContainer.lastElementChild; // Get the last added item

                    if (lastItem) {
                        // Add the flash animation class
                        lastItem.classList.add('flash');

                        setTimeout(function() {
                            window.scrollTo({
                                top: document.body.scrollHeight,
                                behavior: 'smooth'
                            });
                        }, 100);

                        // Remove the class after the animation is done
                        // so it can be triggered again
                        setTimeout(function() {
                            lastItem.classList.remove('flash');
                        }, 700); // Must match the animation duration in CSS
                    }
                }, 100); // A small delay to ensure the DOM has updated
            }
        });
    }
    var btnLimpiarCotizacion = get('btn-limpiar-cotizacion');
    if (btnLimpiarCotizacion) {
        btnLimpiarCotizacion.addEventListener('click', function() {
            showConfirm("¿Limpiar la cotización actual?", "Confirmar Limpieza", function() {
                quoteItems = [];
                renderViews();
            });
        });
    }

    var ivaCheckbox = get('iva-checkbox');
    if (ivaCheckbox) {
        ivaCheckbox.addEventListener('change', renderViews);
    }
    
    var searchInput = get('product-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', renderProductList);
    }

    var searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        get('product-search-btn').addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                searchContainer.classList.toggle('collapsed');
                if (!searchContainer.classList.contains('collapsed')) {
                    searchInput.focus();
                }
            }
        });
        if (window.innerWidth <= 768) {
            searchContainer.classList.add('collapsed');
        }
    }

    var filterChipsContainer = document.querySelector('.filter-chips');
        if (filterChipsContainer) {
            filterChipsContainer.addEventListener('click', function(e) {
            var clickedChip = e.target.closest('.chip');
            if (clickedChip) {
                var newSort = clickedChip.dataset.sort;

                // Lógica para el chip de precio
                if (newSort === 'precio') {
                    if (currentSort === 'precio') {
                        // Si ya está ordenado por precio, invierte la dirección
                        priceSortDirection = (priceSortDirection === 'asc') ? 'desc' : 'asc';
                    } else {
                        // Si se acaba de seleccionar, resetea a ascendente
                        priceSortDirection = 'asc';
                    }
                }
                
                currentSort = newSort;

                // Actualiza la UI de los chips
                filterChipsContainer.querySelectorAll('.chip').forEach(function(c) {
                    c.classList.remove('active');
                    // Limpia flechas antiguas
                    var arrow = c.querySelector('.sort-arrow');
                    if (arrow) {
                        arrow.remove();
                    }
                });
                
                clickedChip.classList.add('active');
                
                // Añade la nueva flecha si es el chip de precio
                if (currentSort === 'precio') {
                    var arrowSpan = document.createElement('span');
                    arrowSpan.className = 'sort-arrow';
                    arrowSpan.innerHTML = (priceSortDirection === 'asc') ? '▲' : '▼';
                    clickedChip.appendChild(arrowSpan);
                }

                renderProductList();
            }
        });
    }
    
    get('btn-exportar-pdf').addEventListener('click', async function() {
        // This helper function to load the logo remains the same
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
            if (!businessInfo.logo) {
                showAlert("Por favor, sube un logo en la sección 'Información del Negocio' antes de exportar.");
                return;
            }
            var logoBase64 = businessInfo.logo;
            var nombreCliente = get('cliente-nombre').value.trim();
            var domicilioCliente = get('cliente-domicilio').value.trim();
            var lugarCliente = get('cliente-lugar').value.trim();
            var rfcCliente = get('cliente-rfc').value.trim();
            
            var jsPDF = window.jspdf.jsPDF;
            var doc = new jsPDF('p', 'mm', 'a4');

            doc.setProperties({
                title: 'Cotización - ' + (businessInfo.name || "MADERAS DR"),
                subject: 'Cotización de productos de madera para ' + nombreCliente,
                author: businessInfo.name || "MADERAS DR",
                keywords: 'cotizacion, madera, madereria, ' + nombreCliente,
                creator: 'Cotizador PWA'
            });

            var pageHeight = doc.internal.pageSize.getHeight();
            var pageWidth = doc.internal.pageSize.getWidth();
            var margin = 15;
            var y = 20;
            
            var primaryColor = '#2c3e50'; // Azul oscuro para texto principal
            var secondaryColor = '#555753'; // Gris para texto secundario
            var tableHeaderBg = '#f1f1f1'; // Fondo muy claro para encabezados de tabla

            // --- Encabezado ---
            doc.addImage(logoBase64, 'PNG', margin, y - 5, 35, 25); // Logo más grande
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(primaryColor);
            doc.text(businessInfo.name || "Nombre del Negocio", pageWidth - margin, y, { align: 'right' });
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(secondaryColor);
            y += 7;
            doc.text(businessInfo.description || "", pageWidth - margin, y, { align: 'right' });
            y += 4;
            var address = `${businessInfo.ubicacion_calle || ''}, ${businessInfo.ubicacion_colonia || ''}`;
            doc.text(address, pageWidth - margin, y, { align: 'right' });
            y += 4;
            var address2 = `${businessInfo.ubicacion_municipio || ''}, ${businessInfo.ubicacion_colonia || ''}, ${businessInfo.ubicacion_estado || ''}, C.P. ${businessInfo.ubicacion_codigo_postal || ''}`;
            doc.text(address2, pageWidth - margin, y, { align: 'right' });
            y += 4;
            var contact = `R.F.C. ${businessInfo.rfc || ''} | Tel: ${businessInfo.contacto_telefono || ''}`;
            doc.text(contact, pageWidth - margin, y, { align: 'right' });

            // --- Datos del Cliente y Fecha ---
            y += 8;
            doc.setLineWidth(0.2);
            doc.setDrawColor(secondaryColor);
            doc.line(margin, y, pageWidth - margin, y);
            
            y += 8;
            doc.setFontSize(10);
            doc.setTextColor(secondaryColor);
            doc.text("CLIENTE:", margin, y);
            doc.text("FECHA: " + formatDate('DD/MM/YYYY h:mm a'), pageWidth - margin, y, { align: 'right' });

            y += 5;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(primaryColor);
            doc.text(nombreCliente || "Cliente General", margin, y);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(secondaryColor);
            y += 5;

            doc.text("DOMICILIO: " + domicilioCliente, margin, y);
            y += 5;

            doc.text("LUGAR: " + lugarCliente, margin, y);
            y += 5;

            doc.text("R.F.C: " + rfcCliente, margin, y);

            y += 8;
            // Encabezados de la tabla
            doc.setFillColor(tableHeaderBg);
            doc.rect(margin, y - 5, pageWidth - (margin * 2), 8, 'F');
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(primaryColor);
            doc.text("Cant.", margin + 5, y);
            doc.text("Descripción", margin + 20, y);
            doc.text("Categoría", margin + 100, y); // <-- Nueva columna
            doc.text("P. Unit.", margin + 150, y, { align: 'right' });
            doc.text("Importe", margin + 175, y, { align: 'right' });
            y += 8;

            doc.setFont("helvetica", "normal");
            doc.setTextColor(primaryColor);
            var subtotal = 0;

            quoteItems.forEach(function(item) {
                if (y > pageHeight - 40) { // Salto de página
                    doc.addPage();
                    y = 20;
                }
                var product = products.find(function(p) { return p.id == item.id; });
                if (!product) return;

                var category = categories.find(function(c) { return c.id === product.product_category; });
                var categoryName = category ? category.name : 'N/A';
                
                var itemSubtotal = item.quantity * product.price;
                subtotal += itemSubtotal;
                var descriptionLines = doc.splitTextToSize(product.name, 75); // Ancho ajustado

                doc.text(String(item.quantity), margin + 8, y, { align: 'center' });
                doc.text(descriptionLines, margin + 20, y);
                doc.setTextColor(secondaryColor);
                doc.text(categoryName, margin + 100, y);
                doc.setTextColor(primaryColor);
                doc.text(formatCurrency(product.price), margin + 150, y, { align: 'right' });
                doc.text(formatCurrency(itemSubtotal), margin + 175, y, { align: 'right' });

                y += (descriptionLines.length * 5) + 4;
            });

            // --- Totales ---
            y += 5;
            var finalTotalsY = y > 220 ? 220 : y; // Mueve los totales más abajo si hay espacio
            doc.setLineWidth(0.5);
            doc.line(margin + 90, finalTotalsY, pageWidth - margin, finalTotalsY);
            finalTotalsY += 8;

            var ivaCheckbox = get('iva-checkbox');
            var iva = 0;
            var total = subtotal;
            
            if (ivaCheckbox.checked) {
                iva = subtotal * 0.16;
                total = subtotal + iva;
                doc.setFontSize(10);
                doc.setTextColor(secondaryColor);
                doc.text("Subtotal:", margin + 140, finalTotalsY, { align: 'right' });
                doc.text(formatCurrency(subtotal), margin + 175, finalTotalsY, { align: 'right' });
                finalTotalsY += 7;
                
                doc.text("IVA (16%):", margin + 140, finalTotalsY, { align: 'right' });
                doc.text(formatCurrency(iva), margin + 175, finalTotalsY, { align: 'right' });
                finalTotalsY += 7;
            }
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(primaryColor);
            doc.text("Total:", margin + 140, finalTotalsY, { align: 'right' });
            doc.text(formatCurrency(total), margin + 175, finalTotalsY, { align: 'right' });
            
            finalTotalsY += 7;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(secondaryColor);
            var totalEnLetras = numeroALetras(total);
            var textoLargo = doc.splitTextToSize("(" + totalEnLetras + ")", 80);
            doc.text(textoLargo, margin + 175, finalTotalsY, { align: 'right' });

            var finalDocname = "";
            var docDateFormat = formatDate('DD-MM-YYYY-h-mm-ss');
            if (nombreCliente !==  "") {
                finalDocname = nombreCliente.replace(/\s/g, '-') + '-' + docDateFormat;
            } else {
                finalDocname = docDateFormat;
            }

            // --- Guardar PDF ---
            doc.save('Cotizacion-' + (finalDocname || 'General') + '.pdf');

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            showAlert("No se pudo generar el PDF. Asegúrate de que la ruta al logo es correcta.");
        }
    });


    // ===== APP INITIALIZATION =====
    function fetchAndRenderAllData() {
        getAllData('products', function(allProducts) {
            products = allProducts;
            getAllData('product_category', function(allCategories) {
                categories = allCategories;
                getBusinessInfo(function(info) {
                    businessInfo = info || {};
                    renderViews();
                });
            });
        });
    }

    function populateDatabase(callback) {
        console.log("Populating database with initial data...");
        var populateCoreData = function() {
            var categoriesAdded = 0;
            initialCategories.forEach(function(cat) {
                addData('product_category', cat, function() {
                    categoriesAdded++;
                    if (categoriesAdded === initialCategories.length) {
                        var productsAdded = 0;
                        initialProducts.forEach(function(prod) {
                            addData('products', prod, function() {
                                productsAdded++;
                                if (productsAdded === initialProducts.length) {
                                    if (callback) callback();
                                }
                            });
                        });
                    }
                });
            });
        };

        // Si hay datos iniciales de negocio, los guarda primero
        if (typeof initialBusinessInfo !== 'undefined' && initialBusinessInfo.name) {
            updateBusinessInfo(initialBusinessInfo, populateCoreData);
        } else {
            populateCoreData();
        }
    }

    openDB(function() {
        getBusinessInfo(function(info) {
            if (info && info.name) {
                appLayout.classList.remove('hidden');
                welcomeView.classList.add('hidden');
                fetchAndRenderAllData();
                window.addEventListener('hashchange', handleRouting);
                handleRouting();
            } else {
                if (typeof initialBusinessInfo !== 'undefined' && initialBusinessInfo.name) {
                    populateDatabase(function() {
                        appLayout.classList.remove('hidden');
                        welcomeView.classList.add('hidden');
                        fetchAndRenderAllData();
                        window.addEventListener('hashchange', handleRouting);
                        handleRouting();
                    });
                } else {
                    welcomeView.classList.remove('hidden');
                    appLayout.classList.add('hidden');
                }
            }
        });
    });
});



