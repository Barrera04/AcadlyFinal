package com.acadly.backend.service;

import com.acadly.backend.entity.Usuario;
import com.acadly.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;

    public UsuarioService(UsuarioRepository repo) {
        this.repo = repo;
    }

    // REGISTRAR
    public Usuario registrar(Usuario usuario) {

        boolean existe = repo.findByEmail(usuario.getEmail()).isPresent();

        if (existe) {
            throw new RuntimeException("El email ya está registrado");
        }

        return repo.save(usuario);
    }

    // LOGIN
    public Usuario login(String email, String password) {

        Usuario usuario = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.getPassword().equals(password)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return usuario;
    }

    // TODOS
    public List<Usuario> obtenerTodos() {
        return repo.findAll();
    }

    // POR ID
    public Usuario obtenerPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // UPDATE
    public Usuario actualizar(Long id, Usuario datos) {

        Usuario usuario = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(datos.getNombre());
        usuario.setEmail(datos.getEmail());
        usuario.setPassword(datos.getPassword());
        usuario.setFotoUrl(datos.getFotoUrl());

        return repo.save(usuario);
    }

    // DELETE
    public void eliminar(Long id) {

        Usuario usuario = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        repo.delete(usuario);
    }
}