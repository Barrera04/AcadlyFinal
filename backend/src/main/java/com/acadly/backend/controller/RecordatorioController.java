package com.acadly.backend.controller;

import com.acadly.backend.entity.Recordatorio;
import com.acadly.backend.service.RecordatorioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recordatorios")
public class RecordatorioController {

    private final RecordatorioService service;

    public RecordatorioController(RecordatorioService service) {
        this.service = service;
    }

    // CREAR
    @PostMapping("/{tareaId}")
    public Recordatorio crear(
            @PathVariable Long tareaId,
            @RequestBody Recordatorio recordatorio
    ) {
        return service.crear(tareaId, recordatorio);
    }

    // TODOS
    @GetMapping
    public List<Recordatorio> getAll() {
        return service.obtenerTodos();
    }

    // POR ID
    @GetMapping("/{id}")
    public Recordatorio getById(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    // POR TAREA
    @GetMapping("/tarea/{tareaId}")
    public List<Recordatorio> getByTarea(@PathVariable Long tareaId) {
        return service.obtenerPorTarea(tareaId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Recordatorio actualizar(
            @PathVariable Long id,
            @RequestBody Recordatorio recordatorio
    ) {
        return service.actualizar(id, recordatorio);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        service.eliminar(id);

        return "Recordatorio eliminado correctamente";
    }
}