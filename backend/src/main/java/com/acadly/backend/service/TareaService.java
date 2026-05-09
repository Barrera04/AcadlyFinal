package com.acadly.backend.service;

import com.acadly.backend.entity.Curso;
import com.acadly.backend.entity.Tarea;
import com.acadly.backend.repository.CursoRepository;
import com.acadly.backend.repository.TareaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TareaService {

    private final TareaRepository tareaRepo;
    private final CursoRepository cursoRepo;

    public TareaService(
            TareaRepository tareaRepo,
            CursoRepository cursoRepo
    ) {
        this.tareaRepo = tareaRepo;
        this.cursoRepo = cursoRepo;
    }

    // CREAR
    public Tarea crear(Long cursoId, Tarea tarea) {

        Curso curso = cursoRepo.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        tarea.setCurso(curso);

        return tareaRepo.save(tarea);
    }

    // TODOS
    public List<Tarea> obtenerTodos() {
        return tareaRepo.findAll();
    }

    // POR ID
    public Tarea obtenerPorId(Long id) {
        return tareaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    }

    // POR CURSO
    public List<Tarea> obtenerPorCurso(Long cursoId) {
        return tareaRepo.findByCursoId(cursoId);
    }

    //  UPDATE
    public Tarea actualizar(Long id, Tarea datos) {

        Tarea tarea = tareaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tarea.setTitulo(datos.getTitulo());
        tarea.setDescripcion(datos.getDescripcion());
        tarea.setFechaLimite(datos.getFechaLimite());
        tarea.setEstado(datos.getEstado());
        tarea.setPrioridad(datos.getPrioridad());

        return tareaRepo.save(tarea);
    }

    // DELETE
    public void eliminar(Long id) {

        Tarea tarea = tareaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tareaRepo.delete(tarea);
    }
}