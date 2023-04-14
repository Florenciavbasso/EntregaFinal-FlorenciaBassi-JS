let stock = []

fetch('/data.json')
    .then((res) => res.json())
    .then((stock) => {
        console.log(stock)

        //FILTRADO DE OBJETOS SEGUN CATEGORIA
        const stockComedor = stock.filter((item) => item.categoria === "Comedor");
        const stockDormitorio = stock.filter((item) => item.categoria === "Dormitorio");
        const stockLiving = stock.filter((item) => item.categoria === "Living");
        const stockDestacados = stock.filter((item) => item.destacado === "si");

        let inicio = document.querySelector('#btn-inicio')
        let btnComedor = document.querySelector('#btn-comedor')
        let btnLiving = document.querySelector('#btn-living')
        let btnDormitorio = document.querySelector('#btn-dormitorio')
        let btnVerTodo = document.querySelector('#btn-ver-todo')
        let btnFinCompra = document.querySelector('#finalizar-compra')


        let carrito = [];
        const divisa = '$';
        const DOMitems = document.querySelector('#items');
        const DOMcarrito = document.querySelector('#carrito');
        const DOMtotal = document.querySelector('#total');
        const DOMbotonVaciar = document.querySelector('#boton-vaciar');
        const miLocalStorage = window.localStorage;
        const productContainer = document.querySelector('.product-container');
        const mainContainer = document.querySelector('.main-container');

        // FUNCION PARA VISUALIZAR PRODUCTOS
        function renderizarProductos(categoriaProductos) {
            categoriaProductos.forEach((producto) => {
                // Estructura
                const artclContainer = document.createElement('div');
                artclContainer.classList.add('card', 'total-carrito');
                // Body
                const artclCardBody = document.createElement('div');
                artclCardBody.classList.add('card-body');
                // Div con nombre y categoria
                const divtitle = document.createElement('div');
                divtitle.classList.add('card-main');
                // Titulo
                const h3tipo = document.createElement('h3');
                h3tipo.classList.add('card-title');
                h3tipo.textContent = `${producto.tipo}`;
                //Descripcion
                const artclNombre = document.createElement('h4');
                artclNombre.classList.add('card-name');
                artclNombre.textContent = `${producto.nombre}`;
                // Precio
                const artclPrecio = document.createElement('p');
                artclPrecio.classList.add('card-price');
                artclPrecio.textContent = `${divisa} ${producto.precio}`;
                // Imagen
                const img = document.createElement('img');
                img.src = producto.foto;
                img.classList.add('card-img');

                // Boton 
                const addArtclBoton = document.createElement('button');
                addArtclBoton.classList.add('add-btn', 'btn-primary');
                addArtclBoton.textContent = 'Comprar';
                addArtclBoton.setAttribute('marcador', producto.id);
                addArtclBoton.addEventListener('click', agregarAlCarrito);
                addArtclBoton.addEventListener('click', alertaCarrito);

                // DOM
                artclCardBody.appendChild(img);
                divtitle.appendChild(h3tipo);
                divtitle.appendChild(artclNombre);
                artclCardBody.appendChild(divtitle);
                artclCardBody.appendChild(artclPrecio);
                artclCardBody.appendChild(addArtclBoton);
                artclContainer.appendChild(artclCardBody);
                DOMitems.appendChild(artclContainer);
            });
        }


        // FUNCION PARA VISUALIZAR PRODUCTOS FILTRADOS
        function productosFiltrados(item) {
            productContainer.innerHTML = '';

            const h3List = document.querySelectorAll('h3');
            const h4List = document.querySelectorAll('h4');

            // Remove all h3 and h4 elements
            h3List.forEach((h3) => h3.remove());
            h4List.forEach((h4) => h4.remove());

            const h3 = document.createElement('h3');
            const h4 = document.createElement('h4');
            h3.textContent = 'Productos';

            switch (item) {
                case stockDestacados:
                    h4.textContent = 'DESTACADOS';
                    break;
                case stockDormitorio:
                    h4.textContent = 'DORMITORIO';
                    break;
                case stockComedor:
                    h4.textContent = 'COMEDOR';
                    break;
                case stockLiving:
                    h4.textContent = 'LIVING';
                    break;
                default:
                    h3.textContent = 'Todos los ';
                    h4.textContent = 'Productos';
                    break;
            }

            if (h4.textContent) {
                mainContainer.appendChild(h3);
                mainContainer.appendChild(h4);
            }

            renderizarProductos(item);
        }

        // FUNCION PARA ANADIR UN PRODUCTO AL CARRITO
        function agregarAlCarrito(e) {
            carrito.push(e.target.getAttribute('marcador'))
            renderizarCarrito();
            guardarCarritoEnLocalStorage();
        }

        function alertaCarrito() {
            Toastify({
                text: "Producto añadido correctamente",
                gravity: "bottom",
                position: "right",
                duration: 3000,
            }).showToast();
        }

        // FUNCION PARA CONTAR PRODUCTOS TOTALES DEL CARRITO
        function contarProductos() {
            let contadorDeProductos = document.querySelector('#contador-productos')
            let totalProductos = carrito.length;

            contadorDeProductos.innerText = totalProductos;
        }

        //FUNCION PARA VISUALIZAR EL CARRITO Y SU CONTENIDO 
        function renderizarCarrito() {

            DOMcarrito.textContent = '';

            const carritoSinDuplicados = [...new Set(carrito)];

            carritoSinDuplicados.forEach((item) => {
                const miItem = stock.filter((itemStock) => {
                    return itemStock.id === parseInt(item);
                });
                const numeroUnidadesItem = carrito.reduce((total, itemId) => {
                    return itemId === item ? total += 1 : total;
                }, 0);

                const cardCarrito = document.createElement('li');
                cardCarrito.classList.add('card-carrito');

                cardCarrito.innerHTML = `
        <div class='cart-name'>
            <div class='cart-div'>
                <h3 class='cart-title'>${miItem[0].tipo}</h3>
                <h3 class='cart-title' id='cart-title-name'>${miItem[0].nombre}</h3>
            </div>
            <h4 class="cart-quantity cart-title"> x ${numeroUnidadesItem} </h4>
        </div>

        <h4 class="cart-price cart-title"> $ ${miItem[0].precio}</h4>`

                // Boton de borrar
                const removebtn = document.createElement('button');
                removebtn.classList.add('btn', 'btn-eliminar');
                removebtn.innerHTML = `<img class="img-tacho" id="${item}" src=./icons/tacho.svg alt="">`;
                removebtn.id = item;
                removebtn.addEventListener('click', borrarItemCarrito);

                cardCarrito.appendChild(removebtn);
                DOMcarrito.appendChild(cardCarrito);
            });

            DOMtotal.textContent = calcularTotal();

            contarProductos()
        }


        //FUNCION PARA BORRAR ITEMS DEL CARRITO
        function borrarItemCarrito(e) {
            const id = e.target.id;
            carrito = carrito.filter((carritoId) => {
                return carritoId !== id;
            });
            renderizarCarrito();
            guardarCarritoEnLocalStorage();
        }

        //FUNCION PARA CALCULAR TOTAL DEL CARRITO
        function calcularTotal() {
            return carrito.reduce((total, item) => {
                const artclItem = stock.filter((itemStock) => {
                    return itemStock.id === parseInt(item);
                });
                return total + artclItem[0].precio;
            }, 0).toFixed(2);
        }

        //FUNCION PARA VACIAR EL CARRITO ENTERO
        function vaciarCarrito() {

            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
            })

            swalWithBootstrapButtons.fire({
                title: '¿Estás seguro que quieres vaciar tu carrito?',
                text: "Una vez lo hagas, no podrás deshacerlo",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, vaciar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    carrito = [];
                    renderizarCarrito();
                    localStorage.clear();
                    swalWithBootstrapButtons.fire(
                        'Tu carrito está vacío',
                        'Puedes volver a llenarlo cuando quieras',
                    )
                } else if (
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire(
                        'Cancelado'
                    )
                }
            })

        }

        //FUNCION ALERTA FINALIZAR COMPRA
        function finalizarCompra() {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Muchas gracias por elegirnos',
                text: "Tu compra ha sido procesada correctamente",
                showConfirmButton: false,
                timer: 2000
            })
        }

        //FUNCION PARA GUARDAR EL CARRITO EN EL LOCAL STORAGE
        function guardarCarritoEnLocalStorage() {
            miLocalStorage.setItem('carrito', JSON.stringify(carrito));
        }

        //FUNCION PARA TRAER EL CARRITO DEL LOCAL STORAGE
        function cargarCarritoDeLocalStorage() {
            if (miLocalStorage.getItem('carrito') !== null) {
                carrito = JSON.parse(miLocalStorage.getItem('carrito'));
            }
        }

        // Eventos

        DOMbotonVaciar.addEventListener('click', vaciarCarrito);
        btnFinCompra.addEventListener('click', finalizarCompra);

        inicio.addEventListener('click', () => productosFiltrados(stockDestacados));
        btnVerTodo.addEventListener('click', () => productosFiltrados(stock));
        btnComedor.addEventListener('click', () => productosFiltrados(stockComedor));
        btnLiving.addEventListener('click', () => productosFiltrados(stockLiving));
        btnDormitorio.addEventListener('click', () => productosFiltrados(stockDormitorio));




        // Inicio
        productosFiltrados(stockDestacados)
        cargarCarritoDeLocalStorage();
        renderizarCarrito();

    })
    .catch((error) => console.error(error))







