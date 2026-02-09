// db.js - Módulo para manejar la base de datos IndexedDB

var db; // Variable para mantener la instancia de la base de datos

function openDB(callback) {
    var request = indexedDB.open('MaderasDRDB', 1);

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Base de datos abierta exitosamente.");
        if (callback) callback();
    };

    // Esta función solo se ejecuta si la versión de la BD cambia o si no existe
    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        console.log("Actualizando la estructura de la base de datos...");

        // 1. Tabla (Object Store) para la información del negocio
        if (!db.objectStoreNames.contains('business_info')) {
            db.createObjectStore('business_info', { keyPath: 'id' });
        }

        // 2. Tabla para las categorías de productos
        if (!db.objectStoreNames.contains('product_category')) {
            db.createObjectStore('product_category', { keyPath: 'id', autoIncrement: true });
        }

        // 3. Tabla para los productos
        if (!db.objectStoreNames.contains('products')) {
            var productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            // Índices para buscar productos más eficientemente en el futuro
            productsStore.createIndex('name', 'name', { unique: false });
            productsStore.createIndex('product_category', 'product_category', { unique: false });
        }
    };
}

// --- FUNCIONES CRUD GENÉRICAS ---

function addData(storeName, data, callback) {
    var transaction = db.transaction([storeName], 'readwrite');
    var store = transaction.objectStore(storeName);
    var request = store.add(data);
    request.onsuccess = function() {
        if (callback) callback();
    };
    request.onerror = function(event) {
        console.error("Error al agregar datos en " + storeName + ":", event.target.error);
    };
}

function getAllData(storeName, callback) {
    var transaction = db.transaction([storeName], 'readonly');
    var store = transaction.objectStore(storeName);
    var request = store.getAll();
    request.onsuccess = function() {
        if (callback) callback(request.result);
    };
    request.onerror = function(event) {
        console.error("Error al obtener datos de " + storeName + ":", event.target.error);
    };
}

function updateData(storeName, data, callback) {
    var transaction = db.transaction([storeName], 'readwrite');
    var store = transaction.objectStore(storeName);
    var request = store.put(data);
    request.onsuccess = function() {
        if (callback) callback();
    };
    request.onerror = function(event) {
        console.error("Error al actualizar datos en " + storeName + ":", event.target.error);
    };
}

function deleteData(storeName, id, callback) {
    var transaction = db.transaction([storeName], 'readwrite');
    var store = transaction.objectStore(storeName);
    var request = store.delete(id);
    request.onsuccess = function() {
        if (callback) callback();
    };
    request.onerror = function(event) {
        console.error("Error al eliminar dato en " + storeName + ":", event.target.error);
    };
}

// --- FUNCIONES ESPECÍFICAS PARA BUSINESS_INFO (ya que solo hay un registro) ---

function getBusinessInfo(callback) {
    var transaction = db.transaction(['business_info'], 'readonly');
    var store = transaction.objectStore('business_info');
    var request = store.get(1); // Usamos una clave fija '1'
    request.onsuccess = function() {
        if (callback) callback(request.result);
    };
}

function updateBusinessInfo(data, callback) {
    data.id = 1; // Aseguramos que la clave siempre sea '1'
    updateData('business_info', data, callback);
}

