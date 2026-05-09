package com.acadly.backend.controller;

import com.acadly.backend.entity.Curso;
import com.acadly.backend.service.CursoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    private final CursoService service;

    public CursoController(CursoService service) {
        this.service = service;
    }

    // CREAR CURSO
    @PostMapping("/{usuarioId}")
    public Curso crear(
            @PathVariable Long usuarioId,
            @RequestBody Curso curso
    ) {
        return service.crear(usuarioId, curso);
    }

    // TODOS
    @GetMapping
    public List<Curso> getAll() {
        return service.obtenerTodos();
    }

    //  POR ID
    @GetMapping("/{id}")
    public Curso getById(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    // POR USUARIO
    @GetMapping("/usuario/{usuarioId}")
    public List<Curso> getByUsuario(@PathVariable Long usuarioId) {
        return service.obtenerPorUsuario(usuarioId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Curso actualizar(
            @PathVariable Long id,
            @RequestBody Curso curso
    ) {
        return service.actualizar(id, curso);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        service.eliminar(id);

        return "Curso eliminado correctamente";
    }
}