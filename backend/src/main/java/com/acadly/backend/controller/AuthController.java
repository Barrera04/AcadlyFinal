package com.acadly.backend.controller;

import com.acadly.backend.entity.Usuario;
import com.acadly.backend.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService service;

    public AuthController(UsuarioService service) {
        this.service = service;
    }

    // REGISTER
    @PostMapping("/register")
    public Usuario register(@RequestBody Usuario usuario) {
        return service.registrar(usuario);
    }

    // LOGIN
    @PostMapping("/login")
    public Usuario login(@RequestBody Usuario usuario) {

        return service.login(
                usuario.getEmail(),
                usuario.getPassword()
        );
    }
}