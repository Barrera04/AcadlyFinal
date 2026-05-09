package com.acadly.backend.controller;

import com.acadly.backend.entity.Horario;
import com.acadly.backend.service.HorarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/horarios")
public class HorarioController {

    private final HorarioService service;

    public HorarioController(HorarioService service) {
        this.service = service;
    }

    // CREAR
    @PostMapping("/{cursoId}")
    public Horario crear(
            @PathVariable Long cursoId,
            @RequestBody Horario horario
    ) {
        return service.crear(cursoId, horario);
    }

    // TODOS
    @GetMapping
    public List<Horario> getAll() {
        return service.obtenerTodos();
    }

    // POR ID
    @GetMapping("/{id}")
    public Horario getById(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    // POR CURSO
    @GetMapping("/curso/{cursoId}")
    public List<Horario> getByCurso(@PathVariable Long cursoId) {
        return service.obtenerPorCurso(cursoId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Horario actualizar(
            @PathVariable Long id,
            @RequestBody Horario horario
    ) {
        return service.actualizar(id, horario);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        service.eliminar(id);

        return "Horario eliminado correctamente";
    }
}