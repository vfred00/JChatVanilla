const contenedorBotones = document.querySelector('#botones');
const nombreUsuario = document.querySelector('#nombre-usuario');
const areaChat = document.querySelector('#area-chat');
const formulario = document.querySelector('#formulario');

const botonIngresar = `<button class="btn btn btn-success mr-2" id="botonIngresar">Ingresar</button>`;
const botonSalir = `<button class="btn btn btn-danger mr-2" id="botonSalir">Salir</button>`;
const contenedorMensaje = `<input id="mensaje" type="text" class="form-control" placeholder="Escribe un mensaje...">      
        <button type="submit" class="btn btn-dark bg-danger">Enviar</button>`;

// observable de firebase para saber cuando un usuario se ha registrado 
firebase.auth().onAuthStateChanged(usuario => {
  if (usuario) {
    añadir(contenedorBotones, botonSalir);
    añadir(formulario, contenedorMensaje);
    guardarMensaje(formulario, usuario);
    añadirEvento('#botonSalir');
    formulario.classList.remove('d-none');
    areaChat.classList.remove('d-none');
  } else {
    añadir(contenedorBotones, botonIngresar);
    añadirEvento('#botonIngresar');
    formulario.classList.add('d-none');
    areaChat.classList.add('d-none');
  }
});

const añadir = (contenedor, contenido) => {
  contenedor.innerHTML = contenido;
};

const guardarMensaje = (formulario, usuario) => {
  const mensaje = document.querySelector('#mensaje');
  formulario.addEventListener('submit', (e) => {
    e.preventDefault(); // no se actualice y haga la peticion en get 

    if (mensaje.value.trim()) {
      firebase.firestore().collection('jchat').add({
        mensaje: mensaje.value,
        uid: usuario.uid,
        fecha: `${new Date().getHours()}: ${new Date().getMinutes()}`,
        tiempo: Date.now()
      });
    }
    mensaje.value = ' ';
  });

  console.log('mostrar mensaje');
  mostrarMensaje(usuario);
}

const mostrarMensaje = usuario => {
  firebase.firestore().collection('jchat').orderBy('tiempo').onSnapshot(a => {
    areaChat.innerHTML = ' ';
    a.forEach(i => {
      const detalles = {
        area: '#area-chat',
        mensaje: i.data().mensaje,
        fecha: i.data().fecha,
        lado: ' '
      };
      if (i.data().uid === usuario.uid) {
        detalles.lado = 'justify-content-end';
        añadirContenido(detalles);
        console.log('end');
      } else {
        detalles.lado = 'justify-content-start';
        añadirContenido(detalles);
        console.log('start');
      }
      // console.log(`usuario.uid ${usuario.uid} y i.data().uid ${i.data().uid}`);
      areaChat.scrollTop = areaChat.scrollHeight;
    });
  })
}

const añadirContenido = (detalles) => {
  document.querySelector(detalles.area).innerHTML += `<div class="d-flex ${detalles.lado} align-items-center mb-2"> <span class="mr-2" style="font-size: .2em; color: black;"> ${detalles.fecha}</span> <span class="badge badge-dark" style="font-size: 1.2em;"> ${detalles.mensaje} </span></div>`;
}

const añadirEvento = id => {
  const boton = document.querySelector(id);
  if (id == '#botonIngresar') {
    boton.addEventListener('click', async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithPopup(provider);        
      } catch (error) {        
      }
    });
  } else {
    boton.addEventListener('click', () => {
      firebase.auth().signOut();
    });
  }
}