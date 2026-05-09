package com.acadly.backend.controller;

import com.acadly.backend.entity.Tarea;
import com.acadly.backend.service.TareaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tareas")
public class TareaController {

    private final TareaService service;

    public TareaController(TareaService service) {
        this.service = service;
    }

    //  CREAR
    @PostMapping("/{cursoId}")
    public Tarea crear(
            @PathVariable Long cursoId,
            @RequestBody Tarea tarea
    ) {
        return service.crear(cursoId, tarea);
    }

    // TODOS
    @GetMapping
    public List<Tarea> getAll() {
        return service.obtenerTodos();
    }

    // POR ID
    @GetMapping("/{id}")
    public Tarea getById(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    // POR CURSO
    @GetMapping("/curso/{cursoId}")
    public List<Tarea> getByCurso(@PathVariable Long cursoId) {
        return service.obtenerPorCurso(cursoId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Tarea actualizar(
            @PathVariable Long id,
            @RequestBody Tarea tarea
    ) {
        return service.actualizar(id, tarea);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        service.eliminar(id);

        return "Tarea eliminada correctamente";
    }
}