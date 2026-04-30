import { request } from "../../shared/js/api";
import { validarCorreo,limpiarError,mostrarError } from "../../shared/js/utils";
import { guardaUsuario } from "../../shared/js/storage.js";

const form  = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const error = document.getElementById('errormessange');
const boton = document.getElementById('button-primary');

form.addEventListener("submit",async function(e) {
    e.preventDefault()
    limpiarError()
    const correo = email.value.trim()
    const clave = password.value.trim()
    if(!validarCorreo(correo)){
        mostrarError(error,"correo invalido");
        return;
    }
    
})