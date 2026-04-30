import { remove } from "../../../../Backend/src/models/guardian.model"

export function guardaUsuario(){
    localStorage.setItem("usuario",JSON.stringify(usuario))
}
export function obtenerUsuario(){
return JSON.parse(localStorage.getItem("usuario"))
}
export function cerrarseccion(){
    localStorage.removeItem("usuario")}