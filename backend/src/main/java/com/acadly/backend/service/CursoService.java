package com.acadly.backend.service;

import com.acadly.backend.entity.Curso;
import com.acadly.backend.entity.Usuario;
import com.acadly.backend.repository.CursoRepository;
import com.acadly.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CursoService {

    private final CursoRepository cursoRepo;
    private final UsuarioRepository usuarioRepo;

    public CursoService(
            CursoRepository cursoRepo,
            UsuarioRepository usuarioRepo
    ) {
        this.cursoRepo = cursoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    // CREAR
    public Curso crear(Long usuarioId, Curso curso) {

        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        curso.setUsuario(usuario);

        return cursoRepo.save(curso);
    }

    // TODOS
    public List<Curso> obtenerTodos() {
        return cursoRepo.findAll();
    }

    // POR ID
    public Curso obtenerPorId(Long id) {
        return cursoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    }

    // POR USUARIO
    public List<Curso> obtenerPorUsuario(Long usuarioId) {
        return cursoRepo.findByUsuarioId(usuarioId);
    }

    // ✏UPDATE
    public Curso actualizar(Long id, Curso datos) {

        Curso curso = cursoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        curso.setNombre(datos.getNombre());
        curso.setDescripcion(datos.getDescripcion());
        curso.setColor(datos.getColor());

        return cursoRepo.save(curso);
    }

    // DELETE
    public void eliminar(Long id) {

        Curso curso = cursoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        cursoRepo.delete(curso);
    }
}