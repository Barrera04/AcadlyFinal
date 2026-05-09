package com.acadly.backend.controller;

import com.acadly.backend.entity.Usuario;
import com.acadly.backend.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // TODOS
    @GetMapping
    public List<Usuario> getAll() {
        return service.obtenerTodos();
    }

    // POR ID
    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Usuario actualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario
    ) {
        return service.actualizar(id, usuario);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        service.eliminar(id);

        return "Usuario eliminado correctamente";
    }
}